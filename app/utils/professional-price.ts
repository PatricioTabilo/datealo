export function formatPriceFrom(value: number): string {
  return new Intl.NumberFormat('es-CL').format(value)
}
