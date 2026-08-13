---
name: vue-composition
description: Arquitectura de composición de componentes y composables en Datealo — cuándo extraer un sub-componente, un composable o un util, y cómo. Usar antes de agregar código a cualquier `.vue` o composable, cuando un archivo se siente grande, cuando aparecen "god composables" o componentes de 400+ líneas, o al pedir "refactoriza esto", "extrae este componente", "esto está muy grande". Incluye la auditoría de salud de archivos obligatoria antes de editar.
---

# Arquitectura de composición en Datealo

Los componentes grandes son el code smell más caro del frontend. Un componente de 1000 líneas es difícil de
leer, navegar, testear y modificar sin romper cosas. Este skill define cuándo extraer, qué extraer y cómo.

**Fuentes**: Vue Composition API FAQ (Evan You muestra que ~400 LOC con múltiples concerns ya es
problemático), Vue Composables docs ("components that are too large to navigate and reason about"), Google
Engineering Practices, defaults de SonarQube (complejidad cognitiva ≤ 15 por función).

## Auditoría antes de editar

Antes de tocar un `.vue` o un composable, mide. No es opcional y no es un refactor extra: es parte de
implementar.

1. `wc -l <archivo>`.
2. Para componentes y páginas: contar funciones declaradas en `<script setup>`.
3. Para composables: contar miembros del return y entidades o recursos de API distintos.
4. Clasificar en verde / amarilla / roja.

| Recurso                       | Verde     | Amarilla | Roja      |
| ----------------------------- | --------- | -------- | --------- |
| Componente `.vue`             | ≤ 200 LOC | 200–400  | > 400 LOC |
| Composable `.ts`              | ≤ 150 LOC | 150–300  | > 300 LOC |
| Función/método                | ≤ 30 LOC  | 30–60    | > 60 LOC  |
| Props por componente          | ≤ 5       | 6–8      | > 8       |
| Funciones en `<script setup>` | ≤ 5       | 6–10     | > 10      |
| Miembros en el return         | ≤ 15      | —        | > 15      |
| Variables de estado           | ≤ 7       | —        | > 7       |
| Entidades por composable      | 1         | —        | > 1       |

**Qué hacer con el resultado:**

- **Zona roja** → extraer **antes** de implementar el feature. La extracción es parte de la tarea.
- **Zona amarilla que tu cambio empujaría a roja** → extraer lo suficiente para quedar en verde o amarilla
  después del cambio.
- **Zona verde, o amarilla sin riesgo** → editar directo.

**La regla que más se rompe:** un archivo de 500 LOC con "solo 5 líneas más" sigue siendo un archivo de
505 LOC en zona roja. Si saltaste la auditoría, la implementación es inválida.

Al terminar, re-audita: ningún archivo tocado debe haber quedado en zona roja.

## Triggers obligatorios de extracción

Extraer si **cualquiera** es verdadero:

1. **Múltiples concerns lógicos** — el componente maneja 2+ dominios (búsqueda + filtros + mapa).
2. **3+ secciones UI distintas** — bloques de template con responsabilidades independientes.
3. **Template repetible** — un bloque de markup se repite o podría reutilizarse (cards, ítems de lista).
4. **Lógica y presentación mezcladas** — el `<script>` tiene orquestación de estado y lógica de UI.
5. **Zona roja** en cualquier umbral de la tabla.
6. **Densidad de funciones alta** — más de 10 funciones declaradas en `<script setup>`.

## Dónde vive cada función

Un componente no solo crece por template grande: también crece cuando su `<script>` acumula funciones
auxiliares. Cada función en un `<script setup>` debe justificar por qué vive ahí.

| Tipo de función                              | Dónde debe vivir                    | Ejemplo                                     |
| -------------------------------------------- | ----------------------------------- | ------------------------------------------- |
| **Stateful** (lee/muta refs, watchers, lifecycle) | Composable (`useFeature()`)     | `search()`, `saveProfile()`, `fetchReviews()`|
| **Pura** (input → output, sin estado)        | `app/utils/`                        | `formatDistance()`, `slugify()`             |
| **Handler del template** (1-3 líneas, delega)| Componente, inline o función corta  | `const onSubmit = () => save()`             |
| **Específica de una sub-sección UI**         | Sub-componente con su propio script | `toggleDropdown()`, `handleDrag()`          |

