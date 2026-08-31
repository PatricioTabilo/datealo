const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('es-CL', { numeric: 'always' })

const UNITS: { unit: Intl.RelativeTimeFormatUnit, seconds: number }[] = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
]

// Menos de un minuto se lee "recién" — Intl.RelativeTimeFormat diría "hace 0 minutos", que no es cómo
// nadie habla.
export function formatRelativeDate(dateIso: string, now: Date = new Date()): string {
  const diffSeconds = (now.getTime() - new Date(dateIso).getTime()) / 1000

  if (diffSeconds < 60) return 'recién'

  for (const { unit, seconds } of UNITS) {
    if (diffSeconds >= seconds) {
      return RELATIVE_TIME_FORMATTER.format(-Math.floor(diffSeconds / seconds), unit)
    }
  }

  return 'recién'
}
