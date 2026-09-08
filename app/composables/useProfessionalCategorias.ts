import type { PublicCategoria } from '~/types/professional'

type CategoriaPatch = { priceFrom?: number | null, description?: string | null }

export function useProfessionalCategorias() {
  const { professional } = useProfessionalProfile()

  const categorias = computed(() => professional.value?.categorias ?? [])
  const announcement = useState('professional-categorias-announcement', () => '')
  // El bloque que se acaba de crear lee y limpia esto en su propio onMounted, para entrar directo en
  // edición de precio/descripción sin que el usuario tenga que tocar "Editar" después de elegir la
  // categoría — elegirla ya la guardó, lo único que falta es esos dos campos.
  const justAddedSlug = useState<string | null>('professional-categorias-just-added', () => null)

  function applyCategorias(updated: PublicCategoria[]) {
    if (professional.value) professional.value = { ...professional.value, categorias: updated }
  }

  async function addCategoria(categoriaSlug: string): Promise<boolean> {
    try {
      const { categorias: updated } = await $fetch<{ categorias: PublicCategoria[] }>('/api/professionals/me/categorias', {
        method: 'POST',
        body: { categoriaSlug },
      })
      applyCategorias(updated)
      announcement.value = `${updated.find(c => c.slug === categoriaSlug)?.nombre ?? categoriaSlug} agregada`
      justAddedSlug.value = categoriaSlug
      return true
    } catch {
      return false
    }
  }

  async function updateCategoria(categoriaSlug: string, patch: CategoriaPatch): Promise<boolean> {
    try {
      const { categorias: updated } = await $fetch<{ categorias: PublicCategoria[] }>(
        `/api/professionals/me/categorias/${categoriaSlug}`,
        { method: 'PATCH', body: patch },
      )
      applyCategorias(updated)
      return true
    } catch {
      return false
    }
  }

  async function removeCategoria(categoriaSlug: string): Promise<boolean> {
    const nombre = categorias.value.find(c => c.slug === categoriaSlug)?.nombre ?? categoriaSlug
    try {
      const { categorias: updated } = await $fetch<{ categorias: PublicCategoria[] }>(
        `/api/professionals/me/categorias/${categoriaSlug}`,
        { method: 'DELETE' },
      )
      applyCategorias(updated)
      announcement.value = `${nombre} quitada`
      return true
    } catch {
      return false
    }
  }

  return { categorias, announcement, justAddedSlug, addCategoria, updateCategoria, removeCategoria }
}
