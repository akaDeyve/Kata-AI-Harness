/* ═══════════════════════════════════════════════════════
   Plugin Scanner – Discovers @harness/* plugins
   from node_modules or local packages.
   ═══════════════════════════════════════════════════════ */

/**
 * Scan a list of module objects for harness plugin manifests.
 * In a Vite/bundler context, this is typically called with
 * an import.meta.glob result or explicit imports.
 *
 * For production builds, plugins are explicitly imported.
 * This scanner validates the manifest shape and returns
 * ready-to-register plugin descriptors.
 *
 * @param {Array<{manifest: Object, module: Object}>} pluginEntries
 * @returns {Array<import('./types.js').HarnessPlugin>}
 */
export function scanPlugins(pluginEntries) {
  const plugins = []

  for (const entry of pluginEntries) {
    const { manifest, module } = entry
    const harness = manifest.harness || manifest['@harness']
    if (!harness) continue

    const plugin = {
      id: harness.id || `plugin:${manifest.name?.replace(/^@harness\//, '') || ''}`,
      name: manifest.name || 'Unknown Plugin',
      version: manifest.version || '0.0.0',
      type: harness.type || 'feature',
      description: manifest.description || '',
      activationEvents: harness.activationEvents || [],
      contributes: harness.contributes || {},
      activate: module.activate || (() => module),
      deactivate: module.deactivate,
    }

    plugins.push(plugin)
  }

  return plugins
}

/**
 * Build a scanner that reads harness config from package.json objects.
 * Useful for bundler-time plugin discovery.
 *
 * @example
 * // const plugins = scanFromGlob(import.meta.glob result)
 *
 * @param {Object.<string, {default?: Object}>} globResult
 * @returns {Array<{manifest: Object, module: Object}>}
 */
export function scanFromGlob(globResult) {
  const entries = []
  for (const [path, mod] of Object.entries(globResult)) {
    const manifest = mod.default || mod
    if (manifest.harness || manifest['@harness']) {
      entries.push({ manifest, module: mod })
    }
  }
  return entries
}

/**
 * Runtime scanner: reads plugin config from localStorage or a config file.
 * Returns the list of enabled plugin IDs.
 *
 * @param {string} [storageKey] - localStorage key (default: 'harness_enabled_plugins')
 * @returns {string[]}
 */
export function getEnabledPluginIds(storageKey = 'harness_enabled_plugins') {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Save the list of enabled plugin IDs.
 *
 * @param {string[]} pluginIds
 * @param {string} [storageKey]
 */
export function saveEnabledPluginIds(pluginIds, storageKey = 'harness_enabled_plugins') {
  try {
    localStorage.setItem(storageKey, JSON.stringify(pluginIds))
  } catch {
    /* ignore */
  }
}

/**
 * Toggle a single plugin's enabled state.
 *
 * @param {string} pluginId
 * @param {string} [storageKey]
 * @returns {string[]} - Updated list of enabled plugin IDs
 */
export function togglePlugin(pluginId, storageKey = 'harness_enabled_plugins') {
  const enabled = getEnabledPluginIds(storageKey)
  const idx = enabled.indexOf(pluginId)
  if (idx >= 0) {
    enabled.splice(idx, 1)
  } else {
    enabled.push(pluginId)
  }
  saveEnabledPluginIds(enabled, storageKey)
  return enabled
}
