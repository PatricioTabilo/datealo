# Datealo — Instrucciones para GitHub Copilot

## Identidad del producto

Datealo es un buscador de profesionales y servicios para el hogar y la vida diaria. Conecta a personas que necesitan resolver algo (gasfitería, electricidad, peluquería, mudanzas, limpieza, etc.) con profesionales verificados de su zona.

**Mensaje core**: Encuentra al profesional que necesitas, cerca de ti.

## Principios de experiencia

- Búsqueda directa: el usuario llega, busca y encuentra — sin fricción
- Confianza primero: perfiles con reseñas, fotos de trabajos y verificación
- Resultados relevantes: proximidad geográfica + calidad del profesional
- Mobile-first: la mayoría de búsquedas ocurren desde el celular
- Simplicidad: pocas pantallas, flujo claro, cero confusión
- Inclusivo en categorías: oficios del hogar, servicios personales, profesionales especializados — todo cabe si alguien lo busca

## Guardrails del producto

**Nunca implementar:**
- Subastas o bidding entre profesionales por un cliente
- Sistemas de pago obligatorio para contactar (fase temprana)
- Dashboards complejos antes de tener tracción
- Copy agresivo o de urgencia artificial
- Features que compliquen el flujo buscar → ver perfil → contactar

## Flujo core

buscar → explorar resultados → ver perfil → contactar profesional

Cada feature nueva debe reforzar este flujo, no romperlo.

## Tipos de usuario

### Buscador (cliente)
- Busca un servicio o profesional por categoría, ubicación o nombre
- Explora perfiles, lee reseñas, ve portafolio de trabajos
- Contacta al profesional (WhatsApp, teléfono, mensaje interno)
- Deja reseña después del servicio

### Profesional
- Crea y gestiona su perfil público (servicios, zona, fotos, precios orientativos)
- Recibe contactos de potenciales clientes
- Acumula reseñas y reputación
- Puede destacar su perfil (futuro: planes premium)

## Stack técnico

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Estilos**: Tailwind CSS v4, DaisyUI v5
- **Iconos**: lucide-vue-next
- **Auth/DB**: Supabase (PostgreSQL + Auth + RLS)
- **ORM**: Drizzle ORM
- **Estado**: Vue Composition API + Nuxt composables

## Estructura del proyecto

Estructura oficial de Nuxt 4 sin refactoring prematuro:

```
app/
├── components/      # Componentes Vue
├── composables/     # Lógica de negocio (estado + acciones)
├── constants/       # Constantes runtime (PROFESSIONAL_STATUS, CATEGORY, etc)
├── fixtures/        # Mock data (JSON)
├── layouts/         # Nuxt layouts
├── pages/           # Routing basado en archivos
├── types/           # Solo tipos TypeScript
└── utils/           # Funciones puras (formatters, helpers)

server/
├── api/             # Endpoints del servidor
├── db/              # Schema Drizzle + migraciones
│   └── sql/         # SQL crudo (políticas RLS)
└── utils/           # Utilidades del servidor

public/              # Assets estáticos
assets/css/          # CSS global
```

**Principio YAGNI**: No mover a `src/` ni crear aliases custom hasta que haya fricción real.

## Convenciones de organización de código

### Separación de responsabilidades

**Composables (`app/composables/`)**: Solo lógica de negocio
- State management (useState, computed)
- Reglas de negocio y validaciones
- Mutaciones de datos y side effects
- SIN formateo, SIN traducciones, SIN lógica de UI

**Utils (`app/utils/`)**: Helpers puros de presentación
- Formatters (`formatTime`, `formatDate`)
- Traducciones de labels (`getStatusLabel`, `getModeLabel`)
- Cálculos de UI que no involucran estado

**Constants (`app/constants/`)**: Valores runtime
- Enums como objetos const (`PROFESSIONAL_STATUS`, `CATEGORY_TYPE`)
- Valores de configuración
- Valores fijos de dominio

**Types (`app/types/`)**: Solo tipos TypeScript
- Definiciones de tipos derivados de constantes
- Interfaces de entidades
- SIN valores runtime

### Patrón ejemplo

