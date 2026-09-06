---
paths:
  - "docs/missions/*/investigacion.md"
  - "docs/missions/*/producto.md"
---
# Discovery de producto

- Antes de escribir o editar cualquier contenido en estos archivos, invocar el skill `discovery-product` —
  no asumir su gate ni su formato JTBD de memoria.
- Según lo que se esté trabajando, invocar también los skills que `discovery-product` cita como propios de
  esta fase: `mom-test` (diseño de entrevistas sin sesgo), `jobs-to-be-done` (formato JTBD de una
  funcionalidad), `cold-start-problem` (arranque en frío de un lado del marketplace), `lean-analytics`
  (definir una señal `M-xxx` sin caer en vanity metric), `obviously-awesome` (positioning frente a
  alternativas).
- **Antes de proponer `en revisión`, revisar el Carril de la misión** (`**Carril:**` en el README de la
  misión). Si es Light Spec, el paso siguiente es opcional — proponer `en revisión` sin correrlo es válido.
  Si es Full Spec — o si esta conversación descubre que la misión toca algo que debería subirla a Full Spec
  — es obligatorio, y va antes de proponer `en revisión`, no antes, porque el documento tiene que estar
  terminado: lanzar la evaluación en contexto separado que exige el gate. Es una acción, no una mención:
  usar `Agent` con un
  `subagent_type` que no sea `fork` (un fork hereda el sesgo de esta conversación), pasándole solo
  `producto.md` terminado, `investigacion.md` y las guardrails de producto del `CLAUDE.md` raíz — nunca el
  razonamiento de esta conversación — y pidiéndole invocar `jobs-to-be-done`, `cold-start-problem`,
  `lean-analytics`, `obviously-awesome` (y `mom-test` si hay entrevistas que auditar) según corresponda,
  citando qué dijo cada uno, confirmando que ninguna guardrail fue violada, e intentando tumbar al menos
  una decisión ya tomada. No proponer `en revisión` sin haberla corrido y sin resolver sus hallazgos
  bloqueantes.
