import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildPluginState, getEnabledDatasetNames } from '../app-utils'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('getEnabledDatasetNames', () => {
  it('returns default datasets', () => {
    const names = getEnabledDatasetNames()
    expect(names).toContain('react-hooks')
    expect(names).toContain('css-basics')
    expect(names).toContain('array-ops')
    expect(names).toHaveLength(3)
  })
})

describe('buildPluginState', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('returns state object', () => {
    const state = buildPluginState()
    // Should be an object with plugin IDs as keys
    expect(typeof state).toBe('object')
    expect(Object.keys(state).length).toBeGreaterThan(0)
  })
})
