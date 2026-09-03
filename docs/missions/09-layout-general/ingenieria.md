# Misión: layout general (navbar, footer, TOS) — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-09-02

**Última actualización:** 2026-09-02

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: un layout de Nuxt nuevo (`general`) más dos componentes de header/footer, sin tocar la base de datos

`/buscar`, `/profesionales/[id]` y `/profesional/*` hoy usan `default.vue`, un layout vacío (`<slot />` sin
más — [E-001](./investigacion.md#e-001)). Esta misión agrega un layout `general.vue` que envuelve esas
cinco páginas con `AppHeader` + `AppFooter`, y reescribe `LandingNavbar`/`LandingFooter` para que compartan
diseño y componentes reales con el resto de la app, en vez de duplicar markup a mano en cada archivo.

No se crea ninguna tabla ni columna. Se agrega una sola query nueva de solo lectura (comunas frecuentes,
[TC-003](#tc-003)) sobre datos que ya existen, y se reutiliza `GET /api/professionals/me`
([E-012](./investigacion.md#e-012)) para saber si hay una sesión de profesional con perfil. El riesgo no
está en los datos — está en que el header/buscador viven ahora en un componente global que se monta en
cada página, así que su estado de sesión y su comportamiento tienen que quedar bien acotados para no
duplicar fetches ni filtrar lógica de edición de perfil hacia un componente que solo necesita leer.

- **Contratos de producto cubiertos:** F-001, F-002, F-003, F-004, D-002, D-005.
- **Riesgo bloqueante:** ninguno — el único riesgo real ([TR-001](#riesgos-y-experimentos-de-factibilidad),
  el botón "Buscar" tapado por el teclado virtual en mobile) se resuelve dentro de un slice, no invalida el
  diseño.

## Arquitectura: quién decide qué

| Componente                                            | Responsabilidad                                                                 | No debe decidir                                              | Contratos       |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------- |
| `app/layouts/general.vue` (nuevo)                      | Envolver `/buscar`, `/profesionales/[id]`, `/profesional/*` con `AppHeader` + `AppFooter` + `<slot />` | El contenido de cada página                                   | F-001, F-003     |
| `AppHeader.vue` (nuevo)                                | Layout del header general: botón de volver (destino según ruta), `CompactSearchBar` solo en `/buscar`, zona de avatar o vacía | Lógica de sesión (la consulta el composable); reglas del buscador (las resuelve `CompactSearchBar`) | F-001, D-005, TC-004 |
| `LandingNavbar.vue` (reescrito)                        | Header de la landing: logo, "Categorías" (ancla), Publícate/Mi perfil, `CompactSearchBar` inline tras scroll | Igual que `AppHeader`                                          | F-001            |
| `CompactSearchBar.vue` (nuevo, compartido)             | Resumen/botón (mobile) o campos inline (desktop) + panel abierto categoría→comuna; habilita "Buscar" solo con ambos elegidos; navega a `/buscar` | Reglas de negocio del buscador (categorías, comunas vecinas, orden de resultados) — F-002 lo excluye explícitamente | F-002, TC-002, C-016 |
| `AppFooter.vue` (nuevo)                                | Contenido real de los cinco grupos del footer                                    | —                                                                   | F-003            |
| `LandingFooter.vue` (reescrito)                        | Wrapper delgado que renderiza `AppFooter` — mismo patrón que `CategoriaSelect` sobre `CatalogSelect` (misión 03) | Contenido — nunca lo duplica                                    | F-003, D-002     |
| `LegalHeader.vue` (nuevo, chico, solo para las 2 páginas legales) | Chrome mínimo de Términos/Privacidad: back+título en mobile, logo+breadcrumb en desktop | Nada del header general — es un componente aparte, no un modo de `AppHeader` | F-004            |
| `useProfessionalSession()` (composable nuevo)          | Saber si hay un profesional con sesión **y** perfil, para el avatar del header  | Edición de perfil — eso sigue solo en `useProfessionalProfile` | D-005, TC-001    |
| `server/utils/comunas.ts::findComunasFrecuentes` (nuevo) | Top-3 comunas por profesionales activos                                        | —                                                                   | F-002, TC-003    |
| `GET /api/comunas/frecuentes` (nuevo)                  | Expone lo anterior, mismo patrón que `GET /api/comunas`                          | —                                                                   | F-002, TC-003    |
| `app/pages/legal/terminos.vue`, `.../privacidad.vue` (nuevas) | Renderizar el copy ya aprobado tal cual                                    | —                                                                   | F-004            |

## Contratos

<a id="tc-001"></a>

### TC-001 — `useProfessionalSession()` expone si hay un profesional con sesión y perfil completo

- **Entrada:** ninguna — es una función `async`, se llama con `await` desde el `<script setup>` de quien la
  consume; se resuelve en SSR (vía `useRequestFetch()`, misma cookie que usa
  `app/middleware/profesional.ts`) para que el HTML que llega al navegador ya traiga el estado de sesión
  correcto, sin un salto visible de "sin sesión" a "con sesión" tras la hidratación.
- **Salida:** `{ professional: ComputedRef<{ displayName: string, avatarUrl: string | null } | null>, pending: Ref<boolean> }`.
- **Invariantes:** `professional.value` es `null` tanto sin sesión como con sesión sin perfil todavía — un
  401 y un 404 de `GET /api/professionals/me` se tratan igual, nunca como error; el avatar del header solo
  aparece cuando hay alguien real a quien enlazar "Mi perfil". Comparte el `useState('professional-profile', ...)`
  de `useProfessionalProfile` para no duplicar el fetch en `/profesional/perfil`, la única página donde los
  dos composables conviven en el mismo momento.
- **Errores:** un 500 real de `GET /api/professionals/me` también resuelve a `professional.value = null` —
  el header nunca muestra un estado de error propio, solo "sin sesión" ([CL-003](./producto.md#f-001)).
- **Contrato de producto:** [D-005](./producto.md#d-005).

<a id="tc-002"></a>

### TC-002 — El botón "Buscar" del `CompactSearchBar` solo navega con categoría y comuna elegidas

- **Entrada:** `categoriaSlug: Ref<string | null>`, `comunaCodigo: Ref<string | null>` (precargados desde
  `route.query` cuando el componente ya vive dentro de `/buscar`).
- **Salida:** al confirmar, `navigateTo({ path: '/buscar', query: { categoria, comuna } })`.
- **Invariantes:** el botón permanece deshabilitado mientras falte cualquiera de los dos valores — nunca
  navega con uno solo. `/api/search` (misión 06) exige ambos parámetros; esta misión no cambia esa regla
  de negocio ([C-016](./investigacion.md#c-016)).
- **Errores:** ninguno propio — este contrato no hace ninguna llamada de red; la búsqueda la ejecuta
  `/buscar` con `useSearchResults`, ya existente y sin cambios.
- **Contrato de producto:** [F-002](./producto.md#f-002).

<a id="tc-003"></a>

### TC-003 — `GET /api/comunas/frecuentes` devuelve las comunas con más profesionales activos

- **Entrada:** sin parámetros.
- **Salida:** `{ comunas: { codigo: string, nombre: string }[] }`, máximo 3 filas, ordenadas por cantidad
  de profesionales con `active = true` en esa comuna, descendente.
- **Invariantes:** nunca incluye una comuna con `activa = false` — mismo filtro que `findActiveComunas`.
  Si ninguna comuna tiene profesionales activos todavía (realista en pre-lanzamiento), devuelve
  `{ comunas: [] }`, no un error — el panel de sugerencias entonces solo muestra el campo de texto, sin
  lista.
- **Errores:** ninguno específico — mismo manejo que `GET /api/comunas` (catálogo público, sin auth).
- **Contrato de producto:** [F-002](./producto.md#f-002).

<a id="tc-004"></a>

### TC-004 — El botón de volver del header general navega según dónde está, no según el historial del navegador

- **Entrada:** la ruta actual (`useRoute().path`).
- **Salida:** en `/buscar` → `navigateTo('/')`. En `/profesionales/[id]` y `/profesional/*` →
  `navigateTo('/buscar')`, conservando `categoria`/`comuna` de la búsqueda que trajo al usuario al perfil.
- **Invariantes:** nunca usa `router.back()` — el caso canónico de [F-001](./producto.md#f-001) es alguien
  que entra directo a un perfil desde un link de WhatsApp, sin historial de la app en el navegador; "atrás"
  del navegador en ese caso saldría de Datealo entero, no volvería a `/buscar`.
- **Errores:** —.
- **Contrato de producto:** [UXF-002](./experiencia.md#uxf-002).

## Modelo de datos

Sin entidades nuevas — ninguna tabla, columna ni migración. Lenguaje ubicuo relevante para esta misión:

| Término de producto                        | Entidad/campo en código                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| sesión de profesional activa (con perfil)   | `GET /api/professionals/me` responde 200                                       |
| sesión de profesional sin perfil todavía    | `GET /api/professionals/me` responde 404 — el header lo trata igual que "sin sesión" |
| comuna frecuente                            | comuna con más filas `professionals.active = true` agrupadas por `comuna_codigo` |
| botón de volver                             | destino calculado por ruta ([TC-004](#tc-004)), nunca `history.back()`         |

### Invariantes de datos

- No se agrega, cambia ni borra ninguna columna existente en `professionals`, `comunas` ni ninguna otra
  tabla.
- `findComunasFrecuentes` nunca cuenta profesionales inactivos ni comunas con `activa = false` — mismo
  filtro que ya aplican `findActiveComunas` y `existsActiveComuna`.

### Impacto en RLS

| Tabla         | Cambio                                                                 | Policy afectada                                          | Acción |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ | -------- |
| `professionals` | Ninguno — `GET /api/professionals/me` ya existe, ya pasa por `requireUser` + `findProfessionalByUserId` (la autorización real vive en ese endpoint, no en la policy, por A-002 del skill `arquitectura`) | `professionals_select_public`, `professionals_update_own` (sin cambios) | Ninguna — se reutiliza tal cual |
| `comunas`       | Ninguno — `findComunasFrecuentes` es una query de solo lectura nueva, sobre datos ya públicos, siguiendo el mismo patrón de acceso que `findActiveComunas` (Drizzle con rol dueño, sin policy porque `comunas` es catálogo de referencia sin escritura de usuario — ver el comentario de `rls.sql` sobre esta tabla) | Ninguna (la tabla no tiene policies, solo RLS habilitado + `revoke`) | Ninguna |

Ninguna tabla con datos de usuario cambia de ownership ni de relaciones usadas en policies — por eso no
hace falta tocar `server/db/sql/rls.sql` en esta misión.

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta | Qué invalida        | Experimento o mitigación  | Criterio de salida      | Estado  |
| ------ | ----------------- | ------------------- | -------------------------- | ------------------------ | ------- |
| TR-001 | El botón "Buscar" fijo en mobile puede quedar tapado por el teclado virtual al escribir la comuna (hallazgo de la evaluación heurística de `experiencia.md`) | Nada del diseño — es un detalle de implementación de `CompactSearchBar` | Usar `100dvh` (no `100vh`) en el contenedor de la hoja, y probar en un dispositivo real iOS + Android (los dos manejan el viewport con teclado abierto distinto) | El botón "Buscar" queda visible por encima del teclado en ambos sistemas, verificado en dispositivo real, no solo en el simulador del navegador | abierto — se cierra dentro de [S-005](#plan-de-construcción), no bloquea el resto del plan |

## Estrategia de pruebas

| Contrato o riesgo        | Nivel                    | Caso principal                                                        | Límite o falla |
| --------------------------- | --------------------------- | -------------------------------------------------------------------------- | ----------------- |
| TC-001                    | unidad (mock de `$fetch`)  | sesión + perfil existente → `professional` con `displayName`/`avatarUrl` | sin sesión (401) y sesión sin perfil (404) → ambos resuelven a `null`, nunca a un estado de error |
| TC-002                    | componente                | categoría y comuna elegidas → navega a `/buscar` con ambos en la query   | solo categoría elegida → el botón está deshabilitado, no navega ([C-016](./investigacion.md#c-016)) |
| TC-003                    | contrato (endpoint)       | 3 o más comunas con profesionales activos → top 3 por conteo, descendente | ninguna comuna con profesionales activos → `{ comunas: [] }`, no un error |
| TC-004                    | componente                | en `/profesionales/[id]` → vuelve a `/buscar` con los mismos filtros que traía | en `/buscar` → vuelve a `/`, nunca usa `router.back()` |
| F-003 (footer)            | integración/visual        | los cinco grupos son visibles en la landing y en `/buscar`, mismo diseño  | mobile 390px: los grupos se apilan sin acordeón, sin scroll horizontal |
| F-004 (legal)             | integración                | el copy real completo de `contenido/*.md` se renderiza sin truncar        | un link del footer a una página legal no publicada nunca aparece — regla explícita de F-004 |

### Propiedades que deben probarse

- `CompactSearchBar` nunca navega a `/buscar` con un solo filtro elegido, en ningún orden de interacción
  (invariante de [TC-002](#tc-002), cubre [C-016](./investigacion.md#c-016)).
- `useProfessionalSession` nunca deja `pending` en `true` indefinidamente si `GET /api/professionals/me`
  falla — siempre resuelve a `professional: null`.
- `AppHeader` nunca muestra el buscador compacto abierto y su resumen cerrado a la vez — regla ya fijada en
  F-002, se re-verifica acá porque ahora vive en un componente nuevo que la podría romper sin querer.

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                                              | Sustento                          | Criterio de aceptación principal                                                                 | Depende de | Issue |
| ----- | ------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------ | ----- |
| S-001 | Publicar las páginas de Términos y Condiciones y Política de Privacidad, con su propio header mínimo | F-004                              | `/legal/terminos` y `/legal/privacidad` renderizan el copy de `contenido/*.md` completo; en mobile el header es back+título, en desktop es logo+breadcrumb, sin buscador ni avatar | —          | [#148](https://github.com/PatricioTabilo/datealo/issues/148) |
| S-002 | Reescribir `AppFooter` con los cinco grupos reales; `LandingFooter` lo reutiliza          | F-003, D-002, TC-001                | En `/` y en cualquier página con `AppFooter`, el footer muestra Marca, Buscador, Profesional, Contacto y Legal (los links de S-001, ya publicados); el grupo Profesional dice "Publícate en Datealo" sin sesión, o "Mi perfil" con sesión activa (mismo criterio que el header, [D-005](./producto.md#d-005), consultado vía `useProfessionalSession`); mismo markup en ambos componentes; en mobile 390px se apila sin acordeón | S-001, S-003 | [#151](https://github.com/PatricioTabilo/datealo/issues/151) |
| S-003 | Crear `useProfessionalSession()`, compartiendo el `useState` de `useProfessionalProfile`  | TC-001, D-005                      | Con sesión y perfil → `professional` con datos; sin sesión → `null`; con sesión sin perfil → `null`, sin lanzar error; en `/profesional/perfil`, un solo `GET /api/professionals/me` se dispara aunque los dos composables estén montados | —          | [#149](https://github.com/PatricioTabilo/datealo/issues/149) |
| S-004 | Exponer `GET /api/comunas/frecuentes`                                                     | TC-003, F-002                      | 3+ comunas con profesionales activos → responde las 3 con más, ordenadas descendente; ninguna comuna con profesionales → `{ comunas: [] }` | —          | [#150](https://github.com/PatricioTabilo/datealo/issues/150) |
| S-005 | Construir `CompactSearchBar`: resumen + panel categoría→comuna, "Buscar" habilitado solo con ambos | TC-002, F-002, C-016, UX-001       | Mobile: hoja completa, categoría se abre primero, su lista de opciones queda directo debajo del campo activo; desktop: panel flotante inline; en ambos, "Buscar" deshabilitado hasta tener categoría y comuna; el botón fijo de mobile queda visible con el teclado virtual abierto ([TR-001](#riesgos-y-experimentos-de-factibilidad)) | S-004      | [#152](https://github.com/PatricioTabilo/datealo/issues/152) |
| S-006 | Construir `AppHeader`: botón de volver con destino por ruta, `CompactSearchBar` solo en `/buscar`, zona de avatar | TC-004, F-001, D-005, UX-003, UX-005 | Mobile: volver es solo ícono en toda superficie; desktop: volver lleva ícono+texto y el buscador queda centrado en un grid de 3 zonas; con sesión aparece el avatar a la derecha, sin sesión la zona derecha queda vacía fuera de la landing | S-003, S-005 | [#153](https://github.com/PatricioTabilo/datealo/issues/153) |
| S-007 | Crear el layout `general.vue` y aplicarlo a `/buscar`, `/profesionales/[id]`, `/profesional/*` | F-001, F-003                       | Las cinco páginas muestran `AppHeader` + `AppFooter` envolviendo su contenido actual sin cambiar su lógica interna; `npx nuxi typecheck` y `npm run build` pasan | S-002, S-006 | [#154](https://github.com/PatricioTabilo/datealo/issues/154) |
| S-008 | Reescribir `LandingNavbar`: "Categorías" + Publícate/Mi perfil (sin "Para profesionales" ni el CTA "Buscar" suelto), `CompactSearchBar` inline tras hacer scroll | F-001, D-005, UXF-003              | Antes de scroll: logo, Categorías (ancla), Publícate/Mi perfil; tras scroll: mismo nav pero con `CompactSearchBar` en vez de las anclas; con sesión activa, "Mi perfil" reemplaza a "Publícate" en ambos estados | S-003, S-005 | [#155](https://github.com/PatricioTabilo/datealo/issues/155) |

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — Un layout de Nuxt nuevo (`general.vue`) en vez de repetir `AppHeader`+`AppFooter` en cada página

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** F-001, F-003.
- **Alternativas descartadas:** poner `AppHeader`+`AppFooter` directo en el template de cada una de las
  cinco páginas afectadas — funciona, pero duplica el mismo wrapper cinco veces y diverge la primera vez
  que alguien edita una página sin acordarse de las otras cuatro.
- **Decisión y consecuencias:** un layout compartido; cada página solo aporta su contenido. Costo: una
  página que alguna vez necesite un header distinto al patrón general (ninguna hoy) tendría que salirse del
  layout — aceptado, no hay ningún caso así en esta misión.
- **Reapertura:** si una página futura necesita un header que no encaje en el patrón de `AppHeader`.

<a id="t-002"></a>

### T-002 — `LandingFooter` es un wrapper delgado sobre `AppFooter`, no un componente con el mismo contenido copiado

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** F-003, D-002.
- **Alternativas descartadas:** copiar el markup de los cinco grupos en los dos archivos (lo que existía
  hasta ahora entre `LandingFooter` y la ausencia de un footer general) — diverge en el primer cambio de
  copy o de estilo; un solo componente `Footer` importado directo en `index.vue`, sin ningún wrapper —
  técnicamente más simple, pero contradice [D-002](./producto.md#d-002), que decide explícitamente mantener
  `LandingFooter` y `AppFooter` como componentes separados por arquitectura (cada uno vive en su propio
  layout). D-002 descarta "un solo componente con variantes por prop", no descarta que dos componentes
  compartan su contenido por composición — es el mismo patrón que ya usa esta base de código
  (`CategoriaSelect`/`ComunaSelect` sobre `CatalogSelect`, T-003 de la misión 03).
- **Decisión y consecuencias:** dos archivos siguen existiendo (satisface D-002), pero `LandingFooter.vue`
  renderiza `<AppFooter />` sin agregar markup propio — cero contenido duplicado.
- **Reapertura:** si algún día el footer de la landing necesita contenido genuinamente distinto al general.

<a id="t-003"></a>

### T-003 — `useProfessionalSession()` comparte el `useState` de `useProfessionalProfile` en vez de duplicar el fetch

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** TC-001, D-005.
- **Alternativas descartadas:** un composable totalmente independiente con su propio `useState` — en
  `/profesional/perfil`, donde `AppHeader` y la página de edición conviven, esto dispararía dos fetches del
  mismo `GET /api/professionals/me` en el mismo render.
- **Decisión y consecuencias:** los dos composables leen/escriben el mismo `useState('professional-profile', ...)`,
  pero cada uno interpreta un fetch fallido distinto: `useProfessionalProfile` (protegida por el middleware
  `profesional`, que ya garantizó sesión+perfil antes de montar la página) trata cualquier falla como error
  real; `useProfessionalSession` (montada en páginas públicas, sin esa garantía) trata 401/404 como el
  estado normal "sin sesión". Costo aceptado: dos composables leyendo la misma clave de estado es un
  acoplamiento implícito que hay que recordar si alguno de los dos cambia de forma.
- **Reapertura:** si el fetch de `/api/professionals/me` alguna vez necesita paginar o cachear distinto
  para cada consumidor.

<a id="t-004"></a>

### T-004 — El botón de volver nunca usa `router.back()`, calcula el destino por ruta

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** TC-004, UXF-002.
- **Alternativas descartadas:** `router.back()` — se rompe exactamente en el caso que
  [F-001](./producto.md#f-001) nombra como ejemplo verificable: alguien que entra directo a un perfil desde
  un link externo (WhatsApp) no tiene historial de navegación dentro de la app; "atrás" del navegador ahí
  saldría de Datealo, no volvería a `/buscar`.
- **Decisión y consecuencias:** el destino se calcula a partir de la ruta actual, no del historial —
  funciona igual sin importar cómo se llegó a la pantalla. Costo: si el usuario navegó dentro de `/buscar`
  con filtros distintos varias veces, "volver" desde el perfil lo lleva a la última búsqueda que trajo al
  perfil, no a un paso intermedio — comportamiento ya definido en UXF-002, no un costo nuevo de esta
  decisión.
- **Reapertura:** —.

<a id="t-005"></a>

### T-005 — Términos y Privacidad usan un header propio y chico, no el layout `general` ni `AppHeader`

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Contratos:** F-004.
- **Alternativas descartadas:** meterlas en el layout `general.vue` junto con `/buscar` y el perfil — le
  agregaría un buscador y una zona de avatar irrelevantes a dos páginas de puro texto legal; los mockups ya
  aprobados en `design-mockups/terminos-privacidad.html` muestran un chrome distinto (back+título en
  mobile, logo+breadcrumb en desktop), no el patrón de `AppHeader`. Reusar `AppHeader` con props para
  "apagar" buscador y avatar — descartado, es forzar variantes en un componente pensado para tres
  superficies con una necesidad real de buscador/avatar, no para dos que nunca la tienen.
- **Decisión y consecuencias:** un componente `LegalHeader.vue` propio, chico, usado solo por estas dos
  páginas — no comparte código con `AppHeader` más allá del ícono de flecha, que es trivial.
- **Reapertura:** si en algún momento hay más de dos páginas de contenido puramente legal/estático, vale la
  pena revisar si ese patrón merece su propio layout.

## Preguntas

Sin preguntas abiertas — todas las decisiones necesarias para construir están resueltas en este documento.
La única incertidumbre real ([TR-001](#riesgos-y-experimentos-de-factibilidad), el teclado tapando el botón
"Buscar" en mobile) tiene una mitigación concreta y no bloquea el plan de construcción.
