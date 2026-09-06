# Misión: hero y copy de la landing — Producto

**Estado:** vigente — aprobado por Patricio el 2026-09-04, con F-002/D-004 sumadas el mismo día y D-005
sumada y aceptada el 2026-09-06

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

## Qué construimos: un hero investigado a propósito, no heredado de un cambio técnico

**Resultado:** al terminar esta entrega, el hero de la landing comunica la propuesta de valor de Datealo
contra su alternativa real (el grupo de WhatsApp del edificio), sin prometer nada que la plataforma no
pueda respaldar, y con un buscador visualmente tan cuidado como el resto de la sección.

**Recorte respecto del ideal:** [el ideal](./investigacion.md) también toca la sección `LandingSolution`
(donde vive la misma claim de "verificado"); esta entrega corrige esa frase puntual pero no rediseña toda
la sección — sigue entregando el resultado central porque el problema de fondo (una claim sin respaldo) se
resuelve en su origen.

**Restricciones aceptadas:** no cambia la estructura funcional del buscador del hero (categoría + comuna +
CTA); no toca `LandingCategories` ni `LandingForProfessionals`. `LandingFinalCta` no se rediseña, pero su
subheadline también dice "profesionales verificados" — D-002 no se acota al hero, así que ese mismo cambio
de palabra entra en F-001 (ver regla actualizada más abajo); es una corrección de una frase, no un
rediseño de la sección.