```ts
// ❌ MAL: 9 funciones sueltas en SearchResults.vue
const fetchResults = async () => { ... }
const applyFilters = () => { ... }
const updateLocation = () => { ... }
const toggleMapView = () => { ... }
const handleCardClick = (id: string) => { ... }
const loadMore = async () => { ... }
const sortBy = (criteria: string) => { ... }
const openFilterSheet = () => { ... }
const closeFilterSheet = () => { ... }

// ✅ BIEN: concerns extraídos, el componente orquesta
const { results, fetchResults, loadMore } = useSearch()
const { filters, applyFilters, toggleFilter } = useSearchFilters()
const { mapView, toggleMapView, updateLocation } = useSearchMap()
```

## Estrategias de extracción, en orden de preferencia

1. **Extraer composable** — cuando la lógica (estado + side effects) es lo pesado. `useFeature()` devuelve
   estado y acciones; el componente consume y renderiza.
2. **Extraer sub-componente** — cuando hay una sección de template con su propia responsabilidad visual.
   Props down, events up.
3. **Extraer util** — cuando hay transformaciones puras inlineadas en el script.
4. **Combinar** — los componentes grandes normalmente necesitan las tres.

### Naming de componentes hijos acoplados

Convención del Vue Style Guide (Priority B, tightly coupled component names): el hijo lleva el prefijo del
padre.

```
components/
└── search/
    ├── SearchResults.vue         # Orquestador
    ├── SearchResultsCard.vue     # Card de profesional
    ├── SearchResultsFilters.vue  # Panel de filtros
    └── SearchResultsMap.vue      # Mapa
```

El padre queda como **orquestador delgado**: importa sub-componentes, pasa props, escucha eventos y delega
la lógica pesada a composables.

```vue
<!-- SearchResults.vue — orquestador delgado -->
<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'
import SearchResultsCard from './SearchResultsCard.vue'
import SearchResultsFilters from './SearchResultsFilters.vue'

const props = defineProps<{ category?: string, comuna?: string }>()
const { results, loading, fetchResults } = useSearch(props)
</script>

<template>
  <div>
    <SearchResultsFilters @apply="fetchResults" />
    <SearchResultsCard v-for="pro in results" :key="pro.id" :professional="pro" />
  </div>
</template>
```

## Arquitectura de composables

Los composables son a la lógica lo que los componentes son a la UI. Un composable god es tan costoso como
un componente god.

**Fuentes**: Vue docs ("compose complex logic using small, isolated units"), Vue Composition API FAQ
(agrupar por concern y extraer cada uno), Michael Thiessen (thin composables: separar lógica pura de
reactividad; logic composables: extraer para organización, no solo para reutilizar).

### Principio: un composable, un concern

Un composable maneja **un dominio de datos** y expone **una API cohesiva**. Si necesitas scroll para
entender qué hace, ya hay más de un concern.

### Triggers de extracción

Splitear si **cualquiera** es verdadero:

1. **Múltiples entidades** — gestiona profesionales Y reseñas Y categorías. Cada entidad, su composable.
2. **Múltiples recursos de API** — llama a `/api/search`, `/api/professionals/:id`, `/api/reviews`. Cada
   familia de endpoints, su composable.
3. **Zona roja** — supera 300 LOC.
4. **Clusters de estado independientes** — grupos de `useState` que nunca se referencian entre sí.
5. **Return masivo** — más de 15 miembros indica varias APIs mezcladas.
6. **Lógica duplicable** — patrones de optimistic update, fetch + rollback o debounced save repetidos entre
   funciones.

### Patrones de composición

**1. Composables anidados.** Un composable puede llamar a otros. Es el patrón principal para descomponer.

