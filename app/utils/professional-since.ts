const MEMBER_SINCE_FORMATTER = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' })

// Mes y año, nunca el día exacto — un dato tan preciso no aporta nada extra y puede sentirse como
// vigilancia sobre el profesional.
export function formatMemberSince(createdAt: string): string {
  return MEMBER_SINCE_FORMATTER.format(new Date(createdAt))
}