**Ampliación de alcance (2026-09-04):** el dueño de producto sumó una segunda funcionalidad, F-002, sobre
`LandingNavbar.vue` — reemplazar el link "Para profesionales" por el mismo CTA directo que ya usa el
header general (misión 09, D-005). Nace de retomar el [issue #155](https://github.com/PatricioTabilo/datealo/issues/155)
de la misión 09, que el dueño de producto pausó y derivó a esta misión (ver [C-007](./investigacion.md#c-007)).
Explícitamente **no** incluye la otra mitad de ese issue: si el nav necesita `CompactSearchBar` en línea
tras hacer scroll, y si el hero seguiría necesitando su propio buscador en ese caso — esa pregunta queda
en "Fuera de alcance" hasta que se retome.

## Funcionalidades

| ID    | Funcionalidad                  | Lado    | Sustento             | Éxito |
| ----- | ------------------------------ | ------- | ---------------------- | ----- |
| F-001 | Revisar hero y copy de la landing | buscador | C-001 a C-006, D-001 a D-003, D-005 | M-001 |
| F-002 | Reemplazar el CTA "Para profesionales" del nav de la landing | profesional | C-007, D-004 | M-002 |

<a id="f-001"></a>

### F-001 — Revisar hero y copy de la landing

Cuando alguien llega por primera vez a datealo.cl arrastrando la ansiedad de no saber si va a encontrar a
alguien confiable a tiempo (el "maestro fantasma", la "ruleta de la confianza" que ya describe
`LANDING_PROBLEM`),
quiero entender en segundos qué hace Datealo, qué puedo buscar, y sentir que es una alternativa real al
grupo de WhatsApp del edificio,
para decidir si sigo explorando o me voy — con menos ansiedad que cuando llegué, no solo con más
información.

**Lado del marketplace:** buscador — es el foco del hero; `LandingForProfessionals` cubre al profesional
en otra sección y no se toca en esta funcionalidad. **Qué necesita del otro lado:** nada estructural,
aunque el mensaje no debe prometer más cobertura, verificación o reseñas de las que existen hoy
([D-002](#d-002)).

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[C-003](./investigacion.md#c-003), [C-004](./investigacion.md#c-004),
[C-005](./investigacion.md#c-005), [C-006](./investigacion.md#c-006) y [D-001](#d-001),
[D-002](#d-002), [D-003](#d-003). **Éxito:** [M-001](#m-001).

**Reglas:**

- El copy del hero (headline, subheadline, trust items) se revisa contra el skill `ux-writing` antes de
  darse por definitivo — no se hereda tal cual del cambio funcional reciente (lista de espera → buscador
  en vivo).
- Los trust items no repiten atributos que la alternativa nombrada en el headline (grupos de WhatsApp o
  Facebook) también tiene ("gratis", "sin registro", "contacto directo") sin sumar algo que sí distinga a
  Datealo — orden por cercanía, categorización clara, o reseñas reales de la zona.
- El copy nunca usa "verificado"/"verificados" para describir profesionales — no existe esa funcionalidad
  ni está planificada ([D-002](#d-002)). El mensaje de confianza se apoya en reseñas reales y en los
  atributos de cercanía/categorización.
- El buscador del hero deja de usar la caja blanca con `<select>` planos que tiene hoy y sigue el mismo
  lenguaje visual que `CompactSearchBar` (el buscador de `/buscar`): pill redondeada, campos segmentados
  por categoría y comuna, botón de búsqueda circular — no un estilo inventado desde cero, y sin fila de
  accesos rápidos por categoría ([D-003](#d-003)).
- El botón de búsqueda del hero deja de ser un link de texto (`variant="link"`) y pasa a ser el botón
  circular trabajado del mismo patrón — nunca un link disfrazado de CTA.
- Si el copy revisado no cabe con el mismo tamaño de fuente en 390px que en desktop, Datealo prioriza
  claridad y legibilidad mobile sobre mantener idéntica proporción entre anchos.
- Esta funcionalidad corrige toda mención a "verificado"/"verificados" que describa profesionales fuera
  del hero: `LANDING_SOLUTION.subtitle` ("Un buscador de profesionales verificados..."),
  `LANDING_SOLUTION.features[0]` ("Profesionales verificados" / "Cada profesional pasa por un proceso de
  verificación") y `LANDING_FINAL_CTA.subheadline` ("Ya podés buscar profesionales verificados..."). Ninguna
  de esas tres secciones se rediseña — es la misma corrección de palabra que en el hero, no un rediseño.
- Datealo nunca promete cobertura o volumen de profesionales que no existe todavía — el guardrail de "no
  copy agresivo o de urgencia artificial" sigue vigente.

**Ejemplo verificable:** dado el hero actual, cuando se aplique la revisión de copy, entonces el headline
y el subheadline resultantes pasan la prueba de lectura en voz alta del skill `ux-writing`, ninguna frase
usa "verificado" o "verificados" para describir a los profesionales, y el buscador del hero se ve como una
variante del mismo patrón pill/segmentado que ya usa `/buscar`, no como un componente aparte.

**No incluye:** cambiar la estructura funcional del buscador del hero (categoría + comuna + CTA) — esa
decisión ya está resuelta por la misión de búsqueda; esta funcionalidad es de mensaje y pulido visual.

**Experiencia:** —. **Ingeniería:** —.

<a id="f-002"></a>

### F-002 — Reemplazar el CTA "Para profesionales" del nav de la landing

Cuando alguien que ofrece un servicio (gasfitería, peluquería, etc.) llega a datealo.cl y quiere entender
cómo aparecer en la plataforma,
quiero encontrar en el nav un camino directo a crear o ver mi perfil,
para no tener que hacer scroll hasta encontrar el botón real de esa sección — el nav ya me dice qué hacer.

**Lado del marketplace:** profesional — es la entrada de captación del lado difícil del marketplace
([cold-start-problem](../../../.claude/skills/cold-start-problem/)). **Qué necesita del otro lado:** nada
— usa la sesión de profesional que ya existe (`useProfessionalSession`, ya construida y en uso en
`AppHeader.vue`).

**Sustento:** [C-007](./investigacion.md#c-007) y [D-004](#d-004). **Éxito:** [M-002](#m-002).

**Reglas:**

- El link "Para profesionales" (hoy hace scroll a `#profesionales` con `scrollToSection`) se reemplaza por
  un link directo: "Publícate" → `/profesional/registro` si no hay sesión de profesional activa, o
  "Mi perfil" → `/profesional/perfil` si la hay. Nunca los dos textos a la vez, y siempre uno de los dos
  visible — reusa el naming y los destinos que ya fijó D-005 de la misión 09 para el header general, pero
  no su comportamiento: `AppHeader.vue` solo muestra el link de perfil cuando hay sesión (`v-if`, sin
  alternativa sin sesión) porque ahí es un acceso secundario; acá es la entrada principal de captación del
  lado profesional en la landing, así que siempre muestra algo.
- El link "Categorías" (ancla a `#categorias`) y el CTA "Buscar" (a `/buscar`) del nav no cambian — esta
  funcionalidad es solo del acceso al lado profesional.
- No se toca el comportamiento del nav al hacer scroll (el cambio de fondo/padding que ya existe) — eso
  queda igual; lo que cambia es únicamente el texto y destino del link de profesionales.

**Ejemplo verificable:** dado el nav de la landing sin sesión de profesional activa, cuando se aplique
este cambio, entonces el link que antes decía "Para profesionales" dice "Publícate" y navega directo a
`/profesional/registro`, sin hacer scroll. Con sesión activa, el mismo lugar dice "Mi perfil" y navega a
`/profesional/perfil`.

**No incluye:** si el nav necesita `CompactSearchBar` en línea tras hacer scroll, ni si el hero seguiría
necesitando su propio buscador en ese caso — ver "Fuera de alcance".

**Experiencia:** —. **Ingeniería:** —.

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta     | Comportamiento esperado | Funcionalidades |
| ------ | ----------------------- | ----------------------- | ---------------- |
| CL-001 | El copy revisado no cabe con el mismo tamaño de fuente en 390px que en desktop | Datealo prioriza claridad y legibilidad mobile sobre mantener idéntica proporción entre anchos. | F-001 |

## Fuera de alcance

| Capacidad o caso      | Estado    | Razón del recorte | Condición para reconsiderar |
| ---------------------- | --------- | ------------------ | ---------------------------- |
| Rediseño completo de `LandingSolution`, `LandingCategories`, `LandingForProfessionals` | postergada | Esta misión corrige la claim puntual de verificación; un rediseño de esas secciones es un problema aparte, sin evidencia todavía de que haga falta. | Evidencia de que esas secciones también tienen brechas de mensaje o visuales. |
| `CompactSearchBar` en línea en el nav de la landing tras hacer scroll, y si el hero sigue necesitando su propio buscador en ese caso | postergada | Es la otra mitad del [issue #155](https://github.com/PatricioTabilo/datealo/issues/155) de la misión 09 — el dueño de producto pidió explícitamente resolver primero el CTA de profesionales solo (F-002), sin mezclarlo con esta pregunta más grande de dónde vive la búsqueda en la landing. | El dueño de producto decide retomarla, en esta misión o en una nueva. |

## Señales de éxito

<a id="m-001"></a>

### M-001 — El copy del hero comunica mejor la propuesta de valor

- **Pregunta:** ¿el nuevo copy explica más rápido y con más claridad qué hace Datealo, sin prometer nada
  que no pueda cumplir?
- **Señal:** el dueño de producto aprueba el copy nuevo tras pasarlo por el skill `ux-writing` y
  compararlo lado a lado con el actual.
- **Método y umbral:** revisión cualitativa — sin tráfico real todavía no es posible un A/B; Datealo está
  en etapa "Empatía" del framework de lean analytics.
- **Cuando exista tráfico:** reemplazar por click-through del CTA "Buscar" del hero sobre visitas a `/`, y
  profundidad de scroll pasado el hero.
- **Guardrail:** el copy no cae en urgencia artificial ni promete algo que Datealo no tiene todavía (ver
  guardrails de producto en `CLAUDE.md`, y [D-002](#d-002) para las claims de verificación/reseñas).

<a id="m-002"></a>

### M-002 — El acceso al lado profesional desde el nav de la landing es directo, no un scroll

- **Pregunta:** ¿alguien que quiere ofrecer sus servicios llega a `/profesional/registro` o
  `/profesional/perfil` sin tener que encontrar primero la sección correcta de la página?
- **Señal:** el dueño de producto confirma que el link del nav navega directo, sin pasar por
  `scrollToSection`.
- **Método y umbral:** revisión directa del comportamiento — es un cambio de destino de un link, no
  necesita medición cuantitativa.
- **Cuando exista tráfico:** reemplazar por la tasa de clic en ese link sobre visitas a `/` que vienen de
  un profesional (o que no tienen sesión de cliente activa), separando lado profesional de lado buscador.
- **Guardrail:** el link nunca muestra "Publícate" y "Mi perfil" a la vez — mismo guardrail que ya aplica
  al header general (misión 09, D-005).

## Decisiones de producto

<a id="d-001"></a>

### D-001 — El copy del hero se revisa como una iteración propia de esta misión, no se hereda tal cual del cambio funcional reciente

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [C-001](./investigacion.md#c-001).
- **Tensión:** evitar re-litigar algo "que ya funciona" vs. la evidencia muestra que el copy actual nunca
  fue validado como mensaje, solo actualizado técnicamente al cambiar de lista de espera a buscador en
  vivo.
- **Alternativas descartadas:** dejar el copy actual intacto y enfocar la misión solo en el ajuste visual
  del buscador — se descarta porque el dueño de producto pidió explícitamente un hero "bien investigado".
- **Decisión y consecuencia:** F-001 incluye una revisión de copy con el skill `ux-writing`. Exige tiempo
  de redacción adicional que un retoque puramente visual no habría necesitado.
- **Reapertura:** —.

<a id="d-002"></a>

### D-002 — La palabra "verificado" sale del copy que describe profesionales; el mensaje de confianza se apoya en reseñas reales, no en una verificación que no existe ni está planificada

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [C-003](./investigacion.md#c-003).
- **Tensión:** la confianza es la única palanca diferenciadora de Datealo frente al grupo de WhatsApp vs.
  no existe ninguna funcionalidad de verificación de profesionales, ni planificada.
- **Alternativas descartadas:** mantener "verificado" y tratarlo como promesa de un proceso futuro — se
  descarta porque el dueño de producto confirmó que no hay ningún plan de construir esa verificación;
  quitar toda mención a confianza/reseñas del hero — se descarta porque el diferenciador real (reseñas de
  vecinos reales, ya con su propio estándar de honestidad en la misión 07) sí existe y sí debe
  comunicarse.
- **Decisión y consecuencia:** F-001 retira "verificado"/"verificados" del copy que describe profesionales
  en toda la landing — no solo el hero. Afecta a `LANDING_HERO`, `LANDING_SOLUTION.subtitle`,
  `LANDING_SOLUTION.features[0]` y `LANDING_FINAL_CTA.subheadline`.
- **Reapertura:** si en algún momento el producto decide construir una verificación formal de
  profesionales, se reabre para volver a usar la palabra con respaldo real.

<a id="d-003"></a>

### D-003 — El buscador del hero se rediseña siguiendo el mismo lenguaje visual que `CompactSearchBar` (el buscador de `/buscar`), no un estilo nuevo

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [C-006](./investigacion.md#c-006).
- **Tensión:** el buscador del hero hoy se ve "feísimo" y no sigue el estándar del buscador que ya existe
  en `/buscar` (bastante mejor) vs. el hero no es un header angosto — replicar el componente tal cual, sin
  ajustar, podría no funcionar en un contenedor más ancho y con más espacio.
- **Alternativas descartadas:** mantener los `<select>` planos actuales en una caja blanca simple — se
  descarta porque es exactamente lo que el dueño de producto identificó como "feísimo" y sin estándar;
  diseñar un estilo nuevo para el hero inspirado directamente en Airbnb sin pasar por el componente que ya
  existe en el producto — se descarta porque crea una tercera variante visual de buscador conviviendo con
  la de `/buscar`, cuando el objetivo explícito es que "pegue con la página".
- **Decisión y consecuencia:** F-001 toma `CompactSearchBar` (pill redondeada, campos segmentados,
  botón de búsqueda circular) como referencia de forma para el buscador del hero — con el mismo lenguaje
  visual, tipo Airbnb. Cómo se adapta ese lenguaje al ancho y contexto del hero (mobile y desktop) se
  resuelve en `experiencia.md`, no acá.
- **Reapertura:** —.

<a id="d-004"></a>

### D-004 — El nav de la landing reemplaza "Para profesionales" por un link directo a registro o perfil, sin pasar por el scroll a la sección

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [C-007](./investigacion.md#c-007).
- **Tensión:** retomar la parte simple de un issue ya diseñado (misión 09, #155) vs. el riesgo de mezclar
  otra vez la pregunta más grande que hizo pausar ese issue (buscador en el nav tras scroll).
- **Alternativas descartadas:** mantener el link como ancla de scroll y solo cambiarle el texto a
  "Publícate" — se descarta porque sigue siendo un paso indirecto (scroll → encontrar el botón real de la
  sección) para algo que en el resto del producto ya es un solo link; resolver junto con la pregunta del
  buscador en el nav tras scroll (la versión original del issue #155) — se descarta porque el dueño de
  producto pidió explícitamente separar ambas cosas, dado que la segunda todavía no está lista.
- **Decisión y consecuencia:** F-002 reemplaza el link por "Publícate" (`/profesional/registro`) o
  "Mi perfil" (`/profesional/perfil`), con el mismo criterio de sesión que ya usa `AppHeader.vue`. El resto
  del nav (Categorías, Buscar) no cambia.
- **Reapertura:** si se retoma la pregunta del buscador en el nav tras scroll (ver "Fuera de alcance"), se
  revisa si este link necesita moverse o reacomodarse junto a ese cambio.

<a id="d-005"></a>

### D-005 — El dropdown de categoría del buscador del hero muestra ícono y círculo de color por categoría, igual que el panel de `/buscar`

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** revisión en vivo del dueño de producto sobre la implementación de S-002 (D-003).
- **Tensión:** D-003 dice que el hero reusa `CatalogSelect` tal cual (lista en texto plano, igual que
  registro y perfil de profesional) vs. al ver el resultado en vivo, el dueño de producto lo comparó con
  el dropdown real de `/buscar` (`CompactSearchBarPanel`, que sí muestra ícono por categoría) y lo pidió
  explícitamente ahí.
- **Alternativas descartadas:** dejar el dropdown en texto plano, tal como quedó definido en D-003 — se
  descarta porque el dueño de producto, viéndolo al lado del de `/buscar`, lo pidió explícitamente distinto
  al aprobado originalmente; reemplazar `CatalogSelect` por `CompactSearchBarPanel` en el hero — se
  descarta porque reintroduce el sheet/panel que UX-001 ya rechazó para el hero (los dos campos deben
  seguir siempre visibles, sin abrir un panel aparte); esto es solo la lista interna de opciones, no el
  mecanismo de apertura.
- **Decisión y consecuencia:** `CatalogSelect` gana un prop opcional para mapear cada opción a un ícono
  (reusando `CATEGORIA_ICONS`, la misma fuente que ya usa `CompactSearchBarPanel`) — sin ese prop, se ve
  igual que hoy (registro y perfil de profesional no cambian). El campo de comuna del hero usa el mismo
  ícono de pin para todas las opciones, igual que `CompactSearchBarPanel`.
- **Reapertura:** —.

## Preguntas

Ninguna abierta.

| ID    | La duda                | Estado               | Respuesta, o quién la resuelve |
| ----- | ----------------------- | --------------------- | -------------------------------- |
| Q-001 | ¿Cuántos profesionales verificados con reseñas hacen falta para volver a "verificados" en el hero? | disuelta 2026-09-01 | Partía de una premisa incorrecta: no existe ninguna funcionalidad de verificación de profesionales, ni planificada. [D-002](#d-002) retira la palabra del copy en vez de posponerla. |