```ts
// ❌ MAL: Mezclando lógica con formateo
export const useSearch = () => {
  const results = useState<Professional[]>('results', () => [])
  const displayDistance = computed(() => results.value.map(r => `${r.distance} km`))
  return { results, displayDistance }
}

// ✅ BIEN: Separación
// composables/useSearch.ts — solo lógica
export const useSearch = () => {
  const results = useState<Professional[]>('results', () => [])
  return { results }
}

// utils/format.ts — solo formateo
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

// Uso en componente
const { results } = useSearch()
const displayDistance = computed(() => formatDistance(results.value[0]?.distance ?? 0))
```

### Patrón constantes + tipos

```ts
// constants/professional.ts — valores runtime
export const PROFESSIONAL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING_VERIFICATION: 'pending_verification'
} as const

// types/professional.ts — tipos compile-time
import type { PROFESSIONAL_STATUS } from '~/constants/professional'
export type ProfessionalStatus = typeof PROFESSIONAL_STATUS[keyof typeof PROFESSIONAL_STATUS]

// Uso
import { PROFESSIONAL_STATUS } from '~/constants/professional'
import type { ProfessionalStatus } from '~/types/professional'
const status = PROFESSIONAL_STATUS.ACTIVE // ✅ Autocomplete + type-safe
```

## Seguridad RLS

Todo acceso a datos multi-usuario está protegido con RLS en Supabase.

**Fuente de verdad**: `server/db/sql/rls.sql`

**Regla obligatoria**: Cada cambio de schema debe evaluar si RLS necesita actualización antes de cerrar la tarjeta.

**Actualizar RLS cuando:**
- Se crea tabla nueva con datos de usuario
- Se cambia ownership (`user_id`) o relaciones usadas en policies (`EXISTS`/FKs)
- Se renombran tablas/columnas referenciadas por policies

**NO necesita actualización cuando:**
- Solo se agregan campos de negocio (`title`, `color`, `duration`) sin tocar ownership/seguridad

## Patrones de código

### Composables
- `useState()` en vez de `ref()` para compatibilidad SSR
- Return values agrupados: state, config, computeds, acciones
- Single responsibility — un composable, un dominio (ver sección "Arquitectura de composables" para umbrales, triggers y patrones de extracción)
- Cleanup con `onUnmounted` para side effects (intervals, listeners)
- Sin god composables: si gestiona >1 entidad o supera 300 LOC → splitear

### Componentes
- Siempre `<script setup lang="ts">`
- `computed()` sobre métodos para estado derivado
- `definePageMeta()` para metadatos de página
- Mantener componentes presentacionales; lógica en composables
- Respetar la arquitectura de composición (ver sección dedicada abajo)

### TypeScript
- Modo strict habilitado
- Preferir `type` sobre `interface` para modelos de dominio
- `as const` para enums
- Derivar tipos de constantes cuando sea posible
- Sin `any` — usar `unknown` + type narrowing si el tipo es genuinamente incierto

## Skills

Skills locales pre-instalados en `.agents/skills/`. Usar cuando el contexto lo requiera:

| Dominio | Skill |
|---------|-------|
| Nuxt 4 | `.agents/skills/nuxt/` |
| Vue 3 core | `.agents/skills/vue/` |
| Vue 3 avanzado | `.agents/skills/vue-best-practices/` |
| Backend / API | `.agents/skills/nuxt-server-endpoints/` |
| Edge Functions | `.agents/skills/supabase-functions-logic/` |
| DB / PostgreSQL | `.agents/skills/supabase-postgres-best-practices/` |
| Drizzle ORM | `.agents/skills/drizzle-orm/` |
| UI/UX diseño | `.agents/skills/frontend-design/` |
| UX avanzado | `.agents/skills/ui-ux-pro-max/` |
| Copy / mensajes | `.agents/skills/copywriting/` |
| Prompt engineering | `.agents/skills/prompt-engineering-patterns/` |
| Web design guidelines | `.agents/skills/web-design-guidelines/` |
| Marketing psychology | `.agents/skills/marketing-psychology/` |
| AI SEO | `.agents/skills/ai-seo/` |
| Content strategy | `.agents/skills/content-strategy/` |
| Page CRO | `.agents/skills/page-cro/` |

