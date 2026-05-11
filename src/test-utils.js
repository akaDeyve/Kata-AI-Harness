import { vi } from 'vitest'

/**
 * Creates a mock localStorage for testing.
 * Usage in test files:
 *   import { mockLocalStorage } from '../test-utils'
 *   const storage = mockLocalStorage()
 */
export function mockLocalStorage() {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
    __store: store, // for test assertions
  }
}

/**
 * Install a localStorage mock on the global object.
 * Handles both configurable (Node) and non-configurable (jsdom) globals.
 * Call in beforeEach/afterEach to isolate tests.
 */
export function installMockLocalStorage(mock) {
  try {
    Object.defineProperty(global, 'localStorage', {
      value: mock,
      writable: true,
      configurable: true,
    })
  } catch {
    // If defineProperty fails (non-configurable, e.g. jsdom), assign directly
    // Use a property descriptor to make it writable
    try {
      delete global.localStorage
      Object.defineProperty(global, 'localStorage', {
        value: mock,
        writable: true,
        configurable: true,
      })
    } catch {
      // Last resort
      global.localStorage = mock
    }
  }
}
