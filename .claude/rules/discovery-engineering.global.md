---
paths:
  - "docs/missions/*/ingenieria.md"
---
# Discovery de ingeniería

- Antes de escribir o editar cualquier contenido en este archivo, invocar el skill `discovery-engineering`
  — no asumir su gate de salida ni el método de slicing de memoria.
- Según la sección que se esté trabajando, invocar también: `clean-architecture` (Dependency Rule y
  acoplamiento entre capas) y `domain-driven-design` (lenguaje ubicuo, build-vs-buy) al definir la
  arquitectura; `supabase-postgres-best-practices` al tocar schema, RLS, índices o migraciones.
- Antes de marcar el impacto en RLS como resuelto, invocar `seguridad-datos` y correr su checklist —
  "hay una policy" no es lo mismo que "esa policy es la que protege".
- **Antes de proponer `en revisión`, revisar el Carril de la misión** (`**Carril:**` en el README de la
  misión, o Full Spec automático si este documento terminó tocando RLS/Auth/pagos/datos de usuario, sin
  importar lo que decía antes). Si es Light Spec, el paso siguiente es opcional. Si es Full Spec, es
  obligatorio, y va antes de proponer `en revisión`, no antes, porque el diseño tiene que estar cerrado y
  cortado en slices: lanzar la auditoría en contexto separado que exige el gate. Es una acción, no una
  mención: usar `Agent` con un `subagent_type` que no sea `fork` (hereda el sesgo de esta conversación),
  pasándole solo `ingenieria.md` terminado, `producto.md`/`experiencia.md` si existen y el código existente
  relevante — nunca el razonamiento de esta conversación — y pidiéndole invocar `clean-architecture`,
  `domain-driven-design` y `supabase-postgres-best-practices` según corresponda, citando qué dijo cada uno,
  e intentar tumbar al menos una decisión ya tomada. No proponer `en revisión` sin haberla corrido y sin
  resolver sus hallazgos bloqueantes.
- **Cuando el dueño de producto marque este documento `vigente`, el siguiente paso nunca es crear los
  issues directo.** La secuencia es: abrir el PR con los documentos de la misión (los que existan según su
  Tipo — los tres en una misión de producto, solo `ingenieria.md` en una técnica) → esperar a que se
  mergee → `ExitWorktree action: "remove"` → recién ahí, ya en la raíz del repo, cortar el plan de
  construcción en issues. Ofrecer "crear los issues" como alternativa a "revisar con más calma" sin
  mencionar el PR y el cierre del worktree es la misma pregunta mal planteada que ya pasó una vez — el PR y
  el worktree no son opcionales ni se sobreentienden.