**Trigger explícito**: Si el usuario dice "eres experto en X", leer el skill correspondiente antes de responder.

Nunca sugerir instalar skills — todos ya existen localmente.

## Gestión de tareas

**Agentes disponibles:**
- **build** — toma tarjetas pendientes y las implementa
- **iterate** — toma notas crudas y refina descripciones de tarjetas

Al escribir descripciones de tarjetas, incluir: problema claro, scope (qué sí / qué no) y criterios verificables de DoD.

## Scope actual del producto

- Landing page
- Búsqueda de profesionales por categoría, ubicación y nombre
- Listado de resultados con mapa y cards
- Perfil público del profesional (servicios, zona, fotos, reseñas, contacto)
- Registro y gestión de perfil para profesionales
- Sistema de reseñas y valoraciones
- Categorías de servicios (hogar, belleza, salud, tecnología, etc.)
- Geolocalización y filtros por proximidad
- Contacto directo (WhatsApp, teléfono)
- Autenticación con Supabase

## Módulos y referencias de producto

Cada módulo tiene palabras clave para buscar archivos con `semantic_search` y un producto de referencia cuyo patrón UX/técnico debe guiar la implementación. Usa `fetch_webpage` para investigar cómo el producto de referencia resolvió el patrón si no lo conoces bien.

| Módulo | Buscar | Referencia | Patrones clave |
|--------|--------|------------|----------------|
| Búsqueda | `useSearch`, `search`, `query` | Google Maps, Yelp | Autocomplete · Filtros combinados · Resultados instantáneos |
| Resultados | `useResults`, `listing`, `card` | Yelp, Google Maps | Cards con foto + rating + distancia · Vista mapa + lista · Paginación infinita |
| Perfil profesional | `useProfile`, `professional`, `detail` | Yelp, Airbnb | Galería de trabajos · Reseñas destacadas · CTA de contacto fijo |
| Categorías | `useCategories`, `category`, `service` | HomeAdvisor, TaskRabbit | Árbol jerárquico · Iconos · Breadcrumbs |
| Reseñas | `useReviews`, `review`, `rating` | Google Maps, Yelp | Estrellas · Fotos del trabajo · Respuesta del profesional |
| Geolocalización | `useLocation`, `geo`, `map` | Google Maps, Uber | Detección automática · Radio configurable · Mapa interactivo |
| Registro profesional | `useOnboarding`, `register`, `onboarding` | LinkedIn, Airbnb Host | Wizard paso a paso · Preview del perfil · Verificación |
| Contacto | `useContact`, `whatsapp`, `phone` | WhatsApp Business, Yelp | Click-to-call · Enlace directo WhatsApp · Tracking de contactos |
| Auth | `useAuth`, `login` | Clerk, Supabase Auth | Magic link · Error states · Redirect flow |
| SEO | `useSeo`, `meta`, `sitemap` | Yelp, HomeAdvisor | Páginas indexables por categoría+ciudad · Schema.org LocalBusiness |

### Patrones UX de referencia

- **Feedback < 100ms** — skeleton si > 300ms, no spinner
- **Resultados inmediatos** — mostrar resultados mientras se escribe, debounce de 300ms
- **Responsivo real** — touch ≥ 44×44px, bottom sheets en móvil, dropdowns en desktop
- **Microfeedback** — transiciones ≤ 200ms, destructivas piden confirmación, sin `alert()` nativo
- **Empty states** — invitación a buscar con sugerencias de categorías populares

## Arquitectura de composición de componentes

Los componentes grandes son el code smell más caro del frontend. Un componente de 1000+ líneas es difícil de leer, navegar, testear y modificar sin romper cosas.

**Fuentes**: Vue Composition API FAQ (Evan You muestra que ~400 LOC con múltiples concerns ya es problemático), Vue Composables docs ("components that are too large to navigate and reason about"), Google Engineering Practices ("those four lines are in a 50-line method that now really needs to be broken up"), SonarQube defaults (cognitive complexity ≤ 15/función, archivos ≤ 1000 LOC).

