const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Un id mal formado contra una columna uuid de Postgres falla con 22P02 en vez de devolver ninguna
// fila — cada lookup público por id lo descarta antes de tocar la base.
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}
