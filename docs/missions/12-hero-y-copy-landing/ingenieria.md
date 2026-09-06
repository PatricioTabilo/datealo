# Misión: hero y copy de la landing — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-09-06, con TC-004 sumado y aceptado el mismo día
(ícono por opción en el dropdown, [D-005](./producto.md#d-005))

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para arquitectura, datos, contratos, factibilidad y pruebas. Consume el comportamiento
definido en producto. Una limitación técnica cambia el alcance solo mediante una decisión explícita en
producto.md.
-->

## Decisión técnica: copy estático + un componente de buscador nuevo, sin tocar backend ni schema

Todo el alcance de F-001 vive en el cliente: tres constantes de `app/constants/landing.ts` (contenido) y
un componente de buscador nuevo, `LandingHeroSearch.vue`, extraído de `LandingHero.vue` para que este
último se quede solo con texto e imagen ([vue-composition](../../.claude/skills/vue-composition/)). No hay
tabla, endpoint ni policy involucrados — el único riesgo real es que el override de `placeholder`/
`leadingIcon` que necesita `CatalogSelect` se filtre sin querer a los otros dos usos del componente
(registro y perfil de profesional).

F-002 suma un cambio autocontenido en `LandingNavbar.vue`: reemplaza el botón que hacía scroll a
`#profesionales` por un link directo, reusando `useProfessionalSession` — el mismo composable que
`AppHeader.vue` ya usa hoy para la misma decisión (sesión de profesional sí/no). No introduce ningún
concepto técnico nuevo.

- **Contratos de producto cubiertos:** F-001, F-002.
- **Riesgo bloqueante:** ninguno.

## Arquitectura: un componente de buscador nuevo, sobre el mismo `CatalogSelect` que ya existe

`LandingHero.vue` hoy mezcla texto, imagen y el buscador en un solo archivo. El buscador crece con esta
misión (dos bloques responsive, estado de "listo", shake al tocar incompleto), así que se extrae a su
propio componente — `LandingHero.vue` deja de conocer cómo funciona el buscador, solo lo renderiza.

`CatalogSelect` (y sus wrappers `CategoriaSelect`/`ComunaSelect`) ganan dos props opcionales,
`placeholder` y `leadingIcon`, sin tocar su comportamiento de selección — mismo patrón de wrapper delgado
que ya describe [T-003 de misión 03](../03-taxonomia-categorias-y-comunas/ingenieria.md#t-003): la
implementación (fetch, filtrado, apertura de la lista) sigue escondida en `CatalogSelect`, y
`LandingHeroSearch` solo le pasa su propio placeholder e ícono a través de `CategoriaSelect`/`ComunaSelect`.

| Componente             | Responsabilidad                                                          | No debe decidir                          | Contratos |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------- | --------- |
| `LandingHero.vue`        | Headline, subheadline, imagen, trust items, monta `LandingHeroSearch`       | Cómo se abre o filtra un catálogo           | F-001     |
| `LandingHeroSearch.vue`  | Los dos bloques responsive del buscador (mobile apilado, desktop en pill), estado "listo", shake al tocar incompleto, navegación a `/buscar` | El fetch o el filtrado de categorías/comunas | F-001     |
| `CatalogSelect.vue`      | Selección, filtrado y apertura de la lista (sin cambios de comportamiento) — gana `placeholder`/`leadingIcon` opcionales | Qué placeholder o ícono usar cada consumidor | F-001     |
| `CategoriaSelect.vue` / `ComunaSelect.vue` | Wrapper delgado: fija su composable de catálogo, pasa `placeholder`/`leadingIcon` si el consumidor los da | La lógica de selección (vive en `CatalogSelect`) | F-001     |
| `LandingNavbar.vue`     | Nav de la landing: logo, Categorías, Buscar, y el link de profesionales (gana el criterio de sesión) | Cómo se resuelve la sesión (vive en `useProfessionalSession`) | F-002 |

## Contratos

### TC-001 — `CatalogSelect`, `CategoriaSelect` y `ComunaSelect` aceptan `placeholder` y `leadingIcon` opcionales, sin cambiar su comportamiento por defecto

- **Entrada:** dos props nuevas, ambas opcionales, declaradas explícitamente con `defineProps` en los
  **tres** componentes (`CatalogSelect.vue`, y sus wrappers `CategoriaSelect.vue`/`ComunaSelect.vue` —
  hoy estos dos solo declaran `defineModel`, así que sin un `defineProps` propio cualquier prop nuevo
  llegaría por *attribute fallthrough* de Vue en vez de como prop tipada, que es justo lo que este
  contrato evita):
  - `placeholder?: string` — si no se pasa, usa el que ya trae cada wrapper hoy: "¿Qué necesitas?" en
    `CategoriaSelect`, "¿Qué comuna buscas?" en `ComunaSelect`.
  - `leadingIcon?: string` — nombre de ícono Iconify (mismo patrón que `trailing-icon="i-lucide-chevron-down"`
    que `CatalogSelect.vue:136` ya usa, ej. `"i-lucide-wrench"` / `"i-lucide-map-pin"`), no un componente.
    Si no se pasa, el campo no muestra ícono a la izquierda — comportamiento idéntico al actual.
- **Salida:** `CategoriaSelect`/`ComunaSelect` reenvían ambos props tal cual a `CatalogSelect`, que le pasa
  `leading-icon` al `UInput` interno solo cuando `leadingIcon` viene definido; el `placeholder` efectivo es
  el prop nuevo si existe, o el que cada wrapper ya trae por defecto.
- **Invariantes:** los tres usos actuales de `CategoriaSelect`/`ComunaSelect` (`LandingHero.vue`,
  `profesional/registro.vue`, `profesional/perfil.vue`) se ven exactamente igual que hoy si no pasan estos
  props — es un cambio aditivo, no una migración.
- **Errores:** ninguno nuevo — la selección, el filtrado y los estados de carga/error de `CatalogSelect`
  no cambian.
- **Contrato de producto:** [F-001](./producto.md#f-001), [D-003](./producto.md#d-003).

### TC-002 — El buscador del hero navega a `/buscar` con lo que esté elegido, y avisa con un shake si le falta algo

- **Entrada:** `categoriaSlug: string | null`, `comunaCodigo: string | null` (estado local de
  `LandingHeroSearch`), y el tap en el botón "Buscar".
- **Salida:** `navigateTo({ path: '/buscar', query })`, donde `query` solo incluye `categoria`/`comuna` si
  tienen valor — mismo comportamiento tolerante que existe hoy en `LandingHero.vue`.
- **Invariantes:** tocar "Buscar" nunca lanza una excepción ni bloquea la navegación aunque falte un
  campo. El shake es una animación puramente visual (una clase CSS que se agrega y se quita a los 200ms),
  no cambia ningún estado de datos.
- **Errores:** no aplica — no hay llamada a servidor en este contrato, solo navegación de cliente.
- **Contrato de producto:** [F-001](./producto.md#f-001), [UX-002](./experiencia.md#ux-002).

### TC-003 — `LandingNavbar` muestra "Publícate" o "Mi perfil" según la sesión de profesional, nunca ambos

- **Entrada:** `professional` de `useProfessionalSession()` (el mismo composable que ya usa
  `AppHeader.vue:25` — `const { professional } = await useProfessionalSession()`), sin parámetros nuevos.
- **Salida:** si `professional` es `null`/`undefined`, el link muestra "Publícate" y navega a
  `/profesional/registro`; si existe, muestra "Mi perfil" y navega a `/profesional/perfil`.
- **Invariantes:** el link de Categorías, el CTA "Buscar" y el comportamiento de scroll (fondo/padding) del
  nav no cambian. Nunca se muestran los dos textos a la vez. A diferencia de `AppHeader.vue` (que usa
  `v-if="professional"` sin `v-else`, y queda vacío sin sesión porque ahí es un acceso secundario), acá el
  link nunca queda vacío una vez que la sesión resuelve — necesita su propio `v-else`, no alcanza con
  copiar el `v-if` de `AppHeader.vue`. Qué se muestra mientras la sesión todavía no resuelve (el `await`
  inicial) no está definido por este contrato — ver [TR-002](#riesgos-y-experimentos-de-factibilidad).
- **Errores:** ninguno nuevo — `useProfessionalSession` ya maneja su propio estado de error/ausencia de
  sesión, sin cambios de esta misión.
- **Contrato de producto:** [F-002](./producto.md#f-002), [D-004](./producto.md#d-004).

### TC-004 — `CatalogSelect` acepta un mapeo opcional de ícono por opción, sin cambiar su comportamiento por defecto

- **Entrada:** un prop nuevo, opcional, en `CatalogSelect.vue`: `itemIcon?: (value: string) => Component`.
  Sin valor, la lista se ve igual que hoy (texto plano) — mismo criterio aditivo que TC-001.
  `CategoriaSelect.vue` lo reenvía como `itemIcon={(slug) => CATEGORIA_ICONS[slug] ?? Wrench}` (la misma
  fuente que ya usa `CompactSearchBarPanel.vue`); `ComunaSelect.vue` lo reenvía como una función constante
  que siempre devuelve `MapPin`.
- **Salida:** cuando `itemIcon` viene definido, cada opción de la lista renderiza el resultado de
  `itemIcon(item.value)` dentro de un círculo `bg-datealo-surface text-primary` (mismo estilo que
  `CompactSearchBarPanel.vue`), antes del label. Sin `itemIcon`, la opción renderiza solo el label, igual
  que hoy.
- **Invariantes:** `profesional/registro.vue` y `profesional/perfil.vue`, que no pasan `itemIcon`, se ven
  idénticos a antes del cambio. La selección, el filtrado y los estados de carga/error no cambian.
- **Errores:** ninguno nuevo.
- **Contrato de producto:** [D-005](./producto.md#d-005).

## Modelo de datos

No aplica. `LANDING_HERO`, `LANDING_SOLUTION` y `LANDING_FINAL_CTA` son constantes estáticas en
`app/constants/landing.ts` (`as const`, sin tabla ni endpoint detrás) — el cambio es solo a sus valores de
texto. Ningún dato de usuario ni de negocio se lee o escribe como parte de esta misión.

### Contenido final de `app/constants/landing.ts`

<!-- Copy real, sin em dash — ver docs/design/README.md "Reglas de contenido". -->

- `LANDING_HERO.headline`: "Deja de preguntarle al grupo del edificio"
- `LANDING_HERO.headlineAccent`: "y encuentra a alguien que sí te va a resolver."
- `LANDING_HERO.subheadline`: "Gasfiter, electricista, peluquera y más. Busca por categoría y comuna, no
  por quién contesta primero en el chat del edificio."
- `LANDING_HERO.trust`: `['Reseñas reales de tu zona', 'Ordenados por cercanía', 'Categorías claras']`
- `LANDING_HERO.tagline`, `cta`, `heroImage`: sin cambios.
- `LANDING_SOLUTION.subtitle`: "Eso es datealo. Un buscador de profesionales con reseñas reales, cerca de
  ti." (sale "verificados").
- `LANDING_SOLUTION.features[0]`: reemplaza el ítem de verificación completo (título, ícono y
  descripción, no solo la palabra) porque describía un proceso que no existe — icon: `LayoutGrid`, title:
  "Busca por categoría", description: "Gasfitería, electricidad, peluquería y más. Encuentra justo lo que
  necesitas, no un hilo de mensajes mezclado." `features[1..3]` (reseñas, cercanía, contacto directo): sin
  cambios.
- `LANDING_FINAL_CTA.subheadline`: "Ya podés buscar profesionales de tu zona, con reseñas reales. Sin
  registro, sin esperar." `headline`, `trust`, `cta`: sin cambios.

### Invariantes de datos

- No aplica — no hay entidad persistida.

### Impacto en RLS

| Tabla | Cambio | Policy afectada | Acción |
| ----- | ------ | ---------------- | ------ |
| — | ninguna tabla cambia | — | ninguna — el cambio no toca `server/db/` ni `server/db/sql/rls.sql` |

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta | Qué invalida | Experimento o mitigación | Criterio de salida | Estado |
| ------ | ------------------ | ------------- | -------------------------- | -------------------- | ------ |
| TR-001 | El override de `placeholder`/`leadingIcon`/`itemIcon` (TC-001, TC-004) podría filtrarse sin querer a `profesional/registro.vue` o `profesional/perfil.vue`, cambiando esas pantallas fuera del alcance de F-001 | El alcance ("no toca" otras pantallas) | Los props son opcionales con default `undefined`, y el mismo slice que los agrega verifica visualmente esas dos pantallas (`npm run dev`, 390px) sin pasar los props nuevos | Registro y perfil de profesional se ven idénticos a antes del cambio | abierto |
| TR-002 | El comentario de pausa del [issue #155](https://github.com/PatricioTabilo/datealo/issues/155) nombra "el CTA 'Publícate' como texto" junto al bug de mobile, sin aislar si el bug era del buscador tras scroll (fuera de este alcance), del CTA, o de ambos. Tampoco está definido qué muestra el link mientras `useProfessionalSession()` resuelve (el `await` inicial) | El criterio de aceptación de S-003 ("sin cambios de scroll, se ve igual que antes salvo el link") | Verificación manual en mobile (390px) del link nuevo, con y sin sesión, antes de dar S-003 por aceptado — si aparece algo parecido al bug original, se investiga como parte del mismo slice, no se ignora asumiendo que ya estaba resuelto | El link se ve y navega bien en 390px, en los tres momentos: cargando, sin sesión, con sesión | abierto |

## Estrategia de pruebas

| Contrato o riesgo | Nivel      | Caso principal                                                             | Límite o falla |
| ------------------ | ---------- | ---------------------------------------------------------------------------- | ---------------- |
| TC-001              | unidad     | `CatalogSelect` sin `placeholder`/`leadingIcon` se ve igual que hoy (snapshot de props por defecto) | con los props, el `UInput` recibe `leading-icon` y el `placeholder` pasado |
| TC-002              | unidad     | categoría y comuna elegidas → `navigateTo` recibe `{ categoria, comuna }`    | solo categoría elegida → tocar "Buscar" no navega y dispara el shake |
| CL-001 (producto.md) | manual    | copy revisado cabe en 390px sin desbordar (verificación visual, `npm run dev`) | — |
| TR-001               | manual     | `profesional/registro.vue` y `profesional/perfil.vue` sin cambios visuales tras el slice | — |
| TC-003               | unidad     | sin sesión → el link renderiza "Publícate" con `to="/profesional/registro"` | con sesión (`professional` mockeado) → renderiza "Mi perfil" con `to="/profesional/perfil"` |
| TR-002               | manual     | link en mobile (390px) sin sesión y con sesión, sin el bug del issue #155 | mientras `useProfessionalSession()` resuelve, el link no queda roto ni salta de layout |

### Propiedades que deben probarse

- Tocar "Buscar" nunca lanza una excepción, con cero, uno o los dos campos elegidos.
- El shake es puramente visual — no cambia `categoriaSlug` ni `comunaCodigo`, y no reintenta la navegación
  solo.

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                        | Sustento                    | Criterio de aceptación principal | Depende de |
| ----- | -------------------------------------------------------------------- | ------------------------------ | ------------------------------------ | ---------- |
| S-001 | Reescribir el copy del hero, `LandingSolution` y `LandingFinalCta` sin "verificado" | D-001, D-002, C-001 a C-004, C-006 | El texto de `app/constants/landing.ts` queda como en "Contenido final" de arriba; ninguna cadena visible en la landing usa "verificado"/"verificados" para describir profesionales; `npx nuxi typecheck` y `npm run build` pasan | — |
| S-002 | Rediseñar el buscador del hero como pill segmentada con íconos, siguiendo `CompactSearchBar` | D-003, D-005, UX-001, UX-002, TC-001, TC-002, TC-004 | `placeholder`/`leadingIcon` quedan declarados con `defineProps` propio en `CategoriaSelect.vue`/`ComunaSelect.vue` (no por fallthrough), `leadingIcon` tipado `string` (nombre Iconify, no `Component`). Mobile: dos campos apilados con ícono + botón ancho abajo. Desktop: pill horizontal con los dos campos y el botón. El dropdown de categoría muestra ícono por opción (`CATEGORIA_ICONS`), el de comuna muestra `MapPin` en todas (TC-004). Tocar "Buscar" con los dos campos elegidos navega a `/buscar` con la query; incompleto, hace shake y no navega. `profesional/registro.vue` y `profesional/perfil.vue` sin cambios visuales (TR-001). `npx nuxi typecheck` y `npm run build` pasan | S-001 (usa el copy ya actualizado en los placeholders de las pruebas manuales, aunque el componente en sí no depende del texto) |
| S-003 | Reemplazar "Para profesionales" en `LandingNavbar` por "Publícate"/"Mi perfil" | D-004, TC-003 | Sin sesión, el link dice "Publícate" y navega a `/profesional/registro`; con sesión (`useProfessionalSession`), dice "Mi perfil" y navega a `/profesional/perfil`. Categorías, Buscar y el comportamiento de scroll del nav no cambian. Verificación manual en mobile (390px), en los tres momentos (cargando, sin sesión, con sesión), sin el bug de mobile que motivó pausar el issue #155 (TR-002). `npx nuxi typecheck` y `npm run build` pasan | — |

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El buscador del hero se extrae a `LandingHeroSearch.vue`, `LandingHero.vue` se queda con texto e imagen

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Contratos:** F-001, [UX-001](./experiencia.md#ux-001).
- **Alternativas descartadas:** dejar todo en `LandingHero.vue` — se descarta porque el buscador pasa de
  un `<div>` con dos selects a dos bloques responsive completos con estado de "listo" y shake; mantenerlo
  inline mezclaría la responsabilidad de "texto de marketing" con "lógica de un formulario de búsqueda" en
  el mismo archivo.
- **Decisión y consecuencias:** `LandingHeroSearch.vue` nuevo, montado por `LandingHero.vue` sin props más
  allá de las que ya necesita el propio buscador (no recibe nada del padre). Costo: un archivo más; a
  cambio, `LandingHero.vue` queda legible como texto puro.
- **Reapertura:** —.

<a id="t-002"></a>

### T-002 — `CatalogSelect` gana `placeholder`/`leadingIcon` opcionales en vez de duplicar el componente para el hero

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Contratos:** F-001, [D-003](./producto.md#d-003).
- **Alternativas descartadas:** crear un `HeroCatalogSelect` aparte solo para el hero — se descarta porque
  duplicaría la selección, el filtrado y los estados de carga/error que `CatalogSelect` ya resuelve bien
  (ver el porqué de no unificar de más en
  [T-003 de misión 03](../03-taxonomia-categorias-y-comunas/ingenieria.md#t-003), aplicado acá al revés: sí
  es la misma regla, así que extender en vez de duplicar es lo correcto); hardcodear el placeholder e
  ícono del hero dentro de `CatalogSelect` mismo — se descarta porque cambiaría el look de
  `profesional/registro.vue` y `profesional/perfil.vue` sin que F-001 lo pida.
- **Decisión y consecuencias:** dos props opcionales (`placeholder: string`, `leadingIcon: string` — nombre
  Iconify, mismo patrón que `trailing-icon`), default `undefined`, declarados con `defineProps` propio en
  los wrappers (no por fallthrough), sin cambiar ningún consumidor existente (TR-001 cubre el riesgo de que
  se filtren igual). Corrección tras la auditoría independiente del 2026-09-04: la primera versión de este
  documento no declaraba el contrato en los wrappers ni tipaba `leadingIcon` como `string` — ver TC-001.
- **Reapertura:** —.

## Preguntas

Ninguna abierta.
