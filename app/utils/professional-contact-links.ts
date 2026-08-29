// wa.me exige el número sin el símbolo + (documentación de WhatsApp); tel: usa el mismo E.164 con el +
// tal cual lo guarda professionals.contact.
export function buildWhatsAppUrl(contact: string, message: string): string {
  const digits = contact.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildTelUrl(contact: string): string {
  return `tel:${contact}`
}

export function buildContactMessage(displayName: string, categoriaNombre: string): string {
  const firstName = displayName.trim().split(/\s+/)[0] ?? displayName
  return `Hola ${firstName}, vi tu perfil de ${categoriaNombre} en Datealo y quería consultarte algo`
}
