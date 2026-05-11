/* ── Shared AI API Helpers ── */
import { DEFAULT_PROVIDER, PROVIDERS, getProviderHandler } from '../modules'

/**
 * Route to the correct provider based on apiType.
 */
export async function callAI(apiConfig, system, user) {
  const handler = getProviderHandler(apiConfig.apiType)
  return handler(apiConfig, system, user)
}

// Re-exported for convenience (used by App.jsx)
export { DEFAULT_PROVIDER, PROVIDERS }

/** Safe JSON parse that prevents prototype pollution */
export function safeJsonParse(str, fallback = null) {
  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key in parsed) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return fallback
        }
      }
    }
    return parsed
  } catch {
    return fallback
  }
}

/**
 * AES-256-GCM encryption for API keys stored in localStorage.
 *
 * Security notes:
 * - Uses the Web Crypto API (crypto.subtle), available in all modern browsers.
 * - The encryption key is stored in localStorage → same storage as the ciphertext.
 * - This protects against casual inspection (e.g. browsing localStorage manually),
 *   but NOT against a determined attacker with DevTools access who can read both.
 * - For true server-grade security, API keys should never reach the client at all.
 * - Falls back to base64 if crypto.subtle is unavailable (e.g. insecure context).
 */

const STORAGE_PREFIX = 'code_trainer_'
const CRYPTO_KEY_STORAGE = 'code_trainer_crypto_key'

/** Check if the Web Crypto API is available and we're in a secure context */
function isCryptoAvailable() {
  if (typeof crypto === 'undefined' || !crypto.subtle) return false
  try {
    return location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  } catch {
    // location may not be defined (e.g. Node.js test environment)
    return false
  }
}

/**
 * Generate or retrieve an AES-256-GCM key.
 * The key is stored as base64-encoded raw bytes in localStorage.
 */
async function getCryptoKey() {
  const raw = localStorage.getItem(CRYPTO_KEY_STORAGE)
  if (raw) {
    const keyData = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('raw', key)
  const rawKey = btoa(String.fromCharCode(...new Uint8Array(exported)))
  localStorage.setItem(CRYPTO_KEY_STORAGE, rawKey)
  return key
}

/**
 * Encrypt a string with AES-256-GCM.
 * Returns base64( iv(12) || ciphertext ).
 */
async function encrypt(text) {
  if (!isCryptoAvailable()) return btoa(unescape(encodeURIComponent(text)))
  try {
    const key = await getCryptoKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(text)
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return '__aes__' + btoa(String.fromCharCode(...combined))
  } catch {
    // Fallback: base64
    return btoa(unescape(encodeURIComponent(text)))
  }
}

/**
 * Decrypt a string that was encrypted with encrypt().
 * Handles both AES-GCM (prefixed with __aes__) and legacy base64.
 */
async function decrypt(encoded) {
  if (!encoded) return ''
  try {
    // AES-GCM encrypted (prefixed)
    if (encoded.startsWith('__aes__')) {
      if (!isCryptoAvailable()) return ''
      const raw = encoded.slice(7)
      const combined = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
      const iv = combined.slice(0, 12)
      const ciphertext = combined.slice(12)
      const key = await getCryptoKey()
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
      return new TextDecoder().decode(decrypted)
    }
    // Legacy base64
    return decodeURIComponent(escape(atob(encoded)))
  } catch {
    return ''
  }
}

/**
 * Save API configuration to localStorage.
 * The API key is encrypted with AES-256-GCM.
 */
export async function storeApiConfig(config) {
  try {
    const { key, baseUrl, model, apiType } = config
    if (key) localStorage.setItem(`${STORAGE_PREFIX}key`, await encrypt(key))
    if (baseUrl) localStorage.setItem(`${STORAGE_PREFIX}base_url`, baseUrl)
    if (model) localStorage.setItem(`${STORAGE_PREFIX}model`, model)
    if (apiType) localStorage.setItem(`${STORAGE_PREFIX}type`, apiType)
  } catch {
    /* ignore */
  }
}

/**
 * Load API configuration from localStorage.
 * The API key is decrypted with AES-256-GCM.
 */
export async function loadApiConfig() {
  try {
    const rawKey = localStorage.getItem(`${STORAGE_PREFIX}key`)
    const rawUrl = localStorage.getItem(`${STORAGE_PREFIX}base_url`)
    const rawModel = localStorage.getItem(`${STORAGE_PREFIX}model`)
    const apiType = localStorage.getItem(`${STORAGE_PREFIX}type`) || DEFAULT_PROVIDER
    return {
      key: rawKey ? await decrypt(rawKey) : '',
      baseUrl: rawUrl || '',
      model: rawModel || '',
      apiType,
    }
  } catch {
    return { key: '', baseUrl: '', model: '', apiType: DEFAULT_PROVIDER }
  }
}
