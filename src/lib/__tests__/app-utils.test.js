import { describe, it, expect, beforeEach } from 'vitest'
import { buildPluginState, getEnabledDatasetNames } from '../app-utils'
import { mockLocalStorage, installMockLocalStorage } from '../../test-utils'

const localStorageMock = mockLocalStorage()
installMockLocalStorage(localStorageMock)

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
