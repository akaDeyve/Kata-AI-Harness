/* ── Theme Registry – Light-only ── */
import { LIGHT_THEME } from './light'

export const THEME_REGISTRY = {
  light: LIGHT_THEME,
}

export const THEMES = Object.values(THEME_REGISTRY)
export const DEFAULT_THEME = 'light'

/**
 * Apply a theme by setting CSS variables on :root
 */
export function applyTheme(themeId) {
  const theme = THEME_REGISTRY[themeId]
  if (!theme) return
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
  root.setAttribute('data-theme', themeId)
}

/**
 * Load the saved theme (or default)
 */
export function loadTheme() {
  try {
    const saved = localStorage.getItem('code_trainer_theme')
    return saved && THEME_REGISTRY[saved] ? saved : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}
