/**
 * @typedef {Object} HarnessPlugin
 * @property {string} id - Unique plugin identifier (e.g. 'plugin:javascript')
 * @property {'language'|'aiProvider'|'feature'|'theme'|'panel'} type
 * @property {string} name - Display name
 * @property {string} [description]
 * @property {string} [version]
 * @property {string} [author]
 * @property {string[]} [activationEvents] - Events that activate this plugin (e.g. 'onLanguage:javascript')
 * @property {Object} [contributes] - What this plugin contributes
 * @property {string[]} [contributes.languages] - Language IDs this plugin provides
 * @property {string[]} [contributes.aiProviders] - AI provider IDs
 * @property {string[]} [contributes.panels] - Panel IDs
 * @property {string[]} [contributes.themes] - Theme IDs
 * @property {string[]} [contributes.features] - Feature IDs
 * @property {function} activate - Called when plugin is activated
 * @property {function} [deactivate] - Called when plugin is deactivated
 */

/**
 * @typedef {Object} PluginContext
 * @property {function} getEditorState - Get current editor state
 * @property {function} setEditorState - Update editor state
 * @property {function} onEvent - Subscribe to events
 * @property {function} emitEvent - Emit an event
 * @property {function} getUI - Access UI slots
 * @property {function} registerCommand - Register a command
 * @property {function} executeCommand - Execute a command
 * @property {function} getConfig - Get plugin config
 * @property {function} setConfig - Set plugin config
 * @property {Object} storage - Persistent storage for this plugin
 */

/**
 * @typedef {Object} LanguagePlugin
 * @property {string} id - Language ID (e.g. 'javascript', 'python')
 * @property {string} name - Display name
 * @property {string[]} [extensions] - File extensions
 * @property {string} [icon] - Icon component or emoji
 * @property {string} defaultStarter - Default starter code
 * @property {function} [validate] - Code validation function
 * @property {function} [getCompletion] - Autocomplete provider
 */

/**
 * @typedef {Object} AIProviderPlugin
 * @property {string} id - Provider ID (e.g. 'gemini', 'openrouter')
 * @property {string} name - Display name
 * @property {string} [defaultUrl] - Default API URL
 * @property {string} [defaultModel] - Default model
 * @property {boolean} needsKey - Whether an API key is required
 * @property {boolean} [recommended] - Whether this is the recommended default
 * @property {string} [hint] - Setup hint for users
 * @property {function} call - Main API call function: (config, system, user) => Promise<string>
 * @property {string[]} [models] - List of supported models
 */

/**
 * @typedef {Object} ThemePlugin
 * @property {string} id - Theme ID
 * @property {string} name - Display name
 * @property {string} [icon] - Icon component or emoji
 * @property {Object.<string, string>} vars - CSS variable map
 */

/**
 * @typedef {Object} FeaturePlugin
 * @property {string} id - Feature ID
 * @property {string} name - Display name
 * @property {string} description
 * @property {string} [icon]
 * @property {boolean} [enabled] - Default enabled state
 * @property {function} [init] - Initialize the feature
 * @property {React.Component} [component] - Optional React component
 */

export {};
