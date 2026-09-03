# Misión: vista de resultados de búsqueda — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-09-02

**Última actualización:** 2026-09-02

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: extender un contrato existente, sin tabla ni RLS nuevos

`/api/search` ya devuelve profesionales activos con `avatarUrl`. Los tres datos que faltan —foto de
trabajo, promedio de reseñas, cantidad de reseñas— ya existen en `professionals.photo_paths` y en la tabla
`reviews`; ninguno de los dos necesita una columna ni una tabla nueva. El trabajo es: (a) agregar el rating
con una sola consulta por búsqueda, no una por profesional, y (b) migrar `SearchResultCard.vue` y
`app/pages/buscar/index.vue` al layout de `experiencia.md`. No hay riesgo de arquitectura — es extender un
`select` y reescribir dos componentes ya existentes.

- **Contratos de producto cubiertos:** F-001, F-002.
- **Riesgo bloqueante:** ninguno.

## Arquitectura: mismas capas de A-001, sin una nueva

| Componente                                                          | Responsabilidad                                                                 | No debe decidir                              | Contratos |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- | --------- |
| `server/utils/reviews.ts` (`findRatingSummaries`)                   | Agregar rating y cantidad de reseñas por profesional, para un conjunto de ids     | Cómo se muestra el rating en la card           | TC-001    |
| `server/utils/professionals.ts` (`buildPhotoUrls`, ya existe)       | Construir la URL pública de una foto a partir de su path en Storage               | Cuál foto se usa (eso lo decide `search.ts`)   | TC-001    |
| `server/utils/search.ts` (`toSearchResult`, `findSearchResults`)    | Componer la forma pública de un resultado, combinando `professionals` + rating    | El orden de los resultados (sin cambios, D-001 de misión 06) | TC-001 |
| `server/api/search.get.ts`                                          | I/O: validar query params, delegar a `findSearchResults`                          | La forma de la respuesta (la define `search.ts`) | TC-001  |
| `app/types/search.ts` (`SearchResultProfessional`, copia manual del tipo del servidor — no se comparte vía import, es el patrón ya existente en el repo) | Reflejar la forma pública que el cliente puede usar | Cómo se calcula cada campo (eso lo decide el servidor) | TC-001 |
| `app/components/search/SearchResultCard.vue`                        | Renderizar un resultado: foto/avatar, rating, precio, antigüedad                  | Cómo se calculan esos datos                    | F-001, UX-001 |
| `app/pages/buscar/index.vue`                                        | Layout de la página: ancho máximo, grid, skeleton de carga                        | El contenido de cada card                      | F-002, UX-002, UX-003 |

## Contratos

### TC-001 — `GET /api/search` expone foto, rating y reseñas de cada resultado

- **Entrada:** sin cambios — `{ categoria: string, comuna: string }` por query string (ya validados por
  `search.get.ts`).
- **Salida:** `SearchResultProfessional` gana tres campos:

  ```ts
  export type SearchResultProfessional = {
    id: string
    displayName: string
    comunaNombre: string
    priceFrom: number | null
    avatarUrl: string | null
    photoUrl: string | null       // NUEVO — primera foto de trabajo, o null si no subió ninguna
    ratingAverage: number | null  // NUEVO — null si reviewCount es 0
    reviewCount: number           // NUEVO
    createdAt: string
  }
  ```

