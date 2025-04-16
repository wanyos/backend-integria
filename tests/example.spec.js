import { describe, it, expect } from 'vitest'

describe('first test', () => {
  const sum = (a, b) => {
    return a + b
  }
  it('example', () => {
    expect(sum(1, 2)).toBe(3)
  })
})
