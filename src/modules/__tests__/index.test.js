import { describe, it, expect } from 'vitest'
import { PROVIDERS, DEFAULT_PROVIDER, getProviderHandler } from '../index'

describe('PROVIDERS', () => {
  it('contains exactly 4 providers', () => {
    expect(PROVIDERS).toHaveLength(4)
  })

  it('includes gemini', () => {
    const gemini = PROVIDERS.find(p => p.id === 'gemini')
    expect(gemini).toBeDefined()
    expect(gemini.name).toBeDefined()
  })

  it('includes openrouter', () => {
    const openrouter = PROVIDERS.find(p => p.id === 'openrouter')
    expect(openrouter).toBeDefined()
  })

  it('includes ollama', () => {
    const ollama = PROVIDERS.find(p => p.id === 'ollama')
    expect(ollama).toBeDefined()
  })

  it('includes opencode', () => {
    const opencode = PROVIDERS.find(p => p.id === 'opencode')
    expect(opencode).toBeDefined()
  })
})

describe('DEFAULT_PROVIDER', () => {
  it('is gemini', () => {
    expect(DEFAULT_PROVIDER).toBe('gemini')
  })
})

describe('getProviderHandler', () => {
  it('returns a function for gemini', () => {
    const handler = getProviderHandler('gemini')
    expect(typeof handler).toBe('function')
  })

  it('returns a function for openrouter', () => {
    const handler = getProviderHandler('openrouter')
    expect(typeof handler).toBe('function')
  })

  it('returns a function for ollama', () => {
    const handler = getProviderHandler('ollama')
    expect(typeof handler).toBe('function')
  })

  it('returns a function for opencode', () => {
    const handler = getProviderHandler('opencode')
    expect(typeof handler).toBe('function')
  })

  it('throws for unknown provider', () => {
    expect(() => getProviderHandler('unknown')).toThrow('Unbekannter Anbieter')
  })
})