- **Invariantes:**
  - `photoUrl` es siempre la primera posición de `photoPaths` transformada a URL pública (`buildPhotoUrls(...)[0] ?? null`)
    — nunca una foto elegida por el cliente (F-001, "No incluye").
  - `ratingAverage` es `null` si y solo si `reviewCount` es `0` — nunca `0` ni `NaN` cuando no hay reseñas.
  - El redondeo de `ratingAverage` usa `computeRatingAverage` (ya existe en `reviews.ts`, testeado) — el
    mismo camino que usa el perfil público, para que el mismo profesional nunca muestre un promedio
    distinto en `/buscar` y en su perfil.
  - Una sola consulta a `reviews` por llamada a `/api/search`, sin importar cuántos resultados devuelva
    (evita N+1 — ver [T-001](#t-001)).
- **Errores:** sin cambios respecto al contrato actual (`400 { error: 'categoria_required' }`, etc.).
- **Contrato de producto:** [F-001](./producto.md#f-001).

## Modelo de datos

No hay entidades ni columnas nuevas. La tabla resume de dónde sale cada campo agregado:

| Dato            | Significado                              | Fuente                                                        | Retención o historial |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------------- | ---------------------- |
| `photoUrl`       | Primera foto de trabajo del profesional    | `professionals.photo_paths[0]`, ya existe (misión 04)              | Sigue la de `professionals` |
| `ratingAverage`  | Promedio de las reseñas del profesional    | `computeRatingAverage` (ya existe, misión 07) aplicado a cada grupo de `reviews.rating` — el agrupamiento por varios profesionales a la vez (`groupRatingsByProfessional`) es nuevo de esta misión, ver [T-001](#t-001) | Sigue la de `reviews` |
| `reviewCount`    | Cantidad de reseñas del profesional        | `COUNT` sobre `reviews`, mismo grupo                                | Sigue la de `reviews` |

### Invariantes de datos

- `photoUrl`, `ratingAverage` y `reviewCount` son derivados, calculados en cada request — ninguno se
  guarda en `professionals` ni se cachea. Con el volumen actual (decenas de profesionales, no miles) el
  costo de recalcular en cada búsqueda es despreciable; si eso cambia, es un problema de rendimiento a
  resolver aparte, no de consistencia de datos.
- La única fuente de verdad del rating sigue siendo la tabla `reviews` — `search.ts` no duplica el cálculo
  de promedio, reusa `computeRatingAverage` (ver T-001).

### Impacto en RLS

**Ninguna policy nueva ni modificada.** Los dos caminos de acceso que este cambio agrega ya están cubiertos
por lo que existe en `server/db/sql/rls.sql`, aunque por mecanismos distintos:

- `professionals` tiene la policy `professionals_select_public` (`using (true)`, misión 04) como respaldo
  explícito de lectura pública — así queda registrado incluso si algo llegara a consultarla por PostgREST.
- `reviews` **no tiene ninguna policy** — solo `enable row level security` + `revoke all on public.reviews
  from anon, authenticated` (líneas 138-140 de `rls.sql`). RLS habilitada sin policies es deny-all por
  default: `reviews` queda cerrada del todo a PostgREST, más estricta que `professionals`, no igual de
  abierta por una policy equivalente. La lectura real de ambas tablas ocurre por Drizzle con rol dueño
  (A-002), que bypassa RLS por completo — por eso el cambio no necesita tocar ninguna policy en ningún
  caso, aunque el mecanismo de cada tabla sea distinto.

No se agrega ninguna columna, tabla ni bucket; este cambio no toca ownership ni agrega un camino de
escritura.

| Tabla           | Cambio | Policy afectada | Acción |
| ---------------- | ------ | ---------------- | ------ |
| `professionals`  | ninguno (se leen columnas ya seleccionadas o ya públicas) | `professionals_select_public` (misión 04) | nada |
| `reviews`        | ninguno (se agrega una consulta de lectura, mismo criterio que ya usa `findReviewsForProfessional`) | ninguna — cerrada a PostgREST sin policy, se lee vía Drizzle | nada |

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta                                              | Qué invalida                     | Experimento o mitigación                                                        | Criterio de salida                              | Estado |
| ------ | ---------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- | ------ |
| TR-001 | La agregación de rating en JS (no `GROUP BY` en SQL) no escala si un profesional acumula cientos de reseñas | El tiempo de respuesta de `/buscar` | Mitigado por diseño: `findRatingSummaries` trae `professional_id` + `rating` con un `IN`, filtrado por el mismo índice único de `reviews` (`reviews_professional_id_token_key`, `professional_id` como columna líder) — no es un table scan | Si el volumen de reseñas por profesional crece a cientos, mover el promedio a `AVG()/GROUP BY` en SQL, replicando el mismo redondeo de `computeRatingAverage` | cerrado — aceptado con el volumen actual (ver [C-002](./investigacion.md#c-002): pocos profesionales por búsqueda es la restricción de esta etapa, no una excepción) |

## Estrategia de pruebas

| Contrato o riesgo                          | Nivel        | Caso principal                                                                 | Límite o falla |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------ | ---------------- |
| TC-001 (agrupar reseñas por profesional)      | unidad (`server/utils/reviews.test.ts`) | 3 reseñas de un profesional y 2 de otro, mezcladas en la misma lista, agrupan cada una en su profesional | lista vacía devuelve un `Map` vacío |
| TC-001 (promedio y conteo por grupo)          | unidad (`server/utils/reviews.test.ts`) | un grupo de 3 ratings produce el mismo promedio que `computeRatingAverage` ya calcula hoy | — (ya cubierto, se reusa la función existente) |
| TC-001 (forma pública del resultado)          | unidad (`server/utils/search.test.ts`)  | profesional con foto y 2 reseñas → `photoUrl` no nulo, `ratingAverage`/`reviewCount` reflejan las 2 reseñas | profesional sin fotos ni reseñas (CL-001) → `photoUrl: null`, `ratingAverage: null`, `reviewCount: 0` |
| F-001 (`SearchResultCard.vue`, mismo patrón de `CatalogSelect.test.ts`) | componente (`@vue/test-utils`, jsdom) | con `photoUrl` y `ratingAverage` renderiza la foto y la línea de rating           | sin `photoUrl` renderiza el fallback con avatar; sin `ratingAverage` no renderiza la línea de rating (nunca "0,0" ni vacía) |
| F-002 (`app/pages/buscar/index.vue`)          | manual (`npm run dev`, 390px y desktop ancho) | 1 resultado en desktop queda centrado, no en una esquina (CL-002)                | grid con 3 resultados mantiene el mismo alto entre una card con foto y una sin foto |

### Propiedades que deben probarse

- Ningún resultado de búsqueda expone más que `photoUrl` (string única) aunque el profesional tenga varias
  fotos de trabajo — el resto del array nunca sale de `server/utils/search.ts` (A-005: la forma pública no
  es la fila cruda).
- `ratingAverage` y `reviewCount` son consistentes entre sí en cualquier combinación de entrada — nunca
  `ratingAverage: null` con `reviewCount > 0` ni al revés.

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                                    | Sustento             | Criterio de aceptación principal                                                                                          | Depende de |
| ----- | ---------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| S-001 | Exponer foto, rating y cantidad de reseñas en `/api/search`                        | TC-001, F-001, T-001  | un profesional con 2 fotos y 3 reseñas devuelve `photoUrl` (la primera) y `ratingAverage`/`reviewCount` correctos; uno sin ninguna de las dos devuelve `null`/`null`/`0`; `app/types/search.ts` refleja los tres campos nuevos; `SearchResultCard.vue` sigue renderizando igual que hoy (campos nuevos sin consumir todavía) | — |
| S-002 | Migrar `SearchResultCard.vue` a la card vertical foto-arriba                       | F-001, UX-001, T-002, T-003 | con foto y rating, la card muestra ambos en el orden de "Jerarquía de información" de `experiencia.md`; sin foto cae al fallback con tinte de `--ui-primary` y avatar de `ProfessionalPublicPhotos.vue` (5.5rem); sin reseñas, la línea de rating no existe; la card es un `<a>` con foco y hover visibles | S-001 |
| S-003 | Layout de `/buscar` con ancho máximo y grid centrado                               | F-002, UX-002, UX-003, T-004 | en desktop, el contenedor no excede `max-w-6xl`; con 1 resultado la card queda centrada, no pegada a una esquina (CL-002) | — |
| S-004 | Actualizar el skeleton de carga a la forma de la card nueva                        | F-002, UX-003         | el skeleton usa la forma `aspect-4/3` + 3 líneas, no la fila horizontal actual — se mergea junto o después de S-002, nunca antes, para que la carga no "salte" de un skeleton vertical a una card vieja horizontal | S-002 |

S-002 depende de S-001 porque consume sus campos nuevos. S-003 (ancho máximo + grid) es independiente de
los otros tres y puede ir en paralelo — toca el contenedor de la página, no el contenido de la card. S-004
se separó de S-003 en la auditoría de este documento: el skeleton vive en el mismo archivo que S-003
(`app/pages/buscar/index.vue`), pero su forma correcta depende de que `SearchResultCard.vue` (S-002) ya
tenga el layout vertical — mergear el skeleton nuevo sin la card nueva produce exactamente el salto visual
que `experiencia.md` ("Decisiones que no deben quedar implícitas") dice que no debe pasar.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El rating se agrupa en JS con una sola consulta `IN`, reusando `computeRatingAverage`

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** TC-001.
- **Alternativas descartadas:** (a) `AVG()/GROUP BY` en SQL — transfiere menos bytes, pero reimplementa el
  redondeo que `computeRatingAverage` ya define y testea; el riesgo real es que el perfil público y los
  resultados de búsqueda terminen mostrando un promedio distinto para el mismo profesional por dos
  redondeos que divergen. Con el volumen actual (docenas de reseñas, no miles) esa diferencia de bytes no
  compensa el riesgo. (b) Llamar `findReviewsForProfessional` una vez por resultado — descartada, es
  exactamente el N+1 que el skill `discovery-engineering` marca como antipatrón.
- **Decisión y consecuencias:** `findRatingSummaries(professionalIds)` trae `{ professionalId, rating }`
  de `reviews` con un solo `WHERE professional_id = ANY(...)`, agrupa con la función pura
  `groupRatingsByProfessional` (testeable sin base de datos), y aplica `computeRatingAverage` por grupo.
  Consecuencia aceptada: si el volumen de reseñas por profesional crece mucho, esta consulta trae más
  filas de las que un `GROUP BY` traería — ver [TR-001](#riesgos-y-experimentos-de-factibilidad).
- **Reapertura:** si TR-001 se cierra por volumen real, no por vencimiento de fecha.

<a id="t-002"></a>

### T-002 — `SearchResultProfessional.photoUrl` es una sola URL, no el array completo

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** [F-001](./producto.md#f-001) ("No incluye": la card nunca deja elegir qué foto ver).
- **Alternativas descartadas:** exponer `photoUrls: string[]` completo, igual que el perfil público —
  descartada porque la card nunca muestra más de una foto; el resto del array serían bytes que el cliente
  descarga y nunca usa.
- **Decisión y consecuencias:** se exporta `buildPhotoUrls` desde `professionals.ts` (ya existe, privada) y
  `search.ts` la reusa, tomando `[0] ?? null`. Cero lógica de construcción de URL duplicada.
- **Reapertura:** si F-001 cambia para mostrar más de una foto en la card (fuera del alcance de esta
  misión), se reevalúa exponer el array completo.

<a id="t-003"></a>

### T-003 — `SearchResultCard.vue` no reusa `ProfessionalPublicPhotos.vue` para su slot de imagen

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** [UX-001](./experiencia.md#ux-001) (mismo lenguaje visual — `aspect-4/3`, avatar como
  fallback — que el perfil público).
- **Tensión:** mismo criterio visual (aspect-4/3, fallback con avatar) frente a necesidades de interacción
  distintas (`ProfessionalPublicPhotos.vue` es un carrusel con miniaturas para varias fotos; la card
  siempre muestra una sola, sin interacción — F-001 lo excluye explícitamente).
- **Alternativas descartadas:** reusar `ProfessionalPublicPhotos.vue` directo — traería `UCarousel` y la
  tira de miniaturas que la card nunca necesita, agregando peso y comportamiento sin uso. Forzar un prop
  "modo simple" en `ProfessionalPublicPhotos.vue` — el componente terminaría con condicionales para dos
  casos de uso genuinamente distintos, exactamente el caso que `discovery-engineering` marca como
  abstracción equivocada ("¿es la misma regla, o dos reglas que hoy se ven parecidas?" — acá son dos).
- **Decisión y consecuencias:** `SearchResultCard.vue` implementa su propio slot de imagen (mismas clases
  `aspect-4/3`, mismo criterio de fallback con avatar sobre `bg-primary/10`) — es duplicación deliberada de
  markup chico, no una regla compartida forzada.
- **Reapertura:** si en el futuro la card necesita mostrar más de una foto, se reevalúa si a esa altura sí
  conviene una interfaz común entre ambos componentes.

<a id="t-004"></a>

### T-004 — El grid de `/buscar` en desktop usa columnas `auto-fit` vía valor arbitrario de Tailwind

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** [UX-003](./experiencia.md#ux-003).
- **Alternativas descartadas:** mantener `lg:grid-cols-3` y centrar manualmente según la cantidad de
  resultados en el componente — descartada, `auto-fit` + `justify-center` resuelve lo mismo en CSS puro,
  sin lógica condicional en `buscar/index.vue`.
- **Decisión y consecuencias:** `class="grid lg:[grid-template-columns:repeat(auto-fit,minmax(17.5rem,23.75rem))] lg:justify-center gap-4"`
  en el contenedor de resultados de `buscar/index.vue`, reemplazando `lg:grid-cols-3`. Mismo criterio que
  ya usa el mockup (`docs/missions/10-vista-resultados-busqueda/design-mockups/resultados-busqueda.html`).
- **Reapertura:** si Tailwind v4 agrega soporte nativo a `auto-fit` sin valor arbitrario, se simplifica la
  clase sin cambiar el comportamiento.

## Preguntas

Ninguna abierta — el diseño no dejó ninguna decisión pendiente para el momento de cortar en slices.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de ingeniería |
