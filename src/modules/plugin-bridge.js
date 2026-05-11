/* ═══════════════════════════════════════════════════════
   Plugin Bridge – Connects @harness/* packages
   with the existing app. Dynamically discovers plugins
   via Vite's import.meta.glob.
   ═══════════════════════════════════════════════════════ */

/**
 * Dynamically discover all @harness/* plugin packages.
 * New plugins added to packages/ are auto-detected as long as they
 * export a `harness` metadata object from their index file.
 */
function discoverPlugins() {
  const modules = import.meta.glob('/packages/*/src/index.{js,jsx}', { eager: true })
  const plugins = []
  for (const [, mod] of Object.entries(modules)) {
    if (mod.harness) {
      plugins.push({
        manifest: { name: mod.harness.name, harness: mod.harness },
        module: mod,
      })
    }
  }
  return plugins
}

/**
 * All discovered plugin descriptors with harness manifests.
 * Plugins export `harness` metadata → automatically registered.
 */
export const DISCOVERED_PLUGINS = discoverPlugins()

/**
 * All plugin IDs derived from DISCOVERED_PLUGINS.
 */
export const ALL_PLUGIN_IDS = DISCOVERED_PLUGINS.map(p => p.manifest.harness.id)

/**
 * Runtime plugin config – reads/writes enabled plugin IDs.
 * Stored in localStorage as a JSON array.
 */
const PLUGIN_CONFIG_KEY = 'harness_disabled_plugins'

export function getEnabledPluginIds() {
  const disabled = getDisabledPluginIds()
  return ALL_PLUGIN_IDS.filter(id => !disabled.includes(id))
}

export function getDisabledPluginIds() {
  try {
    const raw = localStorage.getItem(PLUGIN_CONFIG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDisabledPluginIds(pluginIds) {
  try {
    localStorage.setItem(PLUGIN_CONFIG_KEY, JSON.stringify(pluginIds))
  } catch {
    /* ignore */
  }
}

export function saveEnabledPluginIds(enabledIds) {
  // Convert enabled list to disabled list for storage
  const disabled = ALL_PLUGIN_IDS.filter(id => !enabledIds.includes(id))
  saveDisabledPluginIds(disabled)
}

export function togglePlugin(pluginId) {
  const disabled = getDisabledPluginIds()
  const idx = disabled.indexOf(pluginId)
  if (idx >= 0) {
    disabled.splice(idx, 1) // Was disabled, now enabled
  } else {
    disabled.push(pluginId) // Was enabled, now disabled
  }
  saveDisabledPluginIds(disabled)
  return !disabled.includes(pluginId) // returns true if now enabled
}

/**
 * Get all plugins grouped by type with their enabled state.
 * Compatible with the old modules/ API.
 *
 * @param {PluginRegistry} registry
 * @returns {{ providers: any[], languages: any[], features: any[] }}
 */
export function getPluginsByType(registry) {
  const all = registry.getAll()
  const enabledIds = getEnabledPluginIds()

  const providers = []
  const languages = []
  const features = []

  for (const plugin of all) {
    const isEnabled = enabledIds.length === 0 || enabledIds.includes(plugin.id)
    const entry = {
      id: plugin.id,
      name: plugin.name,
      type: plugin.type,
      enabled: isEnabled,
      contributes: plugin.contributes,
    }

    switch (plugin.type) {
      case 'aiProvider':
        providers.push(entry)
        break
      case 'language':
        languages.push(entry)
        break
      case 'feature':
        features.push(entry)
        break
    }
  }

  return { providers, languages, features }
}


