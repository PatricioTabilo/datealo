# Misión 11: vista de detalle de perfil de profesional — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-09-04

**Última actualización:** 2026-09-04

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: reorganizar presentación en `app/`, sin tocar datos ni endpoints

F-001 reordena información que `GET /api/professionals/[id]` ya devuelve completa hoy
(`PublicProfessionalProfile`: nombre, categoría, comuna, precio, descripción, fotos, avatar, reseñas,
rating, fecha de alta) — auditado línea por línea contra `experiencia.md` y no falta ningún campo. Esta
misión no toca `server/`, `server/db/schema/` ni `server/db/sql/rls.sql`: es una reorganización de layout
en `app/pages/profesionales/[id].vue` y sus componentes hijos.

El riesgo real no está en los datos — está en que el requisito "el CTA nunca tapa nada, en cualquier
tamaño de pantalla y cualquier largo de contenido" ([D-003](./producto.md#d-003)) hoy se resuelve con
números adivinados (`pb-28` en el contenido, `pb-24` en `AppFooter`), justo el patrón que
[C-004](./investigacion.md#c-004) de `investigacion.md` señala como fràgil. Esta entrega lo reemplaza por
un mecanismo que mide el alto real de la barra en vez de asumirlo.

- **Contratos de producto cubiertos:** F-001.
- **Riesgo bloqueante:** ninguno — el mecanismo de medición (T-002) usa una API nativa del navegador
  (`ResizeObserver`), sin librería nueva, y es acotable a un spike de una tarde si algo no calza (ver
  TR-001).
- **Vocabulario:** sin términos nuevos. Esta misión no introduce ninguna entidad ni concepto de dominio —
  es reordenamiento de presentación sobre campos que `professionals` y `reviews` ya tienen nombrados
  (`domain-driven-design` clasifica subdominios de modelo de negocio, no páginas; la nota es solo para
  decir que no hay lenguaje ubicuo nuevo que acordar, no una clasificación formal de subdominio).

## Arquitectura: el layout se reorganiza en la capa de presentación, el resto no se entera

`[id].vue` sigue siendo el único que decide **dónde** vive cada bloque en pantalla; `ProfessionalPublicPhotos`,
`ProfessionalPublicReviews` y `ProfessionalPublicContactBar` no cambian su comportamiento interno — solo
cambia qué clases y en qué orden `[id].vue` los monta. El único código nuevo es un composable pequeño que
mide el alto real de la barra de contacto y lo expone como variable CSS, consumida por `AppFooter` (que
hoy tiene un valor fijo) y ya no por el propio `[id].vue` (que hoy tiene un buffer redundante que esta
reorganización elimina — ver T-002).

| Componente                        | Responsabilidad                                                        | No debe decidir                                          | Contratos      |
| ---------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- | -------------- |
| `[id].vue`                        | Orquesta el layout (grid desktop, orden mobile) y pasa datos a los hijos | Contenido visual de fotos, reseñas o el botón de contacto   | F-001          |
| `ProfessionalPublicPhotos.vue`    | Galería + miniaturas — sin cambios de comportamiento                    | El layout de la página que la envuelve                     | F-001          |
| `ProfessionalPublicReviews.vue`   | Lista de reseñas + invitación a dejar la primera — se corrige un caso, ver Modelo de datos | El layout de la página que la envuelve | F-001, CL-003 |
| `ProfessionalPublicContactBar.vue`| Botones de contacto — sin cambios                                       | Cuánto espacio reserva el resto de la página para no taparla | F-001, D-003 |
| `useContactBarHeight`             | Mide el alto real del elemento que le pasan y lo escribe en `:root`      | Qué elemento medir, ni quién consume el valor               | D-003, T-002   |
| `general.vue` / `AppFooter.vue`   | Consume la variable CSS como su propio `padding-bottom` **solo en mobile** — en desktop el CTA no es fijo y no reserva nada, igual que hoy | El valor de la variable — eso lo decide quien la setea | D-003, T-002 |

## Contratos

### TC-001 — `useContactBarHeight(barRef)` mide un elemento y publica su alto como variable CSS global

- **Entrada:** `barRef: Ref<HTMLElement | null>` — el elemento cuyo alto renderizado importa (la barra de
  contacto fija de mobile).
- **Salida:** ningún valor de retorno consumido por el llamador — el efecto observable es que
  `document.documentElement.style` gana la propiedad `--contact-bar-h: <alto en px>px` mientras el
  composable está montado, y la pierde (vuelve al fallback CSS) al desmontarse.
- **Invariantes:**
  - Lee `entry.contentRect.height` del callback de `ResizeObserver` (no `borderBoxSize`, que no tiene
    soporte parejo entre navegadores) — se fija acá para que quien escriba el test sepa exactamente qué
    forma de entrada simular, sin tener que decidirlo a mitad de la implementación.
  - Antes del primer callback (SSR, primer paint del cliente) no escribe nada — el consumidor siempre debe
    declarar su propio fallback (`var(--contact-bar-h, 6rem)`), nunca asumir que la variable ya existe.
  - `onUnmounted` limpia la propiedad (`removeProperty`) — navegar a otra ruta que use `general.vue` (ej.
    `/buscar`) no debe heredar el alto de una barra que ya no existe en el DOM. Esto cubre navegación entre
    rutas distintas; **no** cubre pasar de `/profesionales/A` a `/profesionales/B` sin salir de `[id].vue`
    — Vue Router reutiliza la instancia del componente cuando solo cambia el parámetro dinámico de la
    misma ruta, así que `onMounted`/`onUnmounted` no se disparan de nuevo. Hoy no hay ningún link directo
    de un perfil a otro (solo se llega vía `/buscar`, con unmount real), así que esto no es explotable
    todavía — queda anotado para que no se asuma cubierto si alguna vez se agrega un link de "profesionales
    relacionados".
  - No corre en servidor: la función es un no-op fuera de `onMounted` (`ResizeObserver` no existe en Nitro).
- **Errores:** ninguno — `barRef` en `null` (ej. la vista está en modo `cargando`, sin barra montada
  todavía) es un estado válido; el composable simplemente no observa nada hasta que la ref se llena.
- **Contrato de producto:** [F-001](./producto.md#f-001), [D-003](./producto.md#d-003).

## Modelo de datos

Sin cambios. `PublicProfessionalProfile` (`app/types/professional.ts`) ya trae cada campo que
`experiencia.md` reorganiza:

| Campo de `PublicProfessionalProfile`                          | Dónde se usa en la vista reorganizada                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `displayName`, `categoriaNombre`, `comunaNombre`, `priceFrom`   | Bloque de identidad bajo la galería (mobile y desktop)             |
| `photoUrls`, `avatarUrl`                                        | `ProfessionalPublicPhotos` — sin cambios                            |
| `description`                                                   | Bloque de descripción, tras identidad                              |
| `reviews`, `ratingAverage`, `reviewCount`                       | Resumen de rating en el sidebar (desktop) + sección de reseñas (`ProfessionalPublicReviews`, sin cambios) |
| `createdAt`                                                     | "En Datealo desde…", junto al bloque de contacto (UX-003)          |
| `contact`                                                       | `ProfessionalPublicContactBar` — sin cambios                        |

Los casos límite CL-001 (sin fotos), CL-002 (sin precio) y CL-004 (descripción corta o larga) ya están
cubiertos por la nulabilidad existente de estos campos — ninguno necesita un campo nuevo ni un cambio de
tipo, el `v-if` que ya existe alcanza.

**CL-003 no está cubierto hoy, y esta misión lo corrige.** `ProfessionalPublicReviews.vue:49` envuelve
toda la sección (título y bloque de invitación incluidos) en `v-if="reviews.length > 0 || hasToken"`.
`hasToken` solo se vuelve `true` después de que el visitante ya contactó al profesional
(`ensureToken()` corre en `ProfessionalPublicContactBar.vue:23`, al hacer clic en WhatsApp o llamar) — así
que cualquier visitante que **todavía no contactó** y ve un perfil sin reseñas no ve la invitación "Sé el
primero en contarle…": ve un hueco vacío. Esto contradice el "Ejemplo verificable" de
[F-001](./producto.md#f-001) (que describe a un visitante genérico, sin precondición de haber contactado)
y el propio [CL-003](./producto.md#cl-003) ("la sección de reseñas muestra la invitación... sin
condición"). Es un bug preexistente, no introducido por esta misión, pero esta misión es quien lo hace
visible (el mockup y `experiencia.md` ya asumen que funciona) y quien lo corrige — ver
[T-003](#t-003) y el slice S-005.

### Invariantes de datos

- Ninguna — no hay escritura nueva ni tabla nueva en esta misión.

### Impacto en RLS

| Tabla           | Cambio    | Policy afectada | Acción   |
| ---------------- | --------- | ---------------- | -------- |
| `professionals`  | ninguno  | —                 | ninguna  |
| `reviews`         | ninguno  | —                 | ninguna  |

Ninguna tabla ni columna cambia de ownership ni de relación. `professionals_select_public` (lectura
pública, `server/db/sql/rls.sql:55-57`) ya cubre exactamente el acceso que `GET /api/professionals/[id]`
hace hoy, sin cambios de forma de respuesta ni de columnas seleccionadas — el endpoint ya usa `select`
explícito (A-005), no la fila cruda de Drizzle. Verificado leyendo `server/api/professionals/[id].get.ts`
y `server/db/sql/rls.sql` completos antes de escribir esta sección, no asumido.

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta | Qué invalida | Experimento o mitigación | Criterio de salida | Estado |
| ------ | ------------------ | -------------- | --------------------------- | --------------------- | ------ |
| TR-001 | El toolbar dinámico de Safari/Chrome mobile (se esconde y aparece con el scroll) puede hacer que un elemento `position: fixed; bottom: 0` salte o quede mal alineado un instante — Chrome DevTools no reproduce este comportamiento, solo un dispositivo real lo muestra | El CTA fijo de mobile podría taparse o saltar en el dispositivo real aunque se vea perfecto en el emulador | Probar la vista en un iPhone y un Android reales (ya es requisito de `CLAUDE.md` para cambios de UI) antes de mergear el slice del CTA fijo | El botón queda visible y en la misma posición relativa al fondo de la pantalla durante scroll normal, en ambos dispositivos | abierto |

## Estrategia de pruebas

| Contrato o riesgo | Nivel                    | Caso principal                                                                 | Límite o falla |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| TC-001               | unidad (Vitest, jsdom)     | Con `ResizeObserver` simulado disparando una entrada con `contentRect.height: 84`, `--contact-bar-h` en `document.documentElement.style` queda `"84px"` | `barRef` en `null`: no lanza, no escribe nada. Al desmontar: la propiedad se remueve (`getPropertyValue` vuelve vacío) |
| F-001, CL-001, CL-002, CL-004 | componente (Vitest, jsdom) | `[id].vue` en modo `encontrado` con datos completos renderiza identidad+precio bajo la galería, sidebar con avatar+nombre+rating+CTA, reseñas fuera de ambas columnas | Cada caso límite (sin fotos, sin precio, descripción corta/larga) renderiza sin `v-if` roto ni bloque vacío visible |
| CL-003 (corregido por T-003) | componente (Vitest, jsdom), mismo patrón que `professional-reviews.test.ts` | Perfil sin reseñas y `hasToken` en `false` (visitante que no contactó): la sección "Reseñas" y la invitación "Sé el primero..." son visibles | Perfil con reseñas y `hasToken` en `true`: la invitación de "¿cómo te fue?" convive con la lista existente, sin duplicarse |
| D-003 (CTA nunca tapado) | visual, dispositivo real  | Ver TR-001 — este contrato no es testeable de forma significativa con Vitest/jsdom (no hay layout real ni `ResizeObserver` con medidas reales) | Verificación manual obligatoria en mobile real de 390px, siguiendo la sección "Verificación visual" de `CLAUDE.md` |

**Nota de infraestructura de test:** `jsdom` no implementa `ResizeObserver` (limitación conocida, sin
resolver) y el repo no tiene ningún polyfill ni mock compartido para esto hoy — el slice S-001 tiene que
definir un stub mínimo de `global.ResizeObserver` en su propio test, sin esperar que ya exista uno.

### Propiedades que deben probarse

- El fallback CSS (`var(--contact-bar-h, 6rem)`) sigue vigente en cualquier página que use `general.vue`
  sin montar `useContactBarHeight` (ej. `/buscar`) — no debe quedar en blanco ni en `0`.
- En desktop, `AppFooter` reserva `0` de espacio sin importar el valor de `--contact-bar-h` — la regla
  `lg:pb-0` de hoy tiene que seguir ganando en ese breakpoint (ver T-002).
- Desmontar `[id].vue` (navegar a `/buscar` u otra ruta) limpia `--contact-bar-h` y no deja observers
  activos. Esta propiedad cubre salir de la ruta, no cambiar de un perfil a otro dentro de la misma ruta
  (ver la invariante de TC-001 sobre reutilización de instancia de Vue Router).

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                                          | Sustento              | Criterio de aceptación principal | Depende de |
| ----- | -------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------ | ---------- |
| S-001 | Crear `useContactBarHeight` y conectar `AppFooter`/`general.vue` a `--contact-bar-h`   | TC-001, D-003, T-002     | Con un elemento de 84px de alto observado, el footer reserva 84px reales en mobile (en vez de los 96px fijos de hoy); en desktop reserva `0`, igual que hoy (`lg:pb-0` sigue ganando, sin importar el valor de la variable); en una página sin el composable montado (`/buscar`), el footer sigue reservando el fallback de 6rem en mobile y 0 en desktop, igual que hoy en ambos casos | — |
| S-002 | Reestructurar `[id].vue` (modo `encontrado`) a la jerarquía de UXF-001                 | UX-001, UX-002, UX-005, D-001, D-002 | En desktop, identidad+precio+descripción quedan en la columna de la galería y el sidebar (grid, `grid-row: span 2`) lleva solo avatar+nombre+rating+CTA+"en Datealo desde"; en mobile, el orden es foto → identidad+precio → descripción → reseñas → "en Datealo desde", con el CTA como overlay fijo; las reseñas quedan a ancho completo fuera de ambas columnas | S-001 |
| S-003 | Actualizar el skeleton de `cargando` a la forma nueva                                 | Reglas de F-001 ("no rediseña estados... más allá de que el esqueleto refleje las nuevas proporciones") | El skeleton muestra el bloque de galería + un bloque de identidad+precio agrupado, no líneas sueltas — no "salta" de forma al llegar los datos reales | S-002 |
| S-004 | Alt descriptivo en las miniaturas del carrusel, en vez de "Miniatura N"                | hallazgo de la evaluación heurística de `experiencia.md` (`web-design-guidelines`) | Cada miniatura anuncia qué foto activa (`"Ver foto 2 de 3 de {nombre}"` o equivalente), no solo su posición | — |
| S-005 | Mostrar la invitación a dejar la primera reseña aunque el visitante no haya contactado todavía | CL-003, T-003 | Perfil sin reseñas y visitante sin token: ve "Sé el primero en contarle..." + botón "Dejar una reseña". Perfil con reseñas y visitante con token: sigue viendo la lista de reseñas más la invitación a agregar la suya, sin duplicar nada | — |

Ningún slice depende de trabajo fuera de esta misión. S-004 y S-005 no dependen de ningún otro y pueden
mergearse en cualquier momento del lote — de hecho, dado que S-005 corrige un bug que ya afecta a
`/profesionales/[id]` hoy (no algo introducido por esta misión), conviene priorizarlo antes que S-002/S-003
si se quiere el fix en producción cuanto antes, en vez de esperar al resto del reordenamiento.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El layout de dos columnas de desktop pasa de `flex` a CSS Grid

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Contratos:** F-001, [UX-001](./experiencia.md#ux-001), [UX-005](./experiencia.md#ux-005).
- **Alternativas descartadas:** mantener `flex` y acotar el sticky del sidebar solo a la fila superior
  (como quedó en la primera versión del mockup) — descartada en `experiencia.md` porque deja el CTA fuera
  de vista durante toda la lectura de reseñas, contradiciendo el ideal de `investigacion.md`. Un segundo
  elemento `sticky` independiente calculado con JS (IntersectionObserver siguiendo el scroll) — descartada
  por agregar una dependencia de comportamiento en tiempo de ejecución para resolver algo que CSS Grid ya
  resuelve solo, en contra del principio de mantener la lógica de presentación lo más declarativa posible.
- **Decisión y consecuencias:** `grid-template-columns: 55fr 45fr` en el contenedor; el sidebar usa
  `grid-row: span 2` + `align-self: start` (el `align-self` es obligatorio — sin él el ítem se estira a la
  altura de la fila y el `sticky` no tiene margen para moverse); la sección de reseñas usa
  `grid-column: 1 / -1` y cae en una fila implícita nueva por auto-placement de CSS Grid, no en una "fila 2"
  literal (columna ocupada por el sidebar) — detalle verificado con DevTools en la evaluación heurística de
  `experiencia.md`, no solo leído del CSS. Consecuencia aceptada: quien lea el CSS por primera vez puede
  asumir que faltan filas explícitas — queda comentado en el componente para no repetir la confusión.
- **Reapertura:** si algún día la columna de reseñas necesita volver a vivir dentro de una de las dos
  columnas (por ejemplo, si UX-002 se revierte), este layout se revisa completo — no es un ajuste de una
  línea.

<a id="t-002"></a>

### T-002 — El espacio que reserva el CTA fijo de mobile se mide en tiempo real, no se adivina

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Contratos:** F-001, [D-003](./producto.md#d-003), sustentado en [C-004](./investigacion.md#c-004).
- **Alternativas descartadas:** subir el `pb-24` fijo de `AppFooter` a un número más grande (ej. `pb-32`) —
  descartada porque D-003 ya rechazó explícitamente esto en `producto.md`: sigue frágil si el contenido de
  cualquiera de las barras que usan ese buffer cambia a futuro (hoy son dos: el buscador compacto de la
  misión 09 y este CTA). Una librería de terceros para "safe area" o sticky bars — descartada por
  YAGNI: `ResizeObserver` nativo resuelve el problema completo sin dependencia nueva, y el proyecto no usa
  `@vueuse/core` ni ninguna librería equivalente hoy.
- **Decisión y consecuencias:** `useContactBarHeight` (TC-001) observa el elemento real de
  `ProfessionalPublicContactBar` con `ResizeObserver` y escribe `--contact-bar-h` en `:root`.
  `AppFooter.vue` cambia su clase de `pb-24 lg:pb-0` (usado hoy por `general.vue` para **todas** las
  páginas) a `pb-[var(--contact-bar-h,_6rem)] lg:pb-0` — mismo `lg:pb-0` de siempre, sin tocarlo: en
  desktop el CTA de esta vista es `lg:static` (ya no `fixed`, vive inline en el sidebar) y no reserva
  nada, exactamente igual que hoy. El cambio real es solo en mobile: el fallback de `6rem` (96px) preserva
  el comportamiento actual para páginas que no montan el composable (`/buscar`, con el buscador compacto
  de la misión 09, fuera de alcance de esta misión). Este punto se agregó tras una auditoría en agente
  separado que encontró la primera redacción de esta decisión sin la exclusión de desktop — sin ella, el
  slice S-001 solo habría regresionado el padding del footer en escritorio para **todas** las páginas que
  usan `general.vue`, no solo esta. El `pb-28` que hoy tiene el contenido de `[id].vue` (buffer redundante
  para el texto "en Datealo desde" antes del propio CTA) deja de necesitarse: en el nuevo orden mobile ese
  texto vive después de las reseñas, como último elemento antes del footer — un solo buffer (el de
  `AppFooter`) alcanza donde antes hacían falta dos.
- **Reapertura:** si `general.vue` alguna vez necesita más de una barra fija simultánea compitiendo por el
  mismo espacio reservado (hoy no ocurre: el buscador compacto vive en `/buscar`, este CTA en
  `/profesionales/[id]`, nunca las dos rutas a la vez), este mecanismo de una sola variable CSS deja de
  alcanzar y hay que revisarlo.

<a id="t-003"></a>

### T-003 — La invitación a dejar la primera reseña se muestra a cualquier visitante, no solo a quien ya contactó

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Contratos:** [CL-003](./producto.md#cl-003), F-001.
- **Alternativas descartadas:** dejar el comportamiento actual (invitación gateada por `hasToken`) y
  documentar la diferencia como "fuera de alcance" — descartada porque CL-003 y el "Ejemplo verificable"
  de F-001 ya son parte de lo aprobado en `producto.md`, no una funcionalidad nueva que se pueda recortar
  acá; ignorarlo dejaría `ingenieria.md` construyendo sobre un contrato que el propio `producto.md`
  contradice.
- **Decisión y consecuencias:** en `ProfessionalPublicReviews.vue`, la sección deja de estar gateada por
  `v-if="reviews.length > 0 || hasToken"` a nivel de toda la sección. El bloque de invitación/CTA de
  reseña pasa a mostrarse cuando `reviews.length === 0` (siempre, cumple CL-003) **o** cuando `hasToken`
  es verdadero (nudge a quien ya contactó, aunque ya haya reseñas de otras personas — comportamiento de
  hoy, se conserva). La lista de reseñas existentes se sigue mostrando siempre que `reviews.length > 0`,
  sin relación con `hasToken`. Con esto la sección entera queda visible en todos los casos que CL-001 a
  CL-003 describen, sin gateo previo.
- **Reapertura:** ninguna prevista — es la aplicación literal de un caso límite ya aprobado, no una
  apuesta a revisar más adelante.

## Preguntas

Sin preguntas abiertas — el diseño no depende de ninguna decisión que el dueño de producto todavía no haya
tomado.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de ingeniería |
