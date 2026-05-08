/* ── Language Module Registry ── */
import { JAVASCRIPT_CONFIG } from './javascript'
import { PYTHON_CONFIG } from './python'
import { TYPESCRIPT_CONFIG } from './typescript'

export const LANGUAGE_REGISTRY = {
  javascript: { config: JAVASCRIPT_CONFIG },
  python: { config: PYTHON_CONFIG },
  typescript: { config: TYPESCRIPT_CONFIG },
}

export const LANGUAGES = Object.values(LANGUAGE_REGISTRY).map(({ config }) => config)

export const DEFAULT_LANGUAGE = 'javascript'

export function getLanguageConfig(langId) {
  return LANGUAGE_REGISTRY[langId]?.config || LANGUAGE_REGISTRY[DEFAULT_LANGUAGE].config
}