### Umbrales operativos

| Recurso | Zona verde | Zona amarilla | Zona roja |
|---------|------------|---------------|-----------|
| Componente `.vue` | ≤ 200 líneas | 200–400 líneas | > 400 líneas |
| Composable `.ts` | ≤ 150 líneas | 150–300 líneas | > 300 líneas |
| Función/método | ≤ 30 líneas | 30–60 líneas | > 60 líneas |
| Props por componente | ≤ 5 | 6–8 | > 8 |
| Secciones UI en template | ≤ 2 | 3 | > 3 |
| Funciones en `<script setup>` | ≤ 5 | 6–10 | > 10 |

- **Zona verde**: todo bien, no tocar.
- **Zona amarilla**: evaluar extracción si vas a agregar más código.
- **Zona roja**: extraer obligatoriamente antes de agregar más código.

### Triggers obligatorios de extracción

Extraer es parte de implementar bien, no un refactor extra. Extraer si **cualquiera** es verdadero:

1. **Múltiples concerns lógicos** — el componente maneja 2+ dominios (ej: search + filters + map)
2. **3+ secciones UI distintas** — bloques de template con responsabilidades independientes (ej: header, body, sidebar)
3. **Template repetible** — un bloque de markup se repite o podría ser reutilizable (items de lista, cards)
4. **Lógica + presentación mezcladas** — el `<script>` tiene tanto orquestación de estado como lógica de UI
5. **Zona roja** — el archivo supera los umbrales de la tabla
6. **Densidad de funciones alta** — el `<script setup>` tiene > 10 funciones declaradas. Señal clara de que el componente está orquestando múltiples concerns que deben vivir en composables o utils

### Clasificación de funciones en `<script setup>`

Un componente no solo crece por template grande — también crece cuando su `<script>` acumula docenas de funciones auxiliares. Esto es el equivalente frontend del code smell **Long Method / Large Class** (Refactoring Guru: "classes with short methods live longest"; "any method longer than ten lines should make you start asking questions").

La solución de Vue docs es explícita: "Composables can be extracted not only for reuse, but also for **code organization**" — no hace falta que se reutilice, basta con que el concern lógico sea independiente.

**Regla**: Cada función en un `<script setup>` debe justificar por qué vive ahí y no en otro lugar. Clasificar así:

| Tipo de función | Dónde debe vivir | Ejemplo |
|----------------|-----------------|----------|
| **Stateful** (lee/muta refs, watchers, lifecycle) | Composable (`useFeature()`) | `search()`, `saveProfile()`, `fetchReviews()` |
| **Pura** (input → output, sin estado) | Utils (`app/utils/`) | `formatDistance()`, `sanitizeHtml()`, `slugify()` |
| **Event handler del template** (1-3 líneas, solo delega) | Componente — inline o función corta | `@click="save"`, `const onSubmit = () => save()` |
| **Específica de sub-sección UI** | Sub-componente (con su propio script) | `toggleDropdown()`, `handleDrag()` |

**Umbral operativo para funciones en componente**:

| Funciones en `<script setup>` | Estado | Acción |
|------------------------------|--------|--------|
| ≤ 5 | Verde | OK — handlers de template delegando a composables |
| 6–10 | Amarillo | Evaluar: ¿hay clusters de funciones del mismo concern? |
| > 10 | Rojo | Extraer obligatoriamente — agrupar funciones por concern en composables |

**Proceso de extracción de funciones**:

1. **Mapear concerns**: Listar cada función y etiquetar a qué concern pertenece (ej: "search", "filters", "map", "reviews", "contact")
2. **Agrupar**: Las funciones del mismo concern + su estado asociado (refs, computeds) forman un candidato natural a composable
3. **Extraer**: Mover el grupo completo a `useFeatureName()`. El composable retorna solo lo que el componente necesita
4. **Simplificar**: Las funciones puras que no tocan estado van a `utils/`, no al composable

