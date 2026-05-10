/* ═══════════════════════════════════════════════════════
   PluginContext – The API plugins can use to interact
   with the host application (editor, events, UI, etc.)
   ═══════════════════════════════════════════════════════ */

/** @typedef {import('./types.js').PluginContext} PluginContextDef */

class PluginContext {
  constructor(options = {}) {
    /** @type {Map<string, any>} */
    this._editorState = new Map()
    /** @type {Map<string, Set<Function>>} */
    this._eventListeners = new Map()
    /** @type {Map<string, any>} */
    this._uiSlots = new Map()
    /** @type {Map<string, Function>} */
    this._commands = new Map()
    /** @type {Map<string, any>} */
    this._pluginConfigs = new Map()
    /** @type {Map<string, Object>} */
    this._pluginStorage = new Map()
    /** @type {any} */
    this._hostAPI = options.hostAPI || {}
  }

  /* ── Editor State ── */
  getEditorState(key) {
    return key ? this._editorState.get(key) : Object.fromEntries(this._editorState)
  }

  setEditorState(key, value) {
    this._editorState.set(key, value)
    this._emit('editorStateChange', { key, value })
  }

  /* ── Events ── */
  onEvent(eventName, callback) {
    if (!this._eventListeners.has(eventName)) {
      this._eventListeners.set(eventName, new Set())
    }
    this._eventListeners.get(eventName).add(callback)
    return () => this._eventListeners.get(eventName)?.delete(callback)
  }

  emitEvent(eventName, payload) {
    this._emit(eventName, payload)
  }

  _emit(eventName, payload) {
    const listeners = this._eventListeners.get(eventName)
    if (listeners) {
      for (const cb of listeners) {
        try { cb(payload) } catch (e) { console.error(`[PluginContext] Event handler error for "${eventName}":`, e) }
      }
    }
  }

  /* ── UI Slots ── */
  getUI(slotName) {
    return this._uiSlots.get(slotName)
  }

  registerUI(slotName, component) {
    this._uiSlots.set(slotName, component)
    this._emit('uiSlotRegistered', { slotName, component })
  }

  /* ── Commands ── */
  registerCommand(name, handler) {
    this._commands.set(name, handler)
  }

  async executeCommand(name, ...args) {
    const handler = this._commands.get(name)
    if (!handler) throw new Error(`Command "${name}" not found.`)
    return handler(...args)
  }

  /* ── Plugin Config ── */
  getConfig(pluginId, key, defaultValue) {
    const config = this._pluginConfigs.get(pluginId) || {}
    return key ? (config[key] ?? defaultValue) : config
  }

  setConfig(pluginId, keyOrObj, value) {
    const config = this._pluginConfigs.get(pluginId) || {}
    if (typeof keyOrObj === 'string') {
      config[keyOrObj] = value
    } else {
      Object.assign(config, keyOrObj)
    }
    this._pluginConfigs.set(pluginId, config)
    this._emit('configChange', { pluginId, config })
  }

  /* ── Persistent Storage ── */
  getStorage(pluginId) {
    if (!this._pluginStorage.has(pluginId)) {
      this._pluginStorage.set(pluginId, {})
    }
    return this._pluginStorage.get(pluginId)
  }

  setStorage(pluginId, data) {
    this._pluginStorage.set(pluginId, data)
  }

  /* ── Host API Access ── */
  getHostAPI() {
    return this._hostAPI
  }

  /**
   * Create a context snapshot for plugin activation.
   * @param {string} pluginId
   * @returns {PluginContextDef}
   */
  createSnapshot(pluginId) {
    return {
      getEditorState: (key) => this.getEditorState(key),
      setEditorState: (key, value) => this.setEditorState(key, value),
      onEvent: (eventName, callback) => this.onEvent(eventName, callback),
      emitEvent: (eventName, payload) => this.emitEvent(eventName, payload),
      getUI: (slotName) => this.getUI(slotName),
      registerUI: (slotName, component) => this.registerUI(slotName, component),
      registerCommand: (name, handler) => this.registerCommand(name, handler),
      executeCommand: (name, ...args) => this.executeCommand(name, ...args),
      getConfig: (key, defaultValue) => this.getConfig(pluginId, key, defaultValue),
      setConfig: (keyOrObj, value) => this.setConfig(pluginId, keyOrObj, value),
      storage: this.getStorage(pluginId),
    }
  }
}

export { PluginContext }
