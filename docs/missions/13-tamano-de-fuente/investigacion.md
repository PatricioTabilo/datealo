# Misión 13: Tamaño de fuente — Investigación

**Estado:** activo

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento se acumula: la evidencia y las conclusiones no se borran cuando el alcance cambia, porque
explican por qué el producto es como es. Lo que sí se actualiza es el ideal, que resume la dirección que
la investigación sostiene hoy.

Gate de salida — la investigación sostiene un producto.md cuando:
- el problema tiene situación y consecuencia concretas, no una categoría abstracta
- al menos una conclusión con confianza alta o media respalda la dirección
- el ideal describe capacidades observables, no intenciones
-->

## El problema aparece cuando Patricio compara Datealo con Airbnb en su propio celular

<!--
Una situación real o reconstruida con precisión. No abras con una categoría como "falta de confianza" —
abre con quién estaba haciendo qué y qué salió mal. Nombra a la persona y el servicio concreto.
-->

**Situación:** Patricio (dueño de producto) recorre el buscador, las cards de resultados y el perfil de
profesional (el público y el de gestión) desde su celular, y los pone al lado de Airbnb en la misma
pantalla. No hay todavía un usuario real reportando esto — Datealo sigue pre-lanzamiento.

**Acción o necesidad:** decidir si el texto de esas cuatro superficies es tan chico como se siente a
simple vista, o si es una impresión que no aguanta la comparación con números reales.

**Respuesta actual:** ninguna medición hasta ahora. Cada componente quedó con el tamaño que trajo Tailwind
o Nuxt UI por defecto al construirse (`text-xs`, `text-sm`, etc.), sin que nadie fijara una escala
tipográfica a propósito — no es una decisión que se esté revirtiendo, es la primera vez que se mira.

**Consecuencia:** sin comparar tamaños reales (los de Datealo hoy, los de un benchmark, y el piso de
legibilidad mobile) no se puede saber si achicar el texto fue un problema real o una sensación — y
cualquier cambio a ciegas puede subir un componente y dejar intacto otro con el mismo patrón.

## Preguntas que la investigación debe resolver

<!--
Solo preguntas capaces de cambiar el ideal o una decisión. Al resolver una, moverla a evidencia o
conclusión. No es un backlog.
-->

- ¿La brecha es de tamaño puro (subir un escalón alcanza) o de jerarquía visual (el texto secundario
  necesita distinguirse del principal con peso/color en vez de con un tamaño que ya cruza el piso de
  legibilidad)? Decide si el fix es una escala nueva o un rediseño de qué es "principal" y qué es
  "secundario" en cada superficie.
- ¿Cuál es el piso de legibilidad que Datealo se compromete a no cruzar, independiente de qué tamaño use
  Airbnb? Decide si la meta es "igualar al benchmark" o "cumplir un mínimo propio de accesibilidad".

## Evidencia

<!--
Un hecho verificable con fuente y límite. Prioriza observación directa, entrevistas y comportamiento
comprobado. Los benchmarks de otros productos también son evidencia: qué hacen, qué trade-off eligieron y
qué no aplica a Datealo.

Datealo no tiene datos de uso propios todavía. Cuando la única evidencia disponible sea un benchmark o
una entrevista, la columna "límite" es lo que impide que se lea como dato duro.
-->

