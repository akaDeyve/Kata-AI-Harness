import { describe, it, expect } from 'vitest'
import { safeJsonParse } from '../api'

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
