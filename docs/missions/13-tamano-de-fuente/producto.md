# Misión 13: Tamaño de fuente — Producto

**Estado:** vigente — aprobado por Patricio el 2026-09-06

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento es la spec viva del resultado: qué construimos ahora y bajo qué reglas. El porqué vive en
investigacion.md — aquí solo se enlaza. Se reescribe cuando el alcance cambia; no acumula historia.

Gate de salida — producto.md está listo para experiencia.md cuando:
- cada funcionalidad tiene formato JTBD, reglas y al menos un caso límite con comportamiento definido
- cada funcionalidad enlaza una conclusión de investigacion.md y una señal de éxito
- cada funcionalidad declara a qué lado del marketplace sirve, y qué necesita del otro lado para funcionar
- no hay decisiones de producto delegadas a diseño o ingeniería
- las decisiones propuestas tienen fecha límite en el README
-->

## Qué construimos: subir un escalón la escala tipográfica en buscador, cards y perfiles

<!--
El recorte vigente del ideal y por qué sigue entregando el resultado central. Máximo cuatro párrafos
cortos. El ideal completo vive en investigacion.md.
-->

**Resultado:** cualquier persona lee el nombre, la comuna, el precio, el rating, la descripción y el botón
de contacto de un profesional en el buscador, la card de resultados y ambos perfiles sin acercar el
celular ni entrecerrar los ojos — el texto secundario deja de estar en 12px, el principal deja de estar en
14px, y el tamaño y el color correctos quedan fijados como default del sistema, no como algo que dependa
de que cada archivo se edite a mano.

