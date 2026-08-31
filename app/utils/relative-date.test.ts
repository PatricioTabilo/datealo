import { describe, expect, it } from 'vitest'
import { formatRelativeDate } from './relative-date'

const NOW = new Date('2026-08-31T12:00:00.000Z')

function minutesAgo(minutes: number): string {
  return new Date(NOW.getTime() - minutes * 60 * 1000).toISOString()
}

describe('formatRelativeDate', () => {
  it('devuelve "recién" para menos de un minuto', () => {
    expect(formatRelativeDate(minutesAgo(0.5), NOW)).toBe('recién')
  })

  it('formatea en días, semanas y meses en español', () => {
    expect(formatRelativeDate(minutesAgo(60 * 24 * 3), NOW)).toBe('hace 3 días')
    expect(formatRelativeDate(minutesAgo(60 * 24 * 14), NOW)).toBe('hace 2 semanas')
    expect(formatRelativeDate(minutesAgo(60 * 24 * 30), NOW)).toBe('hace 1 mes')
  })
})
