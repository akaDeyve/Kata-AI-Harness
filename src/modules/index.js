/* ═══════════════════════════════════════════
   Central Module Registry
   All modules are discoverable here.
   ═══════════════════════════════════════════ */

// Providers
export { PROVIDERS, PROVIDER_REGISTRY, DEFAULT_PROVIDER, getProviderHandler } from './providers'

// Themes
export { THEMES, THEME_REGISTRY, DEFAULT_THEME, applyTheme, loadTheme } from './themes'

// Features
export { FEATURE_LIST, getFeature } from './features'

// Languages
export { LANGUAGES, LANGUAGE_REGISTRY, DEFAULT_LANGUAGE, getLanguageConfig } from './languages'

// Module Registry (enable/disable)
export {
  DEFAULT_MODULES,
  getModuleState,
  saveModuleSettings,
  toggleModule,
  getModulesByType,
  getEnabledProviders,
  getEnabledDatasets,
  isFeatureEnabled,
} from './registry'

// Task Data
export { TASKDATASETS, getTasksForDatasets, getDataset } from './taskdata'