**Recorte respecto del ideal:** el ideal (ver [el ideal](./investigacion.md)) habla de una jerarquía que
se distingue por peso y color en vez de por tamaño. Esta entrega solo sube el tamaño de los dos
escalones actuales (12→14px, 14→16px); no rediseña la jerarquía visual (peso, color, espaciado) — eso
queda condicionado a [Q-001](#q-001), abierta.

**Restricciones aceptadas:** solo las cuatro superficies donde el dueño de producto detectó el problema —
buscador (`CompactSearchBar`, `CompactSearchBarPanel`), resultados de búsqueda (`buscar/index.vue`,
`SearchResultCard`, `SearchEmptyState`), perfil público (`[id].vue`, `ProfessionalPublicContactBar`,
`ProfessionalPublicReviews`, `ProfessionalPublicReviewCard`) y perfil de gestión (`perfil.vue`,
`ProfessionalAvatar`, `ProfessionalPhotos`, `ProfessionalCatalogRow`, `ProfessionalDataRow`,
`CatalogSelect`) — incluyendo todo texto de uso frecuente dentro de esos componentes, no solo el elemento
puntual que motivó la misión. No toca el hero de la landing (`LandingHeroSearch`, componente distinto, con
su tamaño ya cerrado en la misión 12), el formulario de reseña (`ProfessionalPublicReviewSheet`, es una
tarea, no lectura), ni ningún tamaño que ya esté en 16px o más (los nombres de perfil, ya en 20-24px, y
los inputs de estas superficies que no pisan el default de Nuxt UI — ver E-004).

## Funcionalidades

| ID    | Funcionalidad                                                    | Lado  | Sustento           | Éxito |
| ----- | ------------------------------------------------------------------ | ----- | -------------------- | ----- |
| F-001 | Subir un escalón el texto principal y secundario del buscador, la card de resultados y los dos perfiles | ambos | C-001, C-002, C-003, D-001, D-002 | M-001 |

<a id="f-001"></a>

### F-001 — Subir un escalón el texto principal y secundario del buscador, la card de resultados y los dos perfiles

<!--
Duplica este bloque por funcionalidad. Se escribe desde el resultado del usuario (working backwards):
primero el JTBD, después las reglas. Si la respuesta de Datealo no se puede describir sin hablar de tablas
o componentes, falta cerrar la decisión de producto.
-->

Cuando reviso resultados de búsqueda o el perfil de un profesional desde mi celular, en la calle o con
poca luz,
quiero leer el nombre, la comuna, el precio, el rating y la descripción sin acercar la pantalla,
para decidir a quién contactar sin el esfuerzo extra de forzar la vista.

**Lado del marketplace:** ambos — el buscador lee resultados y perfiles, el profesional lee y edita su
propio perfil de gestión con el mismo texto. **Qué necesita del otro lado:** nada — es un cambio de
legibilidad, no depende del volumen de oferta ni de cuántos profesionales o reseñas existan hoy.

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[C-003](./investigacion.md#c-003), [D-001](#d-001) y [D-002](#d-002). **Éxito:** [M-001](#m-001).

**Regla general (para que ningún componente de estas cuatro superficies quede afuera por accidente):** un
texto en 12px se mantiene en 12px solo si es un label de sección o un dato que se lee una sola vez y no
informa una decisión activa ni bloquea completar algo (ej. "En Datealo desde…", la fecha relativa de una
reseña, un badge de "verificado", los labels "Categorías"/"Comunas"/"Cerca de tu comuna"). Cualquier otro
texto de 12px en estas superficies —mensajes de error, hints de acción, nombres o comentarios de reseñas,
botones— sube a 14px como mínimo, y el texto que ya cumplía el rol "principal" de cada pantalla sube a
16px.

**Reglas por archivo:**

- `CompactSearchBar.vue`: el resumen de búsqueda ("Gasfitería en Ñuñoa") y las opciones de
  categoría/comuna del selector desktop pasan de `text-sm`/`text-xs` a `text-base`/`text-sm`. El botón
  "Buscar" del panel mobile pasa de `text-[0.9375rem]` (15px, no era ni siquiera un tamaño de la escala)
  a `text-base` (16px) — es un CTA, mismo criterio que el botón de contacto.
- `CompactSearchBarPanel.vue`: los nombres de categoría/comuna en la lista (`text-sm`) ya cumplen el piso
  de secundario y no suben — son contenido bajo el título de la pantalla ("¿Qué necesitas?"/"¿Dónde?", ya
  en `text-base`). Los labels "Categorías"/"Comunas" (11px) son exentos, igual que "En Datealo desde…".
- `AppHeader.vue:46`, las iniciales dentro del avatar circular de la nav (12px en un círculo de 36×36px),
  es exento — no es texto que se lea para decidir algo, es un glifo dentro de un ícono, y su tamaño ya
  escala con el del círculo que lo contiene, igual que las iniciales de los avatares más grandes
  (`SearchResultCard`, sidebar de `[id].vue`).
- `SearchResultCard.vue`: el nombre del profesional pasa de `text-sm` a `text-base`; comuna, rating y
  precio pasan de `text-xs` a `text-sm`. "En Datealo desde…" (11px) es exento — no sube.
- `buscar/index.vue`: el contador de resultados ("4 resultados") pasa de `text-xs` a `text-sm`. El
  mensaje de comunas vecinas ("Todavía no hay profesionales de X en Y") pasa de `text-sm` a `text-base` —
  es el título de facto de ese estado, no hay otro texto más grande arriba. El label "Cerca de tu comuna"
  (11px) es exento.
- `SearchEmptyState.vue`: ya cumple el patrón (título 16px, subtítulo 14px) — no cambia.
- `[id].vue`: la descripción y el precio pasan de `text-sm` a `text-base`; "En Datealo desde…" (12px) es
  exento — no sube, mismo criterio que en la card. El subtítulo de "no encontramos este perfil" ya cumple
  el patrón título/subtítulo (18px/14px) — no cambia.
- `ProfessionalPublicContactBar.vue`: el CTA "Escribir por WhatsApp"/"Llamar" deja de renderizar a 14px:
  pasa al tamaño que realmente rinde 16px en Nuxt UI (hoy `size="xl"`, o el default corregido por
  [D-002](#d-002)).
- `ProfessionalPublicReviews.vue`: el título "Reseñas" (`text-sm` extrabold, 14px) y el `cardHeading` de
  la invitación a reseñar ("¿Cómo te fue con...?") suben a `text-base` — mismo criterio que
  "Descripción"/"Precio" en el perfil de gestión, son encabezados de sección, no cuerpo de texto. El botón
  para abrir el formulario no cambia (ya está en 14px, cumple el piso); el formulario en sí queda fuera de
  alcance (ver más abajo).
- `ProfessionalPublicReviewCard.vue`: el nombre de quien reseña y el comentario pasan de `text-sm` a
  `text-base` (esto es lo que ya cubría "las reseñas" en la redacción original de esta regla). El badge
  "verificado" y la fecha relativa (11px) son exentos.
- `perfil.vue`: "Descripción", "Precio", sus valores y "Tus datos" pasan de `text-sm` a `text-base`.
  "Editar" y los mensajes de error de validación (`hasDescriptionError`, `hasPriceError`) pasan de
  `text-xs` a `text-sm` — un error bloquea guardar, no es texto que se lee una sola vez. "Cargando tu
  perfil…" y el error de carga (`loadError`, línea 69) pasan de `text-sm` a `text-base` — son el único
  contenido de esos dos estados, no hay ningún título más grande arriba (mismo criterio que el mensaje de
  comunas vecinas en `buscar/index.vue`).
- `ProfessionalAvatar.vue`: todo su texto de apoyo pasa de `text-xs` a `text-sm` — el hint sin foto ("Para
  que te reconozcan antes de escribirte. Opcional.", explica el porqué, no es decorativo), el hint con
  foto ("Toca la foto para cambiarla"), el link "Quitar foto" y los errores de subida/eliminación.
- `ProfessionalPhotos.vue`, `ProfessionalCatalogRow.vue`, `ProfessionalDataRow.vue`: sus mensajes de
  error de carga/guardado pasan de `text-xs` a `text-sm`, mismo criterio que los errores de `perfil.vue` —
  viven en la misma superficie de gestión, factorizados en componentes propios.
- `perfil.vue:138` (campo de precio) y `ProfessionalDataRow.vue:46` (campos de "Tus datos") pisan a
  propósito el default de `UInput` con `size="sm"` (14px) — pasan a `size="lg"` o `"xl"` para volver al
  16px que ya tiene el resto de los inputs de la app sin necesidad de ese override.
- `CatalogSelect.vue:174`, el botón "Reintentar" del selector de categoría/comuna, pasa de `size="sm"`
  (12px) a `size="md"` (14px) — ningún botón de estas superficies queda en 12px, mismo criterio general.
- Ningún texto de uso frecuente de estas superficies usa un modificador de opacidad (`text-datealo-text/50`,
  `/75`, etc.) para lograr un tono secundario — el único tono aceptado es `text-datealo-muted`, que ya
  cumple el contraste mínimo (E-005).
- Si un nombre o una comuna no entran en el ancho disponible de la card en 390px, Datealo sigue
  truncando con `…` — el tamaño más grande no cambia esa regla, solo cuánto texto entra antes de truncar.

**Fuera de esta funcionalidad:** `ProfessionalPublicReviewSheet.vue` (el formulario para escribir una
reseña) no está cubierto — es un flujo de completar una tarea, no de leer sin acercar la pantalla, y
ninguna evidencia de `investigacion.md` lo señaló como chico. Ver "Fuera de alcance".

**Ejemplo verificable:** dado un profesional con nombre "María Fernanda Rojas Ilabaca" en la comuna
"San José de Maipo" y precio "$25.000", cuando se abre la card de resultados en 390px de ancho, entonces
el nombre se ve en 16px, la comuna y el precio en 14px, y ninguno de los tres corta de forma distinta a
como corta hoy en 12/14px (mismo truncado, tamaño más grande).

**No incluye:** el rediseño de qué distingue visualmente al texto principal del secundario más allá del
tamaño (peso, color) — queda condicionado a [Q-001](#q-001). Tampoco incluye auditar cada `UButton` o
color de la app fuera de las cuatro superficies — solo el CTA de contacto, que vive en el perfil público.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

## Casos límite que cruzan funcionalidades

<!--
Solo condiciones que afectan varias funcionalidades. Las propias de una viven en su bloque. Un caso
retirado no se borra ni se reutiliza: conserva su fila, o se nombra con su motivo en una línea debajo.

Los casos límite propios de un marketplace pre-lanzamiento aparecen acá: cero resultados en una comuna,
un profesional sin reseñas, una categoría con un solo perfil, un perfil sin verificar.
-->

| ID     | Condición concreta                                                                 | Comportamiento esperado                                                                 | Funcionalidades |
| ------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------- |
| CL-001 | Nombre y comuna largos juntos en la card de resultados en 390px (ej. "María Fernanda Rojas Ilabaca" en "San José de Maipo"), con el texto más grande | Datealo sigue truncando cada línea con `…` por separado; la card puede crecer unos px de alto, pero nunca fuerza scroll horizontal ni corta a mitad de palabra sin `…` | F-001 |
| CL-002 | Retirada — evaluaba qué pasaba si D-002 corregía el default de `UButton` en `app.config.ts` en vez de subir cada CTA puntualmente | Ingeniería.md descartó esa vía (ver [T-001](./ingenieria.md#t-001)): su radio de efecto tocaba botones fuera de las cuatro superficies (`registro.vue`/`ingresar.vue`, los "Reintentar" que esta misión no cambia). El caso límite que anticipaba no llega a ocurrir | F-001, D-002 |

## Fuera de alcance

<!-- Distingue postergado de descartado y qué condición justificaría reabrirlo. -->

| Capacidad o caso                                                                 | Estado      | Razón del recorte | Condición para reconsiderar |
| ----------------------------------------------------------------------------------- | ----------- | -------------------- | ------------------------------- |
| Rediseñar la jerarquía visual con peso/color en vez de solo tamaño                   | postergada  | Q-001 sigue abierta: no sabemos todavía si subir el tamaño alcanza o si además hace falta tocar peso/color. Forzar un rediseño ahora sería adelantarse a esa respuesta. | Q-001 se resuelve y muestra que el tamaño solo no basta |
| Tocar el hero de la landing (`LandingHeroSearch`) o su CTA                           | descartada  | Es un componente distinto, con su tamaño ya cerrado como decisión vigente en la misión 12 (hero y copy de la landing) — no es parte de lo que Patricio señaló como chico | Evidencia nueva y específica sobre el hero, tratada como su propia misión |
| Subir tamaños que ya están en 16px o más (nombre de perfil, en 20-24px)             | descartada  | No hay evidencia (E-001, E-002, E-003) de que esos tamaños crucen ningún piso de legibilidad ni se vean chicos frente al benchmark | Evidencia nueva que muestre que esos tamaños también son un problema |
| Tamaños del formulario para escribir una reseña (`ProfessionalPublicReviewSheet`)   | descartada  | Es un flujo de completar una tarea, no de leer sin acercar la pantalla — investigacion.md nunca lo evidenció como parte de la sensación "chico" | Evidencia nueva y específica sobre ese formulario |
| Corregir el contraste de `text-datealo-text/50` en `LandingForProfessionals.vue` ("+200 reseñas") | descartada de F-001 | Es un componente de la landing, fuera de las cuatro superficies que abrieron esta misión — aunque E-005 lo documenta como evidencia de que la opacidad reduce contraste por debajo de AA | Es un bug de un archivo, 100% reversible: puede ir directo a issue sin misión (ver "Carril según riesgo" en `docs/missions/README.md`), no necesita esperar a esta misión |
| Auditar o cambiar el tamaño de cada `UButton`/color de la app fuera de las cuatro superficies | descartada de F-001 | El mecanismo de D-002 (si se implementa vía `app.config.ts`) puede afectarlos igual, pero revisar uno por uno que ningún layout se rompa es trabajo de ingeniería, no una funcionalidad nueva de esta misión | Ingeniería.md reporta una regresión real al implementar D-002 |

## Señales de éxito

<a id="m-001"></a>

### M-001 — Ningún texto de uso frecuente queda por debajo del piso de legibilidad definido

<!--
Datealo sigue sin usuarios ni analítica de uso (pre-lanzamiento): no hay ratio de comportamiento que
medir todavía. La señal disponible hoy es una verificación de diseño, no una métrica de producto — se
reemplaza por una señal de comportamiento real ni bien haya tráfico (ver revisión pendiente en M-001).
-->

- **Pregunta:** ¿el buscador, la card de resultados, los dos perfiles y su CTA de contacto dejaron de
  tener texto de uso frecuente en 12px, en 14px donde debía subir a 16px, o con opacidad reduciendo el
  contraste por debajo de 4.5:1?
- **Señal:** cero elementos de texto de uso frecuente (nombre, comuna, precio, rating, descripción,
  reseña, CTA de contacto) en `text-xs`, en un tamaño renderizado real bajo 16px, o con un modificador de
  opacidad sobre su color, en las cuatro superficies de F-001 — verificado contra las reglas de F-001.
- **Método y umbral:** revisión de código (grep de las clases listadas en F-001, más el tamaño renderizado
  real del CTA de contacto según el theme de Nuxt UI) más una captura en 390px de cada superficie,
  comparada antes/después. Umbral: 100% de los elementos listados en las reglas de F-001 migrados, cero
  regresiones en el resto de la app.
- **Guardrail:** ninguna card de resultados fuerza scroll horizontal en 390px, y el layout de los
  perfiles no rompe (validar con `npx playwright screenshot --viewport-size=390,844` por página tocada).

**Revisión pendiente:** cuando Datealo tenga tráfico real, reemplazar o complementar esta señal por una de
comportamiento (ej. tiempo en pantalla de resultados, tasa de contacto desde la card) — hoy no hay datos
de uso que la sostengan.

## Decisiones de producto

<!--
Solo decisiones con alternativas reales. No borres decisiones reemplazadas: explican por qué el producto
es como es. Toda decisión propuesta se refleja en el README con fecha límite.
-->

<a id="d-001"></a>

### D-001 — La escala tipográfica sube un escalón en cada rol: el secundario pasa de 12 a 14px, el principal de 14 a 16px

- **Estado:** aceptada — aprobado por Patricio el 2026-09-06. **Fecha:** 2026-09-06.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002).
- **Tensión:** legibilidad/accesibilidad (subir el tamaño) contra densidad visual (una card o un bloque de
  perfil ocupa más alto en pantalla, cabe menos contenido de un vistazo en 390px).
- **Alternativas descartadas:**
  - Mantener 12/14px y mejorar solo contraste o peso de fuente — descartada porque no resuelve el piso de
    accesibilidad de E-003 (16px como estándar práctico de body text mobile); el texto seguiría siendo
    chico, solo más oscuro.
  - Subir solo el texto principal (14→16px) y dejar el secundario en 12px — descartada porque el
    secundario (comuna, precio, rating) es justo el que C-002 identifica cruzando el piso de legibilidad;
    dejarlo intacto no cierra el problema que abrió la misión.
  - Saltar directo a valores mayores al benchmark de Airbnb (18px en el principal) — descartada por ahora:
    no hay evidencia (E-002 es de confianza baja, E-003 no lo exige) que sostenga ir más allá del piso de
    accesibilidad; sería sobre-corregir sin dato que lo respalde.
- **Decisión y consecuencia:** el texto de uso frecuente en las cuatro superficies de F-001 sube un
  escalón por rol: `text-xs`→`text-sm` en secundario, `text-sm`→`text-base` en principal. Esto exige que
  `experiencia.md` revise si el espaciado y el alto de la card de resultados siguen viéndose bien con más
  texto, y que ingeniería solo cambie clases Tailwind — no toca datos ni contratos.
- **Reapertura:** si tras implementarlo alguien (dueño de producto, un tester real) sigue viendo el texto
  chico, o si [Q-001](#q-001) concluye que hace falta un escalón más.

<a id="d-002"></a>

### D-002 — La corrección se fija como default del sistema, no como edición puntual de cada archivo

- **Estado:** aceptada — aprobado por Patricio el 2026-09-06. **Fecha:** 2026-09-06.
- **Sustento:** [C-003](./investigacion.md#c-003).
- **Tensión:** consistencia a prueba de error (fijar un default global que ningún componente nuevo pueda
  saltarse sin querer) contra flexibilidad puntual (poder ajustar un caso específico sin heredar ese
  default).
- **Alternativas descartadas:**
  - Editar cada `UButton` o clase de color caso por caso, confiando en que quien agregue un componente
    nuevo repita el patrón de memoria — descartada: es exactamente el riesgo que motivó esta decisión
    ("sin espacios para errores"); un componente nuevo puede reintroducir 12px o una opacidad sin que
    nadie lo note hasta que alguien vuelva a comparar con Airbnb.
  - Agregar una regla de lint/CI que bloquee `text-xs` y modificadores de opacidad en texto — descartada
    por ahora: exige mantener una lista de excepciones legítimas (ej. "En Datealo desde…" sí puede ser
    `text-xs`) y hoy el código no distingue "texto de uso frecuente" de "texto que se lee una vez" de
    forma que un lint pueda verificar solo; queda como opción a evaluar en `ingenieria.md` si el default
    de configuración no alcanza.
  - Documentar la regla en una guía de convenciones sin verificación técnica — descartada: una convención
    que nadie verifica es el mismo espacio para el error que esta decisión busca cerrar.
- **Decisión y consecuencia:** ingeniería.md evaluó el candidato de `app.config.ts` y lo descartó — su
  radio de efecto se sale de las cuatro superficies de F-001 (ver [T-001](./ingenieria.md#t-001)). El
  mecanismo real es distinto al que esta decisión imaginaba, pero cumple el mismo objetivo por otra vía:
  el piso tipográfico quedó agregado al skill `write-code`, que el proyecto invoca obligatoriamente antes
  de escribir o editar cualquier `.vue`/`.ts` — no es "una guía de convenciones sin verificación" (la
  alternativa ya descartada arriba), porque leerlo no es opcional ni depende de la memoria de quien
  escribe: es un paso del flujo, igual que `typecheck` antes de cerrar un cambio. Ningún componente propio
  de Datealo usa un modificador de opacidad sobre color de texto — el único tono aceptado para texto
  secundario es `text-datealo-muted`.
- **Reapertura:** si ingeniería.md encuentra que el default global rompe otros usos de `UButton` que
  dependían del tamaño chico a propósito (ej. un botón secundario de baja jerarquía visual).

## Preguntas

<!--
Solo preguntas que pueden cambiar una decisión o funcionalidad. Lo demás va a un issue.
Todas viven en esta tabla ordenada por ID, abiertas y cerradas juntas. Ningún ID se borra ni se reutiliza.
Estado: abierta | resuelta AAAA-MM-DD (alguien la respondió) | disuelta AAAA-MM-DD (el producto cambió y la
pregunta dejó de tener sentido). Solo las abiertas llevan bloque de detalle debajo de la tabla.
-->

Falta saber si subir el tamaño alcanza o si además hace falta rediseñar la jerarquía visual — sin
resolverla no se puede cerrar si `experiencia.md` solo ajusta números o también retoca peso/color.

| ID    | La duda                                                                              | Estado  | Respuesta, o quién la resuelve                                                                          |
| ----- | --------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Q-001 | ¿Alcanza con subir el tamaño (D-001), o el texto secundario necesita además más peso o contraste para distinguirse del principal? | resuelta 2026-09-06 | Dueño de producto, revisando la captura real en 390px de `SearchResultCard` (S-001 ya implementado): la jerarquía nombre 16px bold / secundario 14px normal se sostiene sola, sin necesidad de ajustar peso o contraste. |

<a id="q-001"></a>

### Q-001 — ¿Alcanza con subir el tamaño o hace falta además rediseñar la jerarquía visual?

- **La duda, con un ejemplo:** en `SearchResultCard`, si el nombre pasa a 16px bold y la comuna/precio a
  14px normal, ¿la diferencia se sigue notando de un vistazo, o el salto de un solo escalón (16 vs 14px)
  hace que ambos textos "compitan" visualmente y haga falta bajarle el peso o el contraste de color al
  secundario para que la jerarquía se mantenga clara?
- **Afecta a:** [D-001](#d-001) y [F-001](#f-001).
- **Cómo se resolvió:** el dueño de producto revisó la captura real de S-001 en 390px (PR #217, ya
  mergeado) y confirmó que la jerarquía se sostiene sola, sin ajuste de peso o contraste.
- **Resolución:** 2026-09-06 — no bloqueó nada; los tres slices (S-001 a S-003) se implementaron y
  mergearon con el criterio de `experiencia.md` sin cambios.
