// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useReviewToken } from './useReviewToken'

describe('useReviewToken', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('genera un token nuevo la primera vez y lo persiste', () => {
    const { ensureToken } = useReviewToken('profesional-1')
    const token = ensureToken()

    expect(token).toMatch(/^[0-9a-f-]{36}$/)
    expect(window.localStorage.getItem('datealo:review-token:profesional-1')).toBe(token)
  })

  it('reusa el mismo token en llamadas siguientes', () => {
    const { ensureToken } = useReviewToken('profesional-1')
    const first = ensureToken()
    const second = ensureToken()

    expect(second).toBe(first)
  })

  it('no mezcla tokens entre profesionales distintos', () => {
    const tokenA = useReviewToken('profesional-a').ensureToken()
    const tokenB = useReviewToken('profesional-b').ensureToken()

    expect(tokenA).not.toBe(tokenB)
  })
})
