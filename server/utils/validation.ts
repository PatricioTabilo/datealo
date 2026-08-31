import type { H3Event } from 'h3'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Un id mal formado contra una columna uuid de Postgres falla con 22P02 en vez de devolver ninguna
// fila — cada lookup público por id lo descarta antes de tocar la base.
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}

// Cada endpoint define su propio código de error (el contrato lo exige), pero la forma de la
// respuesta — status 400 más el JSON que el cliente lee — es siempre la misma.
export function badRequest(event: H3Event, error: string, extra?: Record<string, unknown>) {
  setResponseStatus(event, 400)
  return { error, ...extra }
}
