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

  it('getToken nunca genera uno nuevo, solo lee', () => {
    const { getToken } = useReviewToken('profesional-1')

    expect(getToken()).toBeNull()
    expect(window.localStorage.getItem('datealo:review-token:profesional-1')).toBeNull()
  })

  it('getToken devuelve el token ya guardado por ensureToken', () => {
    const { ensureToken, getToken } = useReviewToken('profesional-1')
    const token = ensureToken()

    expect(getToken()).toBe(token)
  })

  it('getMyReview sin nada guardado devuelve null', () => {
    expect(useReviewToken('profesional-1').getMyReview()).toBeNull()
  })

  it('saveMyReview + getMyReview redondean el viaje completo', () => {
    const { saveMyReview, getMyReview } = useReviewToken('profesional-1')
    const draft = { rating: 4, comment: 'Buena atención', name: 'Carmen' }

    saveMyReview(draft)

    expect(getMyReview()).toEqual(draft)
  })
})
