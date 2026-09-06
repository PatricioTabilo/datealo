---
paths:
  - "docs/missions/*/experiencia.md"
---
# Discovery de experiencia

- Antes de escribir o editar cualquier contenido en este archivo, invocar el skill `discovery-ux` — no
  asumir su gate ni su formato de vistas/flujos/estados de memoria.
- Al redactar o revisar cualquier texto de interfaz (labels, errores, empty states, CTAs, microcopy),
  invocar también `ux-writing` antes de darlo por definitivo.
- **Antes de proponer `en revisión`, revisar el Carril de la misión** (`**Carril:**` en el README de la
  misión). Si es Light Spec, el paso siguiente es opcional. Si es Full Spec, es obligatorio, y va antes de
  proponer `en revisión`, no antes, porque el documento tiene que estar terminado: lanzar la evaluación en
  contexto separado que exige el gate. Es una acción, no una mención: usar `Agent` con un
  `subagent_type` que no sea `fork` (un fork hereda el sesgo de esta conversación), pasándole solo
  `experiencia.md` terminado, `producto.md` y los mockups — nunca el razonamiento de cómo se llegó ahí — y
  pidiéndole invocar `ui-ux-pro-max` y `web-design-guidelines` para el juicio de usabilidad y
  `frontend-design` para la propuesta visual, citando qué dijo cada uno. No proponer `en revisión` sin
  haberla corrido y sin resolver sus hallazgos bloqueantes.
