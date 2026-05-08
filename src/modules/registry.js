/* ═══════════════════════════════════════════
   Module Registry – Plugin Architecture
   ═══════════════════════════════════════════ */

import { THEMES } from './themes'
import { FEATURE_LIST } from './features'
import { PROVIDERS } from './providers'
import { LANGUAGES } from './languages'

const MODULE_TYPES = {
  PROVIDER: 'provider',
  LANGUAGE: 'language',
  FEATURE: 'feature',
  THEME: 'theme',
}

/* ── Build default module list from all module types ── */
export const DEFAULT_MODULES = [
  // AI Provider Modules
  ...PROVIDERS.map(p => ({
    id: `provider:${p.id}`,
    type: MODULE_TYPES.PROVIDER,
    name: p.name,
    description: p.hint || p.name,
    icon: getProviderIcon(p.id),
    enabled: true,
    providerId: p.id,
  })),
  // Feature Modules
  ...FEATURE_LIST.map(f => ({
    ...f,
    enabled: f.enabled !== false,
  })),
  // Theme Modules
  ...THEMES.map(t => ({
    id: `theme:${t.id}`,
    type: MODULE_TYPES.THEME,
    name: t.name,
    description: `${t.name} Theme`,
    icon: t.icon || '🎨',
    enabled: true,
    themeId: t.id,
  })),
  // Language Modules
  ...LANGUAGES.map(l => ({
    id: `lang:${l.id}`,
    type: MODULE_TYPES.LANGUAGE,
    name: l.name,
    description: `${l.name} Unterstützung`,
    icon: l.icon || '📝',
    enabled: l.id === 'javascript' ? true : false, // only JS enabled by default
    langId: l.id,
  })),
]

function getProviderIcon(id) {
  const icons = { gemini: '🔮', openrouter: '🔗', ollama: '🦙', opencode: '💻' }
  return icons[id] || '🔌'
}

/* ── Persistence ── */
export function loadModuleSettings() {
  try {
    const saved = localStorage.getItem('code_trainer_modules')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch { /* ignore */ }
  return null
}

export function saveModuleSettings(settings) {
  try {
    localStorage.setItem('code_trainer_modules', JSON.stringify(settings))
  } catch { /* ignore */ }
}

export function getModuleState() {
  const saved = loadModuleSettings()
  if (saved) return saved
  const state = {}
  for (const mod of DEFAULT_MODULES) {
    state[mod.id] = mod.enabled
  }
  return state
}

export function toggleModule(moduleId) {
  const state = getModuleState()
  state[moduleId] = !state[moduleId]
  saveModuleSettings(state)
  return state
}

export function getEnabledProviders() {
  const state = getModuleState()
  return PROVIDERS
    .filter(p => state[`provider:${p.id}`] !== false)
    .map(p => p.id)
}

export function isFeatureEnabled(featureId) {
  const state = getModuleState()
  const id = featureId.startsWith('feature:') ? featureId : `feature:${featureId}`
  return state[id] !== false
}

export function getModulesByType() {
  const state = getModuleState()
  const providers = DEFAULT_MODULES.filter(m => m.type === MODULE_TYPES.PROVIDER)
  const features = DEFAULT_MODULES.filter(m => m.type === MODULE_TYPES.FEATURE)
  const themes = DEFAULT_MODULES.filter(m => m.type === MODULE_TYPES.THEME)
  const languages = DEFAULT_MODULES.filter(m => m.type === MODULE_TYPES.LANGUAGE)
  return { providers, features, languages, themes }
}
