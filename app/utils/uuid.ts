const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// El id del perfil público viaja en la URL (/profesionales/[id]). "me" no es un uuid pero sí existe
// como GET /api/professionals/me (el propio perfil del dueño, con sesión) — sin este chequeo antes de
// pedir el perfil público, ese valor terminaría golpeando el endpoint equivocado.
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}
