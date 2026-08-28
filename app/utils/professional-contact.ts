const CHILEAN_CONTACT_REGEX = /^\+56\d{9}$/

export function normalizeChileanContact(value: string): string {
  return value.replace(/\s+/g, '')
}

export function isValidChileanContact(value: string): boolean {
  return CHILEAN_CONTACT_REGEX.test(normalizeChileanContact(value))
}
