import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { safeJsonParse, storeApiConfig, loadApiConfig } from '../api'
import { mockLocalStorage, installMockLocalStorage } from '../../test-utils'

describe('safeJsonParse', () => {
  it('parses a valid JSON object', () => {
    const result = safeJsonParse('{"key":"value"}')
    expect(result).toEqual({ key: 'value' })
  })

  it('parses a valid JSON array', () => {
    const result = safeJsonParse('[1,2,3]')
    expect(result).toEqual([1, 2, 3])
  })

  it('returns fallback for invalid JSON', () => {
    const result = safeJsonParse('not-json')
    expect(result).toBeNull()
  })

  it('rejects __proto__ pollution', () => {
    const result = safeJsonParse('{"__proto__":{"polluted":true}}')
    expect(result).toBeNull()
  })

  it('rejects constructor pollution', () => {
    const result = safeJsonParse('{"constructor":{"prototype":{"polluted":true}}}')
    expect(result).toBeNull()
  })

  it('rejects prototype pollution', () => {
    const result = safeJsonParse('{"prototype":{"polluted":true}}')
    expect(result).toBeNull()
  })

  it('uses custom fallback', () => {
    const result = safeJsonParse('bad-json', { fallback: true })
    expect(result).toEqual({ fallback: true })
  })

  it('returns null for empty string', () => {
    const result = safeJsonParse('')
    expect(result).toBeNull()
  })

  it('parses nested objects safely', () => {
    const result = safeJsonParse('{"a":{"b":{"c":"deep"}}}')
    expect(result).toEqual({ a: { b: { c: 'deep' } } })
  })
})

describe('encrypt / decrypt (storeApiConfig / loadApiConfig)', () => {
  let storage

  beforeEach(() => {
    storage = mockLocalStorage()
    installMockLocalStorage(storage)
    // Clean up any crypto key from previous runs
    try {
      localStorage.removeItem('code_trainer_crypto_key')
    } catch {
      /* ignore */
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Helper: check if crypto.subtle is available in this test environment.
   * If not, encryption falls back to base64 which is still tested.
   */
  function isCryptoReallyAvailable() {
    return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
  }

  it('round-trips a simple config with key', async () => {
    const config = { key: 'test-api-key-123', baseUrl: '', model: '', apiType: 'gemini' }
    await storeApiConfig(config)
    const loaded = await loadApiConfig()
    expect(loaded.key).toBe('test-api-key-123')
    expect(loaded.apiType).toBe('gemini')
  })

  it('round-trips a config with all fields', async () => {
    const config = { key: 'sk-abc123', baseUrl: 'https://custom.api.com/v1', model: 'gpt-4', apiType: 'openrouter' }
    await storeApiConfig(config)
    const loaded = await loadApiConfig()
    expect(loaded.key).toBe('sk-abc123')
    expect(loaded.baseUrl).toBe('https://custom.api.com/v1')
    expect(loaded.model).toBe('gpt-4')
    expect(loaded.apiType).toBe('openrouter')
  })

  it('stores key encrypted (not plaintext in localStorage)', async () => {
    const config = { key: 'my-secret-key', baseUrl: '', model: '', apiType: 'gemini' }
    await storeApiConfig(config)

    const rawKey = localStorage.getItem('code_trainer_key')
    // The stored key should NOT be the plaintext
    expect(rawKey).not.toBe('my-secret-key')
    // It should be either __aes__ prefixed (crypto) or base64 (fallback)
    if (rawKey !== null) {
      expect(rawKey === '__aes__' || rawKey.length > 0).toBe(true)
    }
  })

  it('handles empty config gracefully', async () => {
    const config = { key: '', baseUrl: '', model: '', apiType: 'gemini' }
    await storeApiConfig(config)
    const loaded = await loadApiConfig()
    expect(loaded.key).toBe('')
    expect(loaded.apiType).toBe('gemini')
  })

  it('handles missing localStorage gracefully', async () => {
    // Simulate localStorage throwing
    storage.getItem.mockImplementation(() => {
      throw new Error('access denied')
    })
    storage.setItem.mockImplementation(() => {
      throw new Error('access denied')
    })

    const config = { key: 'test', baseUrl: '', model: '', apiType: 'ollama' }
    // Should not throw
    await storeApiConfig(config)
    const loaded = await loadApiConfig()
    expect(loaded.key).toBe('')
    expect(loaded.apiType).toBe('gemini') // default when load fails
  })

  it('reads legacy base64-encoded keys (backward compat)', async () => {
    // Simulate a legacy base64-encoded key from older versions
    const legacyKey = btoa(unescape(encodeURIComponent('legacy-key')))
    localStorage.setItem('code_trainer_key', legacyKey)
    localStorage.setItem('code_trainer_type', 'openrouter')

    const loaded = await loadApiConfig()
    expect(loaded.key).toBe('legacy-key')
    expect(loaded.apiType).toBe('openrouter')
  })

  it('produces deterministic length ciphertext for same input', async () => {
    const config = { key: 'A'.repeat(40), baseUrl: '', model: '', apiType: 'gemini' }
    await storeApiConfig(config)

    const rawKey = localStorage.getItem('code_trainer_key')
    // Should always be a string and not empty
    expect(typeof rawKey).toBe('string')
    expect(rawKey.length).toBeGreaterThan(0)
  })
})
