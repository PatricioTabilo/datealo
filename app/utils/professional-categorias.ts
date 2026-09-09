import type { PublicCategoria } from '~/types/professional'

export type CategoriaContext = {
  categoria: PublicCategoria
  secondary: PublicCategoria[]
}

// El backend garantiza que categorias nunca llega vacío para un profesional activo, así que siempre hay
// una categoría de contexto: la del slug que llegó por query, o la primera declarada si no matchea ninguna.
export function resolveCategoriaContext(categorias: PublicCategoria[], contextSlug?: string): CategoriaContext {
  const categoria = categorias.find(c => c.slug === contextSlug) ?? categorias[0]!
  const secondary = categorias.filter(c => c.slug !== categoria.slug)
  return { categoria, secondary }
}
