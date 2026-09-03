# Misión: hero y copy de la landing — Producto

**Estado:** en revisión

**Última actualización:** 2026-09-01

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
CTA); no toca `LandingCategories`, `LandingForProfessionals` ni `LandingFinalCta`.

## Funcionalidades

| ID    | Funcionalidad                  | Lado    | Sustento             | Éxito |
| ----- | ------------------------------ | ------- | ---------------------- | ----- |
| F-001 | Revisar hero y copy de la landing | buscador | C-001 a C-005, D-001, D-002 | M-001 |

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
[C-005](./investigacion.md#c-005) y [D-001](#d-001), [D-002](#d-002). **Éxito:** [M-001](#m-001).

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
- El buscador dentro del hero recibe inputs más grandes, con íconos por campo (categoría, comuna) y más
  padding — hoy se ve "simplón" comparado con el resto de la sección. Sin fila de accesos rápidos por
  categoría.
- El botón de búsqueda del hero se rediseña como un botón trabajado (no un link de texto) — sin necesidad
  de copiar exactamente ninguna referencia, solo más amigable que hoy.
- Si el copy revisado no cabe con el mismo tamaño de fuente en 390px que en desktop, Datealo prioriza
  claridad y legibilidad mobile sobre mantener idéntica proporción entre anchos.
- Esta funcionalidad también corrige `LANDING_SOLUTION.features[0]` ("Profesionales verificados" / "Cada
  profesional pasa por un proceso de verificación") — misma regla de no usar "verificado".
- Datealo nunca promete cobertura o volumen de profesionales que no existe todavía — el guardrail de "no
  copy agresivo o de urgencia artificial" sigue vigente.

**Ejemplo verificable:** dado el hero actual, cuando se aplique la revisión de copy, entonces el headline
y el subheadline resultantes pasan la prueba de lectura en voz alta del skill `ux-writing`, ninguna frase
usa "verificado" o "verificados" para describir a los profesionales, y el buscador muestra íconos por
campo con inputs más grandes que la versión actual.

**No incluye:** cambiar la estructura funcional del buscador del hero (categoría + comuna + CTA) — esa
decisión ya está resuelta por la misión de búsqueda; esta funcionalidad es de mensaje y pulido visual.

**Experiencia:** —. **Ingeniería:** —.

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta     | Comportamiento esperado | Funcionalidades |
| ------ | ----------------------- | ----------------------- | ---------------- |
| CL-001 | El copy revisado no cabe con el mismo tamaño de fuente en 390px que en desktop | Datealo prioriza claridad y legibilidad mobile sobre mantener idéntica proporción entre anchos. | F-001 |

## Fuera de alcance

| Capacidad o caso      | Estado    | Razón del recorte | Condición para reconsiderar |
| ---------------------- | --------- | ------------------ | ---------------------------- |
| Rediseño completo de `LandingSolution`, `LandingCategories`, `LandingForProfessionals` | postergada | Esta misión corrige la claim puntual de verificación; un rediseño de esas secciones es un problema aparte, sin evidencia todavía de que haga falta. | Evidencia de que esas secciones también tienen brechas de mensaje o visuales. |

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

## Decisiones de producto

<a id="d-001"></a>

### D-001 — El copy del hero se revisa como una iteración propia de esta misión, no se hereda tal cual del cambio funcional reciente

- **Estado:** propuesta. **Fecha:** 2026-09-08.
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

- **Estado:** propuesta. **Fecha:** 2026-09-08.
- **Sustento:** [C-003](./investigacion.md#c-003).
- **Tensión:** la confianza es la única palanca diferenciadora de Datealo frente al grupo de WhatsApp vs.
  no existe ninguna funcionalidad de verificación de profesionales, ni planificada.
- **Alternativas descartadas:** mantener "verificado" y tratarlo como promesa de un proceso futuro — se
  descarta porque el dueño de producto confirmó que no hay ningún plan de construir esa verificación;
  quitar toda mención a confianza/reseñas del hero — se descarta porque el diferenciador real (reseñas de
  vecinos reales, ya con su propio estándar de honestidad en la misión 07) sí existe y sí debe
  comunicarse.
- **Decisión y consecuencia:** F-001 retira "verificado"/"verificados" del copy que describe profesionales
  (hero y `LandingSolution`). Afecta directamente a `LANDING_SOLUTION.features[0]`.
- **Reapertura:** si en algún momento el producto decide construir una verificación formal de
  profesionales, se reabre para volver a usar la palabra con respaldo real.

## Preguntas

Ninguna abierta.

| ID    | La duda                | Estado               | Respuesta, o quién la resuelve |
| ----- | ----------------------- | --------------------- | -------------------------------- |
| Q-001 | ¿Cuántos profesionales verificados con reseñas hacen falta para volver a "verificados" en el hero? | disuelta 2026-09-01 | Partía de una premisa incorrecta: no existe ninguna funcionalidad de verificación de profesionales, ni planificada. [D-002](#d-002) retira la palabra del copy en vez de posponerla. |
