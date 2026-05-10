import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage BEFORE importing the module
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

// Import AFTER setting up mock
const { getEnabledPluginIds, saveEnabledPluginIds, togglePlugin, saveDisabledPluginIds, getDisabledPluginIds, ALL_PLUGIN_IDS } = await import('../plugin-bridge')

describe('plugin-bridge', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('ALL_PLUGIN_IDS', () => {
    it('returns an array of plugin IDs', () => {
      expect(Array.isArray(ALL_PLUGIN_IDS)).toBe(true)
      expect(ALL_PLUGIN_IDS.length).toBeGreaterThan(0)
    })

    it('includes provider, language, and feature plugins', () => {
      expect(ALL_PLUGIN_IDS).toContain('provider:gemini')
      expect(ALL_PLUGIN_IDS).toContain('plugin:javascript')
      expect(ALL_PLUGIN_IDS).toContain('feature:preview')
    })
  })

  describe('saveEnabledPluginIds / getEnabledPluginIds', () => {
    it('returns all plugins when no disabled list is stored', () => {
      const ids = getEnabledPluginIds()
      expect(ids.length).toBe(ALL_PLUGIN_IDS.length)
    })

    it('returns correct IDs after saving enabled list', () => {
      saveEnabledPluginIds(['provider:gemini', 'plugin:javascript'])
      const ids = getEnabledPluginIds()
      expect(ids).toContain('provider:gemini')
      expect(ids).toContain('plugin:javascript')
      // Saving an enabled list should disable the rest
      expect(ids).not.toContain('provider:openrouter')
    })
  })

  describe('togglePlugin', () => {
    it('disables a plugin by toggling it', () => {
      const nowEnabled = togglePlugin('feature:preview')
      const disabledIds = getDisabledPluginIds()
      expect(disabledIds).toContain('feature:preview')
      expect(nowEnabled).toBe(false)
    })

    it('re-enables a disabled plugin on second toggle', () => {
      togglePlugin('feature:preview') // disable
      const nowEnabled = togglePlugin('feature:preview') // re-enable
      const disabledIds = getDisabledPluginIds()
      expect(disabledIds).not.toContain('feature:preview')
      expect(nowEnabled).toBe(true)
    })

    it('can toggle multiple plugins independently', () => {
      togglePlugin('feature:preview')
      togglePlugin('provider:ollama')
      const disabledIds = getDisabledPluginIds()
      expect(disabledIds).toContain('feature:preview')
      expect(disabledIds).toContain('provider:ollama')
      expect(disabledIds.length).toBe(2)
    })
  })

  describe('getEnabledPluginIds with disabled list', () => {
    it('returns all when disabled list is empty', () => {
      saveDisabledPluginIds([])
      const ids = getEnabledPluginIds()
      expect(ids.length).toBe(ALL_PLUGIN_IDS.length)
    })

    it('excludes disabled plugins', () => {
      saveDisabledPluginIds(['feature:preview'])
      const ids = getEnabledPluginIds()
      expect(ids).not.toContain('feature:preview')
      expect(ids).toContain('provider:gemini')
      expect(ids).toContain('plugin:javascript')
    })

    it('persists disabled list across calls', () => {
      togglePlugin('feature:tasks')
      togglePlugin('provider:opencode')
      const ids1 = getEnabledPluginIds()
      const ids2 = getEnabledPluginIds()
      expect(ids1).toEqual(ids2)
    })
  })
})
