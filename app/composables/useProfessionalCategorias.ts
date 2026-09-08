import type { PublicCategoria } from '~/types/professional'

type CategoriaPatch = { priceFrom?: number | null, description?: string | null }

export function useProfessionalCategorias() {
  const { professional } = useProfessionalProfile()

  const categorias = computed(() => professional.value?.categorias ?? [])
  const announcement = useState('professional-categorias-announcement', () => '')

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

  return { categorias, announcement, addCategoria, updateCategoria, removeCategoria }
}
