/* ═══════════════════════════════════════════════════════
   Plugin Registry – Load, Activate, Deactivate, Query
   Manages the full lifecycle of harness plugins.
   ═══════════════════════════════════════════════════════ */

/** @typedef {import('./types.js').HarnessPlugin} HarnessPlugin */

class PluginRegistry {
  constructor() {
    /** @type {Map<string, HarnessPlugin>} */
    this._plugins = new Map()
    /** @type {Set<string>} */
    this._active = new Set()
    /** @type {Map<string, any>} */
    this._pluginInstances = new Map()
  }

  /**
   * Register a plugin (does not activate it yet).
   * @param {HarnessPlugin} plugin
   */
  register(plugin) {
    if (this._plugins.has(plugin.id)) {
      console.warn(`[PluginRegistry] Plugin "${plugin.id}" already registered, skipping.`)
      return
    }
    this._plugins.set(plugin.id, plugin)
  }

  /**
   * Register multiple plugins at once.
   * @param {HarnessPlugin[]} plugins
   */
  registerMany(plugins) {
    for (const p of plugins) this.register(p)
  }

  /**
   * Activate a plugin by ID.
   * @param {string} pluginId
   * @param {import('./context.js').PluginContext} context
   * @returns {any} The activated plugin instance
   */
  async activate(pluginId, context) {
    const plugin = this._plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin "${pluginId}" not found in registry.`)
    if (this._active.has(pluginId)) return this._pluginInstances.get(pluginId)

    try {
      const instance = plugin.activate ? await plugin.activate(context) : plugin
      this._active.add(pluginId)
      this._pluginInstances.set(pluginId, instance)
      return instance
    } catch (err) {
      console.error(`[PluginRegistry] Failed to activate "${pluginId}":`, err)
      throw err
    }
  }

  /**
   * Activate plugins matching a filter.
   * @param {function(HarnessPlugin): boolean} filter
   * @param {import('./context.js').PluginContext} context
   */
  async activateWhere(filter, context) {
    const results = []
    for (const [, plugin] of this._plugins) {
      if (filter(plugin)) {
        try {
          const instance = await this.activate(plugin.id, context)
          results.push(instance)
        } catch {
          /* skip failed plugins */
        }
      }
    }
    return results
  }

  /**
   * Deactivate a plugin by ID.
   * @param {string} pluginId
   */
  async deactivate(pluginId) {
    const plugin = this._plugins.get(pluginId)
    if (!plugin) return
    if (!this._active.has(pluginId)) return

    try {
      if (plugin.deactivate) {
        await plugin.deactivate(this._pluginInstances.get(pluginId))
      }
      this._active.delete(pluginId)
      this._pluginInstances.delete(pluginId)
    } catch (err) {
      console.error(`[PluginRegistry] Failed to deactivate "${pluginId}":`, err)
    }
  }

  /**
   * Deactivate all plugins.
   */
  async deactivateAll() {
    for (const id of [...this._active]) {
      await this.deactivate(id)
    }
  }

  /**
   * Check if a plugin is active.
   * @param {string} pluginId
   */
  isActive(pluginId) {
    return this._active.has(pluginId)
  }

  /**
   * Get a registered plugin by ID.
   * @param {string} pluginId
   * @returns {HarnessPlugin | undefined}
   */
  get(pluginId) {
    return this._plugins.get(pluginId)
  }

  /**
   * Get the activated instance of a plugin.
   * @param {string} pluginId
   */
  getInstance(pluginId) {
    return this._pluginInstances.get(pluginId)
  }

  /**
   * Get all registered plugins.
   * @returns {HarnessPlugin[]}
   */
  getAll() {
    return [...this._plugins.values()]
  }

  /**
   * Get all active plugin instances.
   * @returns {any[]}
   */
  getActiveInstances() {
    return [...this._active].map(id => this._pluginInstances.get(id)).filter(Boolean)
  }

  /**
   * Query plugins by type.
   * @param {'language'|'aiProvider'|'feature'|'theme'|'panel'} type
   * @param {boolean} [activeOnly]
   * @returns {HarnessPlugin[]}
   */
  queryByType(type, activeOnly = false) {
    const results = []
    for (const [, plugin] of this._plugins) {
      if (plugin.type === type && (!activeOnly || this._active.has(plugin.id))) {
        results.push(plugin)
      }
    }
    return results
  }

  /**
   * Query plugins that contribute a specific category.
   * @param {'languages'|'aiProviders'|'panels'|'themes'|'features'} category
   * @returns {HarnessPlugin[]}
   */
  queryByContribution(category) {
    return this.getAll().filter(p => p.contributes?.[category]?.length > 0)
  }

  /**
   * Get plugin IDs matching an activation event.
   * @param {string} event - e.g. 'onLanguage:javascript'
   * @returns {string[]}
   */
  queryByActivationEvent(event) {
    const ids = []
    for (const [id, plugin] of this._plugins) {
      if (plugin.activationEvents?.includes(event)) {
        ids.push(id)
      }
    }
    return ids
  }

  /**
   * Get count of registered plugins.
   */
  get size() {
    return this._plugins.size
  }

  /**
   * Get count of active plugins.
   */
  get activeCount() {
    return this._active.size
  }
}

export const pluginRegistry = new PluginRegistry()
export { PluginRegistry }