```ts
// ❌ MAL: 20 funciones sueltas en SearchResults.vue <script setup>
const fetchResults = async () => { ... }
const applyFilters = () => { ... }
const updateLocation = () => { ... }
const toggleMapView = () => { ... }
const handleCardClick = (id: string) => { ... }
const loadMore = async () => { ... }
const sortBy = (criteria: string) => { ... }
const openFilterSheet = () => { ... }
const closeFilterSheet = () => { ... }
// ... más funciones

// ✅ BIEN: Concerns extraídos, componente orquesta
import { useSearch } from '~/composables/useSearch'
import { useSearchFilters } from '~/composables/useSearchFilters'
import { useSearchMap } from '~/composables/useSearchMap'
import { formatDistance } from '~/utils/format'

const { results, fetchResults, loadMore } = useSearch()
const { filters, applyFilters, toggleFilter } = useSearchFilters()
const { mapView, toggleMapView, updateLocation } = useSearchMap()
```

### Estrategias de extracción (en orden de preferencia)

1. **Extraer composable** — cuando la lógica (estado + side effects) es lo pesado. Patrón: `useFeature()` devuelve state + acciones, el componente solo consume y renderiza.
2. **Extraer sub-componente** — cuando hay una sección de template con su propia responsabilidad visual. Usa props down / events up. Nombrar como hijo acoplado: `DocEditorToolbar`, `DocEditorContent`.
3. **Extraer util** — cuando hay transformaciones puras (formateo, cálculos) inlineadas en el script.
4. **Combinar** — componentes grandes normalmente necesitan las 3 estrategias simultáneamente.

### Naming de componentes hijos acoplados

Seguir la convención Vue Style Guide (Priority B — Tightly coupled component names):

```
components/
├── search/
│   ├── SearchResults.vue         # Componente principal (orquestador)
│   ├── SearchResultsCard.vue     # Sub-componente: card de profesional
│   ├── SearchResultsFilters.vue  # Sub-componente: panel de filtros
│   └── SearchResultsMap.vue      # Sub-componente: mapa
```

El componente padre se convierte en un **orquestador delgado**: importa sub-componentes, les pasa props, escucha eventos, y delega la lógica pesada a composables.

### Patrón ejemplo: componente orquestador

```vue
<!-- SearchResults.vue — orquestador delgado -->
<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'
import SearchResultsCard from './SearchResultsCard.vue'
import SearchResultsFilters from './SearchResultsFilters.vue'

const props = defineProps<{ category?: string; location?: string }>()
const { results, loading, fetchResults } = useSearch(props)
</script>

<template>
  <div class="search-results">
    <SearchResultsFilters @apply="fetchResults" />
    <SearchResultsCard v-for="pro in results" :key="pro.id" :professional="pro" />
  </div>
</template>
```

### Regla de oro

> **Antes de agregar código a un archivo, revisa su tamaño. Si está en zona amarilla o roja, extrae primero — luego implementa el feature sobre la estructura limpia.**
>
> **Esta regla no es opcional.** Un archivo de 500 LOC en zona roja con "solo 5 líneas más" sigue siendo un archivo de 505 LOC en zona roja. La extracción es parte de la implementación, no un paso extra.

Esto no es refactoring por capricho. Es preparación del terreno para que el cambio sea más limpio, más pequeño y más fácil de revisar.

## Arquitectura de composables

Los composables son a la lógica lo que los componentes son a la UI. Un composable god es tan costoso como un componente god — difícil de entender, testear y modificar sin romper cosas.

**Fuentes**: Vue docs ("compose complex logic using small, isolated units, similar to how we compose an entire application using components"), Vue Composition API FAQ (Evan You muestra FolderExplorer con 6 concerns — solución: agrupar por concern y extraer cada uno en un composable; "reduced friction for refactoring is key to the long-term maintainability in large codebases"), Michael Thiessen (Thin Composables: separar lógica pura de reactividad; Hidden Composables: encontrar y extraer composables escondidos en tu código; Logic Composables: composables para organización, no solo reutilización), Vue School (state management patterns con Composition API: "dividing your application into independent parts that communicate with each other only with strictly defined APIs").

### Principio: Un composable, un concern