| ID    | Tipo        | Fuente                                                              | Hecho verificable | Límite de la evidencia |
| ----- | ----------- | -------------------------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código      | `SearchResultCard.vue`, `CompactSearchBar(Panel).vue`, `buscar/index.vue`, `perfil.vue`, `[id].vue` y los componentes que factorizan cada superficie (`ProfessionalAvatar`, `ProfessionalPhotos`, `ProfessionalCatalogRow`, `ProfessionalDataRow`, `ProfessionalPublicContactBar`, `ProfessionalPublicReviews(Card)`) | Datealo usa 12px (`text-xs`) para metadata, errores de validación, hints de acción y el contador "N resultados" de la lista, y 14px (`text-sm`) para el texto principal, en las cuatro superficies — el patrón no se limita a los 4 archivos de página, se repite en cada componente que factoriza contenido de esas superficies | describe qué se implementó, no cómo lo percibe un usuario real |
| E-002 | benchmark   | [Superdesign — Airbnb design system breakdown (2026)](https://superdesign.dev/blog/airbnb-design-system) | Airbnb usa 16px/600 para el título de una card de listado y 14px/400 para su descripción, contra 14px/12px en el equivalente de Datealo | valores reconstruidos por un tercero ("community-observed, not Airbnb-published"), no la spec oficial de Airbnb, y Airbnb opera con otra escala de datos y de uso |
| E-003 | accesibilidad | [The A11Y Collective — WCAG minimum font size](https://www.a11y-collective.com/blog/wcag-minimum-font-size/), [Recite Me — accessible font size](https://reciteme.com/news/accessible-font-size/) | 16px es el piso práctico aceptado para body text en mobile (18px si el público es 50+); 14px queda documentado como insuficiente para lectura cómoda en celular | agrega guías de terceros, no cita la norma WCAG primaria línea por línea; WCAG en sí no fija un mínimo en px |
| E-004 | código      | `node_modules/@nuxt/ui` (theme de `button` e `input`), `ProfessionalPublicContactBar.vue`, `perfil.vue`, `ProfessionalDataRow.vue`, `CatalogSelect.vue` | El tamaño real de texto en Datealo no depende solo de las clases `text-*` que escribimos: el theme de Nuxt UI fija que un `UButton` en `size="sm"`/`"md"`/`"lg"` renderiza a 12-14px y solo `size="xl"` llega a 16px — el CTA "Escribir por WhatsApp" usa `size="lg"` (14px) y el botón "Reintentar" de `CatalogSelect.vue` usa `size="sm"` (12px). Los `UInput`/`UTextarea` sin `size` explícito rinden en 16px por defecto, pero dos instancias lo pisan con `size="sm"` (14px): el campo de precio de `perfil.vue` y el de `ProfessionalDataRow.vue` | describe el theme de la librería en esta versión, no una auditoría de cada componente Nuxt UI que Datealo usa |
| E-005 | código + cálculo de contraste | `main.css` (`--color-datealo-muted: #6B7280`), `LandingForProfessionals.vue:86` | `text-datealo-muted` (#6B7280) sobre el fondo claro de Datealo (#FAFAFA/blanco) da un contraste de ~4.6-4.8:1 — pasa el mínimo AA de WCAG (4.5:1) para texto normal, pero con margen casi nulo. Un patrón puntual fuera de las cuatro superficies de esta misión (`text-datealo-text/50`, usado para atenuar color con opacidad en vez de un tono sólido) cae a ~3.06:1, por debajo del mínimo AA | cálculo propio con la fórmula estándar de contraste de WCAG, no una auditoría automatizada de cada color de la app; no mide percepción real de un usuario |

<a id="e-001"></a>

### E-001 — El código de hoy repite el mismo patrón de dos escalones en las cuatro superficies

<!--
Desarrollar solo cuando la tabla no alcanza para evaluar la calidad de la evidencia. Cierra con la
consecuencia para la investigación.
-->

En `SearchResultCard.vue`, el nombre del profesional es `text-sm` (14px) y todo lo demás — comuna,
rating, precio desde — es `text-xs` (12px). En `CompactSearchBar.vue`, el resumen de la búsqueda es
`text-sm` y las etiquetas "Categoría"/"Comuna" son `text-xs`. En `perfil.vue` (gestión) y en
`[id].vue` (perfil público), el nombre sube a `text-xl`/`text-2xl` (20-24px), pero la descripción, el
precio y las reseñas vuelven a `text-sm`, y los datos de apoyo ("En Datealo desde…", errores de
validación) bajan a `text-xs`. No hay una escala tipográfica declarada en `main.css` — Tailwind v4 corre
con sus tamaños por defecto (`text-xs`=12px, `text-sm`=14px, `text-base`=16px, sin overrides).

Esto permite afirmar que el patrón es sistemático, no un componente que se escapó — el mismo par
12px/14px aparece en las cuatro superficies que Patricio señaló. No demuestra que ese patrón sea
efectivamente ilegible para un usuario real: es una lectura del código, no de comportamiento.

<a id="e-002"></a>

### E-002 — Airbnb reserva 16px para lo que Datealo resuelve en 14px

Según la reconstrucción de Superdesign (2026), Airbnb tipografía sus cards de listado con el título en
16px/peso 600 y la descripción en 14px/peso 400, con el body/UI general en 14-16px y los títulos de
sección en 22-28px. Comparado con Datealo — nombre del profesional en 14px, metadata en 12px — la brecha
más clara es de un escalón completo (14 vs 16px) en el elemento más visible de la card, y de dos
escalones (12 vs 14-16px) en la metadata de apoyo.

Esto permite afirmar que la sensación de "chico" tiene un correlato numérico concreto contra al menos un
producto de referencia. No demuestra que 16px sea el tamaño correcto para Datealo: la fuente es una
reconstrucción de terceros sin acceso a la spec real de Airbnb, y Airbnb diseña para una escala de
catálogo y de datos de uso que Datealo no tiene.

<a id="e-003"></a>

### E-003 — El texto secundario de Datealo (12px) ya está bajo el piso que la industria de accesibilidad considera aceptable en mobile

Sin importar qué tamaño use Airbnb, la guía agregada de accesibilidad para mobile ubica el piso práctico
de body text en 16px (18px si el público incluye personas de 50+ o baja visión), y señala 14px como
insuficiente para lectura cómoda en celular — antes de llegar siquiera a los 12px que Datealo usa hoy
para comuna, precio, rating y "En Datealo desde". El público de Datealo (profesionales de oficio,
mayoría desde el celular, sin que se pueda asumir familiaridad alta con apps) es el perfil que esa guía
identifica como el más afectado por texto chico. Un matiz técnico: iOS fuerza zoom automático en un
`<input>` con `font-size` menor a 16px, pero el único `<input>` real que encontramos en el buscador
(`UInput` de Nuxt UI en el panel de comuna, `CompactSearchBarPanel.vue:57`) usa `size="lg"`, no las
clases chicas que sí aparecen en el resto del buscador — ese disparador puntual puede no aplicar hoy tal
cual.

Esto permite afirmar que hay un piso de legibilidad independiente del benchmark de Airbnb, y que Datealo
ya lo cruza en su texto secundario. No demuestra que 16px o 18px sea el tamaño que Datealo debe adoptar
en cada elemento — eso es una decisión de alcance, no un hecho.

<a id="e-004"></a>

### E-004 — El tamaño real no depende solo de qué clase escribimos: el theme de Nuxt UI tiene su propia escala

Nuxt UI resuelve el tamaño de texto de sus componentes (`UButton`, `UInput`, `UTextarea`) con su propio
theme, no con las clases `text-*` que Datealo escribe a mano. Revisando ese theme
(`node_modules/@nuxt/ui/dist/shared/ui.*.mjs`): en `button`, `size="md"` y `size="lg"` renderizan a
`text-sm` (14px) — solo `size="xl"` llega a `text-base` (16px). El CTA más importante del flujo core
("Escribir por WhatsApp", `ProfessionalPublicContactBar.vue:30`) está en `size="lg"`, así que hoy
renderiza a 14px pese a que "lg" sugiere que es grande. En cambio, `input` (y `textarea`, que hereda de
`input`) ya rinde en `text-base` (16px) desde `size="md"` — pero eso es el default: dos instancias reales
lo pisan a propósito con `size="sm"` (`perfil.vue:138`, el campo de precio; `ProfessionalDataRow.vue:46`,
los campos de "Tus datos"), y ahí sí quedan en `text-sm` (14px), por debajo del piso de E-003.

Esto permite afirmar que "subir los tamaños" no se resuelve completo tocando solo las clases `text-*` de
los componentes propios de Datealo — un botón o un input pueden quedarse en 12-14px aunque nadie haya
escrito esa clase en ningún lado, porque viene del `size` que Nuxt UI le asignó. No demuestra que todos
los botones o inputs de la app tengan este problema — se verificó el CTA de contacto y los inputs de las
cuatro superficies de esta misión, no cada `UButton`/`UInput` que existe en Datealo.

<a id="e-005"></a>

### E-005 — El contraste de color también puede convertir texto legible en texto chico en la práctica

El color secundario de Datealo (`--color-datealo-muted: #6B7280`) da un contraste de ~4.6-4.8:1 contra el
fondo claro de la app — pasa el mínimo AA de WCAG para texto normal (4.5:1), pero con un margen casi nulo:
cualquier ajuste futuro del fondo o del tono podría hacerlo caer por debajo sin que nadie lo note a simple
vista. Aparte, un patrón puntual fuera de las cuatro superficies de esta misión
(`LandingForProfessionals.vue:86`, "+200 reseñas" en `text-datealo-text/50`) usa opacidad para simular un
tono secundario en vez de un color sólido, y eso baja el contraste real a ~3.06:1 — por debajo del mínimo
AA. Mismo síntoma que el tamaño (texto difícil de leer), causa distinta.

Esto permite afirmar que el color no es un eje separado del tamaño para este problema: un texto en 16px
con contraste insuficiente sigue siendo difícil de leer. No demuestra que todos los usos de color de la
app tengan este problema — es un cálculo puntual sobre los tonos ya usados en las cuatro superficies y un
ejemplo fuera de ellas, no una auditoría exhaustiva de cada color del sistema.

## Conclusiones

<!--
Una conclusión interpreta evidencia; no es una preferencia ni una funcionalidad. El título expresa el
hallazgo, no el tema.
-->

<a id="c-001"></a>

### C-001 — La sensación de "chico en toda la app" tiene una causa sistémica: dos escalones fijos (12px/14px) que se repiten en cada superficie

- **Sustento:** [E-001](#e-001), [E-002](#e-002).
- **Razonamiento:** el mismo par de tamaños aparece en el buscador, la card de resultados y los dos
  perfiles, siempre con el mismo rol (texto principal en 14px, secundario en 12px). Si fuera un problema
  puntual, un componente se vería distinto de los demás — no es lo que muestra el código. Comparado con
  el benchmark de Airbnb, la brecha es de un escalón en el texto principal y dos en el secundario, lo que
  explica por qué la sensación es transversal y no aparece en una sola pantalla.
- **Implicación:** el fix no es ajustar un componente aislado (por ejemplo, solo agrandar el nombre en la
  card de resultados) — necesita mover la escala base del sistema: lo que hoy es "secundario" (12px) pasa
  a un tamaño que no cruce el piso de legibilidad, y lo que hoy es "principal" (14px) sube en consecuencia
  para mantener la jerarquía entre ambos.
- **Confianza:** alta porque está sustentada en código propio, no en benchmark ni intuición — el patrón
  es un hecho verificable, no una interpretación.

<a id="c-002"></a>

### C-002 — El texto secundario de Datealo (12px) no cumple un piso de legibilidad mobile que es independiente de cómo lo resuelva Airbnb

- **Sustento:** [E-003](#e-003).
- **Razonamiento:** aunque el benchmark de Airbnb (E-002) tiene confianza baja por venir de una
  reconstrucción de terceros, el piso de accesibilidad no depende de qué haga un competidor puntual — es
  una guía de legibilidad general, y el público de Datealo (profesionales de oficio, mayoría desde el
  celular, sin asumir familiaridad alta con apps) es exactamente el perfil que esa guía identifica como
  el más perjudicado por texto de 14px o menos.
- **Implicación:** la meta de esta misión no debería fijarse solo como "igualar a Airbnb" — necesita un
  piso propio de legibilidad (14px como mínimo absoluto en toda la app es la primera candidata, a
  confirmar en `producto.md`) que se sostenga aunque el benchmark cambie.
- **Confianza:** media — la fuente agrega guías de terceros en vez de citar la norma primaria línea por
  línea, pero el hallazgo puntual (14px insuficiente en mobile) aparece consistente entre fuentes
  independientes de accesibilidad, no en una sola.

<a id="c-003"></a>

### C-003 — El tamaño de las clases `text-*` no alcanza para arreglar el problema: hacen falta el tamaño real de los componentes de Nuxt UI y el contraste de color

- **Sustento:** [E-004](#e-004), [E-005](#e-005).
- **Razonamiento:** el mismo síntoma (texto difícil de leer) tiene dos causas más allá de las clases
  `text-xs`/`text-sm` que Datealo escribe a mano: el tamaño real de un `UButton` depende del theme de
  Nuxt UI (un botón "lg" puede seguir en 14px), y un texto en el tamaño correcto sigue siendo difícil de
  leer si su contraste de color es insuficiente (opacidad usada como atajo para un tono secundario). Un
  fix que solo cambie clases `text-xs`→`text-sm` en los archivos de F-001 deja ambos problemas intactos.
- **Implicación:** la corrección tiene que ser sistémica, no archivo por archivo: cualquier botón con
  texto de uso frecuente necesita el tamaño que realmente rinde en 16px (hoy, `size="xl"` en Nuxt UI, o
  corregir el default en `app.config.ts` para que no dependa de que cada desarrollador lo recuerde), y
  ningún texto secundario puede usar opacidad para simular su tono — solo colores sólidos con contraste
  verificado.
- **Confianza:** alta — ambos hallazgos son código propio y cálculo verificable, no benchmark ni
  intuición.

## El ideal: ningún texto de uso frecuente cruza el piso de legibilidad mobile, en ninguna superficie

<!--
El ideal es el producto de la investigación: la dirección que la evidencia sostiene, sin restricciones de
implementación. El recorte a la primera entrega no vive aquí — vive en producto.md como decisión de
alcance. Esta sección sí se reescribe cuando nueva evidencia cambia la dirección.
-->

### El resultado ideal se ve así

Doña Marcela, 58 años, gasfiter, abre Datealo en la calle con el sol pegándole a la pantalla para revisar
si le llegó un mensaje. Lee su nombre, su comuna y su precio en la card de resultados sin acercar el
celular ni entrecerrar los ojos. Un cliente que busca "electricista en Ñuñoa" ve la lista de resultados y
distingue de un vistazo el nombre del profesional (texto principal, más grande y con más peso) de su
comuna y su rating (texto secundario, más chico pero nunca ilegible) — la jerarquía se nota en el peso y
el color, no en un tamaño que ya cuesta leer. Al entrar al perfil público, la descripción que el
profesional escribió sobre su trabajo se lee tan cómoda como el precio o el nombre — ningún bloque de
texto de uso frecuente obliga a hacer zoom con los dedos.

### Capacidades del ideal

| Capacidad                          | Acción habilitada                                                                | Respuesta esperada                                                                                              | Conclusión que la justifica       |
| ------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Escala tipográfica única             | Leer cualquier texto del buscador, una card o un perfil sin acercar el celular    | Ningún texto de uso frecuente (nombre, precio, comuna, descripción, reseña, botón de contacto) baja del piso de legibilidad mobile | [C-001](#c-001), [C-002](#c-002) |
| Jerarquía sin sacrificio de tamaño   | Distinguir el texto principal del secundario en una card o perfil de un vistazo  | La diferencia se expresa con peso y color sólido, no con un tamaño o una opacidad que cruza el piso de legibilidad | [C-001](#c-001), [C-003](#c-003) |
| Default a prueba de error           | Agregar un componente nuevo sin tener que recordar "no uses `text-xs`/opacidad" | El tamaño y el color correctos salen por defecto del sistema (theme de Nuxt UI, tokens), no de que cada desarrollador se acuerde | [C-003](#c-003) |

### El ideal no significa que todo el texto mida lo mismo

- La jerarquía entre texto principal y secundario sigue existiendo — se logra con peso y color en vez de
  con un tamaño que ya es difícil de leer.
- No significa copiar el valor exacto que usa Airbnb: el benchmark (E-002) tiene confianza baja por ser
  una reconstrucción de terceros. La escala final de Datealo es una decisión de `producto.md`, informada
  por el benchmark y por el piso de accesibilidad (E-003), no una calca de ninguno de los dos.

## Referencias

<!-- Fuentes primarias citadas por las evidencias. El enlace no sustituye el hecho y el límite en E-xxx. -->

- [Superdesign — How Airbnb Designs Their UI: A Design System Breakdown (2026)](https://superdesign.dev/blog/airbnb-design-system): usado en E-002 para los tamaños de card de listado de Airbnb.
- [The A11Y Collective — How to Pick the Perfect Font Size: A Guide to WCAG Accessibility](https://www.a11y-collective.com/blog/wcag-minimum-font-size/): usado en E-003 para el piso práctico de 16px en mobile.
- [Recite Me — How to Pick an Accessible Font Size for your Website](https://reciteme.com/news/accessible-font-size/): usado en E-003 para la recomendación de 18px con público 50+ y el señalamiento de 14px como insuficiente.
