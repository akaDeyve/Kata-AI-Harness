/* ═══════════════════════════════════════════════════════
   Plugin Bridge – Connects new @harness/* packages
   with the existing app. Loads all workspace plugins
   and exposes them through a unified API.
   ═══════════════════════════════════════════════════════ */

import { PluginRegistry, PluginContext } from '@harness/core'

// ── Language Plugins ──
import * as pluginJavaScript from '@harness/plugin-javascript'
import * as pluginPython from '@harness/plugin-python'
import * as pluginTypeScript from '@harness/plugin-typescript'

// ── AI Provider Plugins ──
import * as providerGemini from '@harness/provider-gemini'
import * as providerOpenRouter from '@harness/provider-openrouter'
import * as providerOllama from '@harness/provider-ollama'
import * as providerOpenCode from '@harness/provider-opencode'

// ── Feature Plugins ──
import * as featurePreview from '@harness/feature-preview'
import * as featureTasks from '@harness/feature-tasks'
import * as featureGenerate from '@harness/feature-generate'

/**
 * All discovered plugin descriptors with harness manifests.
 */
export const DISCOVERED_PLUGINS = [
  // Languages
  { manifest: { name: '@harness/plugin-javascript', harness: { id: 'plugin:javascript', type: 'language', contributes: { languages: ['javascript'] }, activationEvents: ['onLanguage:javascript'] } }, module: pluginJavaScript },
  { manifest: { name: '@harness/plugin-python', harness: { id: 'plugin:python', type: 'language', contributes: { languages: ['python'] }, activationEvents: ['onLanguage:python'] } }, module: pluginPython },
  { manifest: { name: '@harness/plugin-typescript', harness: { id: 'plugin:typescript', type: 'language', contributes: { languages: ['typescript'] }, activationEvents: ['onLanguage:typescript'] } }, module: pluginTypeScript },
  // Providers
  { manifest: { name: '@harness/provider-gemini', harness: { id: 'provider:gemini', type: 'aiProvider', contributes: { aiProviders: ['gemini'] }, activationEvents: ['onDemand'] } }, module: providerGemini },
  { manifest: { name: '@harness/provider-openrouter', harness: { id: 'provider:openrouter', type: 'aiProvider', contributes: { aiProviders: ['openrouter'] }, activationEvents: ['onDemand'] } }, module: providerOpenRouter },
  { manifest: { name: '@harness/provider-ollama', harness: { id: 'provider:ollama', type: 'aiProvider', contributes: { aiProviders: ['ollama'] }, activationEvents: ['onDemand'] } }, module: providerOllama },
  { manifest: { name: '@harness/provider-opencode', harness: { id: 'provider:opencode', type: 'aiProvider', contributes: { aiProviders: ['opencode'] }, activationEvents: ['onDemand'] } }, module: providerOpenCode },
  // Features
  { manifest: { name: '@harness/feature-preview', harness: { id: 'feature:preview', type: 'feature', contributes: { features: ['preview'] }, activationEvents: ['onStartupFinished'] } }, module: featurePreview },
  { manifest: { name: '@harness/feature-tasks', harness: { id: 'feature:tasks', type: 'feature', contributes: { features: ['tasks'] }, activationEvents: ['onStartupFinished'] } }, module: featureTasks },
  { manifest: { name: '@harness/feature-generate', harness: { id: 'feature:generate', type: 'feature', contributes: { features: ['generate'] }, activationEvents: ['onStartupFinished'] } }, module: featureGenerate },
]

/**
 * Initialize the plugin system: register all discovered plugins,
 * activate the enabled ones, and return the registry + context.
 *
 * @param {Object} [hostAPI] - Host application API exposed to plugins
 * @returns {{ registry: PluginRegistry, context: PluginContext }}
 */
export async function initPlugins(hostAPI = {}) {
  const registry = new PluginRegistry()
  const context = new PluginContext({ hostAPI })

  // Register all discovered plugins
  for (const { manifest, module } of DISCOVERED_PLUGINS) {
    const harness = manifest.harness
    registry.register({
      id: harness.id,
      name: manifest.name,
      type: harness.type,
      contributes: harness.contributes || {},
      activationEvents: harness.activationEvents || [],
      activate: module.activate || (() => module),
      deactivate: module.deactivate,
    })
  }

  // Get enabled plugin IDs from runtime config
  const enabledIds = getEnabledPluginIds()

  // Activate enabled plugins (or all if none configured)
  const pluginsToActivate = enabledIds.length > 0
    ? registry.getAll().filter(p => enabledIds.includes(p.id))
    : registry.getAll()

  for (const plugin of pluginsToActivate) {
    try {
      await registry.activate(plugin.id, context.createSnapshot(plugin.id))
    } catch (err) {
      console.warn(`[PluginBridge] Failed to activate "${plugin.id}":`, err)
    }
  }

  return { registry, context }
}

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

/**
 * Query active plugins by type.
 */
export function queryPlugins(registry, type) {
  return registry.queryByType(type, true)
}

/**
 * Get a plugin instance by ID.
 */
export function getPluginInstance(registry, pluginId) {
  return registry.getInstance(pluginId)
}