Un composable debe manejar **un dominio de datos** y exponer **una API cohesiva**. Si necesitas scroll para entender qué hace, ya hay más de un concern.

### Umbrales operativos para composables

El umbral general ya está en la tabla de componentes (composable > 300 LOC = zona roja). Además:

| Señal | Umbral verde | Umbral rojo |
|-------|-------------|-------------|
| Miembros en return | ≤ 15 | > 15 |
| Variables de estado (`useState`/`ref`) | ≤ 7 | > 7 |
| Entidades/recursos API gestionados | 1 | > 1 |

### Triggers de extracción para composables

Splitear si **cualquiera** es verdadero:

1. **Múltiples entidades** — el composable gestiona tasks Y projects Y shares. Cada entidad = su propio composable.
2. **Múltiples recursos API** — llama a `/api/tasks`, `/api/projects`, `/api/projects/:id/shares`. Cada familia de endpoints = su propio composable.
3. **Zona roja** — supera 300 LOC.
4. **Clusters de estado independientes** — grupos de `useState` que nunca se referencian entre sí dentro del composable.
5. **Return object masivo** — más de 15 miembros indica múltiples APIs mezcladas.
6. **Lógica duplicable** — patrones de optimistic update, fetch+rollback, debounced save que se repiten entre funciones y podrían abstraerse.

### Patrones de composición

#### 1. Composables anidados (composable composition)

Vue docs: "one composable function can call one or more other composable functions." Es el patrón principal para descomponer lógica compleja.

```ts
// ❌ MAL: Un god composable de 470+ líneas
export const useProfessionals = () => {
  // 13 useState, 6 computed, search, filters, reviews,
  // profile CRUD, geolocation, categories...
  return { /* 40+ miembros */ }
}

// ✅ BIEN: Composables por concern, orquestador los conecta
// composables/useSearch.ts — búsqueda + resultados + paginación
// composables/useSearchFilters.ts — filtros de búsqueda
// composables/useProfessionalProfile.ts — perfil individual
// composables/useReviews.ts — reseñas CRUD

export const useProfessionals = () => {
  const search = useSearch()
  const filters = useSearchFilters()
  const filtered = useSearchFilters(search.results)
  return { ...search, ...filters }
}
```

#### 2. Estado local vs compartido

**Estado dentro de la función** → cada llamada crea instancia propia. Ideal para lógica per-component.

**Estado fuera de la función (o `useState('key')`)** → singleton compartido. Usar para estado global (tasks, auth, preferencias).

**Regla**: `useState('key')` de Nuxt ya gestiona el singleton. Usarlo en vez de module-level refs.

```ts
// Local — cada componente tiene su propia copia
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

#### 3. Composable delgado (thin composable)

Separar lógica de negocio pura de la reactividad. Las reglas de negocio van en funciones puras testeables; el composable las envuelve con estado reactivo.

```ts
// utils/search-filters.ts — pura, testeable, sin Vue
export function filterByCategory(professionals: Professional[], category: string): Professional[] {
  return professionals.filter(p => p.categories.includes(category))
}