```ts
// ❌ MAL: un god composable de 470 LOC
export const useProfessionals = () => {
  // 13 useState, 6 computed, búsqueda, filtros, reseñas, perfil, geolocalización...
  return { /* 40+ miembros */ }
}

// ✅ BIEN: un composable por concern, orquestador delgado
// composables/useSearch.ts              — resultados + paginación
// composables/useSearchFilters.ts       — filtros
// composables/useProfessionalProfile.ts — perfil individual + galería + contacto
// composables/useReviews.ts             — reseñas + rating promedio
```

**2. Estado local vs compartido.** Estado dentro de la función → una instancia por llamada, ideal para
lógica per-component. `useState('key')` de Nuxt → singleton compartido, para estado global. Usar
`useState` en vez de refs a nivel de módulo: ya gestiona el singleton y es SSR-safe.

```ts
// Local — cada componente tiene su copia
export function useFormValidation() {
  const errors = ref<string[]>([])
  return { errors, validate }
}

// Compartido — todos ven los mismos resultados
export function useSearch() {
  const results = useState<Professional[]>('search-results', () => [])
  return { results, search, loadMore }
}
```

**3. Composable delgado.** Las reglas de negocio van en funciones puras testeables; el composable las
envuelve con reactividad.

```ts
// utils/search-filters.ts — pura, testeable, sin Vue
export function filterByCategory(items: Professional[], category: string): Professional[] {
  return items.filter(p => p.categories.includes(category))
}

// composables/useSearchFilters.ts — envuelve con reactividad
export function useSearchFilters(items: Ref<Professional[]>) {
  const category = useState<string | null>('filter-category', () => null)
  const filtered = computed(() =>
    category.value ? filterByCategory(items.value, category.value) : items.value,
  )
  return { category, filtered }
}
```

**4. Pipeline por refs.** Conectar composables pasando refs de uno como input del siguiente.

```ts
const { results } = useSearch()
const { filtered } = useSearchFilters(results)
const { sorted } = useSearchSorting(filtered)
```

### Anti-patrones

| Anti-patrón                | Problema                                                  | Solución                             |
| -------------------------- | --------------------------------------------------------- | ------------------------------------ |
| **God composable**         | Gestiona búsqueda + reseñas + perfil                      | Un composable por entidad            |
| **Mapper soup**            | `mapProfessional()`, `mapReview()` inline en el composable | Mover a `utils/mappers.ts`          |
| **Optimistic boilerplate** | Cada acción repite snapshot → update → try/catch → rollback| Extraer un helper reutilizable       |
| **Flag explosion**         | 13 `useState` para filtros y flags                        | Agrupar en un composable de filtros  |
| **Return gigante**         | 40 miembros en el return                                  | Cada concern devuelve solo su API    |
| **Dependencia oculta**     | Comparten estado vía keys de `useState` sin declararlo    | Pasar refs como parámetros           |

### Proceso para partir un composable god

1. **Mapear entidades** que gestiona (profesionales, reseñas, categorías, ubicación).
2. **Agrupar** estado, acciones y computeds de cada una.
3. **Identificar puentes**: qué dato necesita un concern del otro.
4. **Extraer de abajo arriba**: empezar por el concern más independiente.
5. **Conectar vía parámetros**: el orquestador pasa refs entre los especializados.
6. **Mover funciones puras** (mappers, sanitizers, formatters) a `utils/`.

## Convenciones

- **Naming**: `use` + dominio — `useSearch`, `useSearchFilters`, `useReviews`.
- **Archivos**: un composable exportado por archivo, con el mismo nombre que la función.
- **Parámetros**: aceptar `Ref<T>` o valor raw con `toValue()` cuando el input puede ser reactivo.
- **Return**: objeto plano con refs, no `reactive` — permite destructuring sin perder reactividad.
- **Cleanup**: siempre limpiar side effects con `onUnmounted` (intervals, listeners, subscriptions).
- **Sin imports circulares**: si A necesita B y B necesita A, hay un concern mal separado. Extraer la parte
  compartida a un tercer composable.

## Regla de oro

> Antes de agregar código a un archivo, revisa su tamaño. Si está en zona amarilla o roja, extrae primero —
> luego implementa el feature sobre la estructura limpia.

Esto no es refactoring por capricho: es preparación del terreno para que el cambio sea más limpio, más
pequeño y más fácil de revisar.