// composables/useSearchFilters.ts — envuelve con reactividad
export function useSearchFilters(professionals: Ref<Professional[]>) {
  const category = useState<string | null>('filter-category', () => null)
  const filtered = computed(() =>
    category.value ? filterByCategory(professionals.value, category.value) : professionals.value
  )
  return { category, filtered }
}
```

#### 4. Ref como parámetro (composable pipeline)

Conectar composables pasando refs de uno como inputs del siguiente:

```ts
const { results } = useSearch()
const { filtered } = useSearchFilters(results)       // recibe Ref<Professional[]>
const { sorted } = useSearchSorting(filtered)         // recibe Ref<Professional[]>
```

### Anti-patrones

| Anti-patrón | Problema | Solución |
|-------------|----------|----------|
| **God composable** | Gestiona múltiples entidades (search + reviews + profile) | Un composable por entidad/concern |
| **Mapper soup** | Funciones `mapProfessional()`, `mapReview()` inline en el composable | Mover a `utils/mappers.ts` — son funciones puras |
| **Optimistic boilerplate** | Cada CRUD repite snapshot → update → try/catch → rollback | Extraer helper reutilizable o función util |
| **Flag explosion** | 13+ useState para filtros y flags | Agrupar en composable de filtros dedicado |
| **Return gigante** | 40+ miembros en el return | Cada concern devuelve solo su API |
| **Dependencia oculta** | Composables comparten estado vía keys de useState sin hacerlo explícito | Pasar refs como parámetros; documentar keys compartidas |

### Proceso de extracción de composable god

1. **Mapear entidades**: Listar cada entity/resource que el composable gestiona (ej: professionals, reviews, categories, locations).
2. **Agrupar por entidad**: Estado + acciones + computeds que pertenecen a cada entidad.
3. **Identificar puentes**: ¿Qué datos necesita un concern del otro? (ej: filtros necesitan la lista de resultados de búsqueda).
4. **Extraer de abajo arriba**: Empezar por el concern más independiente (el que menos depende de otros).
5. **Conectar vía parámetros**: El composable orquestador pasa refs entre los especializados.
6. **Mover funciones puras**: Mappers, sanitizers, formatters → `utils/`.

### Ejemplo: useProfessionals (antes/después)

```
ANTES (1 archivo, 472 LOC, 40+ miembros en return):
composables/useProfessionals.ts → god composable

DESPUÉS (4 archivos, ~120 LOC cada uno):
composables/useSearch.ts              — state: results · búsqueda + paginación
composables/useSearchFilters.ts       — filtros por categoría, distancia, rating
composables/useProfessionalProfile.ts — perfil individual + galería + contacto
composables/useReviews.ts             — CRUD de reseñas + rating promedio
utils/professional-mappers.ts         — mapProfessional(), mapReview() (puras)
composables/useProfessionals.ts       — orquestador delgado que re-exporta
```

### Convenciones de composables

- **Naming**: `use` + dominio: `useSearch`, `useSearchFilters`, `useReviews`
- **Archivos**: Un composable exportado por archivo. El archivo se llama igual que la función.
- **Parámetros**: Aceptar `Ref<T>` o valor raw con `toValue()` cuando el input puede ser reactivo.
- **Return**: Objeto plano con refs (no `reactive`). Permite destructuring: `const { tasks } = useTasksCrud()`.
- **Cleanup**: Siempre limpiar side effects con `onUnmounted` (intervals, listeners, subscriptions).
- **Sin imports circulares**: Si A necesita B y B necesita A, hay un concern mal separado. Extraer la parte compartida a un tercer composable.

## Criterios de implementación

**Cada línea de código es deuda técnica.** Todo lo que escribimos hoy lo mantenemos mañana. La base de código ya es grande — cada cambio debe reducir complejidad o, como mínimo, no aumentarla.

- Antes de agregar código, busca si ya existe algo que resuelve lo mismo — si lo hay, reutiliza o refactoriza
- Si encuentras redundancia mientras trabajas, elimínala en el mismo PR
- Menos código > más código. Menos archivos > más archivos. Menos abstracciones > más abstracciones
- No dejes código muerto, imports sin usar, ni funciones que nadie llama
- Ejecutar directo y mantener simplicidad
- Resolver happy path end-to-end primero
- Posponer extras no esenciales para iteraciones futuras
- Sin optimización prematura
- Código auto-documentado con naming claro

## Convenciones de naming

- **Archivos**: kebab-case (`use-search.ts`, `professional-card.vue`)
- **Componentes**: PascalCase (`ProfessionalCard`)
- **Composables**: camelCase con prefijo `use` (`useSearch`)
- **Constantes**: SCREAMING_SNAKE_CASE (`PROFESSIONAL_STATUS`)
- **Tipos**: PascalCase (`ProfessionalStatus`, `CategoryType`)
- **Funciones**: camelCase (`formatDistance`, `getCategoryLabel`)

## Guías generales

- Preferir named exports sobre default exports
- Funciones puras cuando sea posible
- Documentar con comentarios solo reglas de negocio no obvias
- Early returns para reducir nesting
- Preferir explícito sobre clever
- Testear happy path a fondo antes de edge cases
