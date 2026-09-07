# Misiones

Una misión es el discovery de una feature: investigación, producto, experiencia e ingeniería, en cuatro
documentos con fuentes de verdad separadas. Cómo se escribe una está en
[`template/`](./template/README.md). Este archivo responde lo otro: qué misiones existen, en qué orden se
abrieron y de dónde salió cada una.

## Registro

| #   | Misión | Tipo | Abierta | Estado | En foco | Nace de |
| --- | ------ | ---- | ------- | ------ | ------- | ------- |
| 01  | [migración a Nuxt UI](./01-migracion-nuxt-ui/) | técnica | 2026-08-11 | cerrada 2026-08-13 | — | A-004 |
| 02  | [base de datos, Auth y correo (config)](./02-base-de-datos-y-auth/) | técnica | 2026-08-13 | cerrada 2026-08-17 | — | A-001, A-002, A-003 |
| 03  | [taxonomía: categorías y comunas](./03-taxonomia-categorias-y-comunas/) | producto | 2026-08-13 | cerrada 2026-08-20 | — | — |
| 04  | [registro y perfil de profesional](./04-registro-perfil-profesional/) | producto | 2026-08-13 | cerrada 2026-08-28 | — | — |
| 05  | [perfil público de profesional](./05-perfil-publico-profesional/) | producto | 2026-08-13 | cerrada 2026-08-29 | — | — |
| 06  | [búsqueda y resultados](./06-busqueda-resultados/) | producto | 2026-08-13 | cerrada 2026-08-31 | — | — |
| 07  | [reseñas verificadas por contacto](./07-resenas-verificadas-por-contacto/) | producto | 2026-08-13 | cerrada 2026-08-31 | — | — |
| 08  | [foto de perfil de profesional](./08-foto-perfil-profesional/) | producto | 2026-08-29 | cerrada 2026-09-02 | — | — |
| 09  | [layout general (navbar, footer, TOS)](./09-layout-general/) | producto | 2026-08-31 | cerrada 2026-09-04 | — | — |
| 10  | [vista de resultados de búsqueda](./10-vista-resultados-busqueda/) | producto | 2026-09-01 | cerrada 2026-09-04 | — | — |
| 11  | [vista de detalle de perfil](./11-perfil-profesional/) | producto | 2026-09-01 | cerrada 2026-09-04 | — | — |
| 12  | [hero y copy de la landing](./12-hero-y-copy-landing/) | producto | 2026-09-01 | cerrada 2026-09-06 | — | — |
| 13  | [tamaño de fuente](./13-tamano-de-fuente/) | producto | 2026-09-06 | cerrada 2026-09-06 | — | — |
| 14  | [múltiples categorías por profesional](./14-multiples-categorias-profesional/) | producto | 2026-09-06 | exploración | Investigación | — |
| 15  | [múltiples comunas por profesional](./15-multiples-comunas-profesional/) | producto | 2026-09-06 | lista para construir | — | — |

Misiones 02 a 07 son las seis que llevan al MVP (registrarse, mostrarse, buscar, reseñar), en el orden de
dependencia definido en la conversación de roadmap del 2026-08-13 — el número no es prioridad, pero acá sí
refleja el orden real en que cada una desbloquea a la siguiente (ver el "Depende de" en el README de cada
una).

Estados: `exploración`, `definición`, `lista para construir`, `en construcción`, `en validación`,
`cerrada`, `pausada`. Al cerrar, el estado lleva su fecha (`cerrada 2026-09-30`). **En foco** es el único
documento que se está trabajando; el detalle de por qué vive en el README de la misión, no acá.

Solo una misión puede estar `en construcción` (delivery) a la vez, por foco — ver "Discovery: siempre en
worktree" y "Delivery: siempre en la raíz" en el `CLAUDE.md` raíz. El discovery previo (hasta `lista para
construir`) se trabaja en un git worktree y no cuenta para ese límite: varias misiones pueden estar en
discovery en paralelo, cada una en su propio worktree.

Los cuatro documentos de una misión (`investigacion.md`, `producto.md`, `experiencia.md`, `ingenieria.md`)
tienen su propio estado, independiente del de la misión: `pendiente`, `activo`, `en revisión`, `vigente`.
Vive en el encabezado de cada documento, no se repite en ningún README. Claude puede proponer contenido y
marcar `en revisión`; nunca marca `vigente` — eso lo otorga solo el dueño de producto, y el documento lo
registra ahí mismo: `**Estado:** vigente — aprobado por <nombre> el AAAA-MM-DD`. Los gates de cada
documento están definidos en su propio archivo (`discovery-product`, `discovery-ux`,
`discovery-engineering`); uno no pasa a `en revisión` sin cumplirlos.

## Candidatas

Una misión no existe hasta que tiene carpeta y número. Lo anterior a eso vive como issue, para que el
registro no se llene de intenciones:

| Candidata | Sale de | Issue |
| --------- | ------- | ----- |
| —         |         |       |

## Tipos de misión

- **Producto** — el flujo completo: `investigacion.md → producto.md → experiencia.md → ingenieria.md`. Es
  el caso normal: hay un problema de usuario que investigar y una decisión de alcance que tomar.
- **Técnica** — solo `ingenieria.md`, sin los otros tres documentos. Aplica cuando no hay cambio de
  producto observable — el resultado para quien usa Datealo es el mismo antes y después — y la decisión que
  la sustenta ya está tomada afuera, como un `A-xxx` del skill `arquitectura`. La carpeta no lleva
  `investigacion.md`, `producto.md` ni `experiencia.md`; el README recorta su tabla de estado a la sola
  fila de Ingeniería, y `ingenieria.md` cita el `A-xxx` donde el template pide un `F-xxx`.

  Forzar una migración o un cambio de infraestructura al formato de producto (JTBD, señal de éxito, lado
  del marketplace) produce una funcionalidad hueca solo para llenar el molde — es el antipatrón que
  `discovery-product` ya nombra como "apuesta sin validar". Si en algún punto una misión técnica descubre
  que sí cambia algo visible para el usuario, deja de ser técnica: se completa con `producto.md` y
  `experiencia.md` desde ese punto.

## Carril según riesgo

"Tipo" decide qué documentos existen. **"Carril" decide cuánto rigor de verificación pesa sobre esos
documentos**, y aplica el mismo criterio anti-molde de arriba a la profundidad del proceso: forzar el
proceso completo en un cambio reversible y de bajo riesgo es ceremonia sin valor — spec-driven development
funciona para cambios cross-team y de seguridad crítica, y se rompe rápido en desarrollo exploratorio, que
es la mayoría de los casos de un producto pre-lanzamiento como Datealo.

- **Sin misión** — bugs de un archivo, ajustes de copy o UI 100% reversibles, sin decisión de producto
  involucrada: issue directo + rama + PR + verificación, sin carpeta ni número de misión. Ya se usa así en
  la práctica (ver issue #199, el fix de los dots del carrusel) — esto solo lo hace explícito.
- **Light Spec** — la misión completa, con los documentos que le correspondan según su Tipo, pero **la
  evaluación en un contexto separado de cada gate es opcional**, no bloqueante. Aplica cuando la misión no
  crea ni cambia una tabla con datos de usuario, no toca RLS, Auth o pagos, y una decisión equivocada es
  barata de revertir.
- **Full Spec** — el proceso completo: evaluación en un contexto separado **obligatoria** en los tres gates
  que la tengan. Aplica cuando la misión toca modelo de datos con datos de usuario, RLS, Auth, pagos, o
  cualquier decisión cara de revertir (migración de datos, un contrato que otros PRs van a asumir como
  cierto).

El carril se declara en el README de la misión (`**Carril:**`) al abrirla. Puede subir a Full Spec a mitad
de camino si el diseño revela que sí toca algo de la lista — nunca bajar sin verificar antes que lo que ya
se saltó no hacía falta.

## Convención

- Carpeta `NN-slug/`. `NN` es el orden en que se abrió la misión: nunca se reusa, nunca se reordena, y una
  misión descartada se queda con su número. Es una bitácora, no un ranking — el número no dice prioridad
  ni dependencia.
- La sucesión se ve en el nombre de la carpeta; las fechas y el linaje se leen acá. Por eso el nombre no
  lleva fecha: una misión dura semanas y su carpeta no debería mentir sobre cuándo terminó.
- Al abrir una misión: copiar `template/`, tomar el número siguiente y agregar la fila en el registro. Al
  cerrarla: cambiar el estado acá y en su README.
- Si una misión nace de una decisión de otra, el "nace de" apunta a esa `D-xxx`. Las misiones se
  ramifican; sin ese campo, en tres meses nadie reconstruye por qué existe la número 04.

## Secuencia completa de una misión

Cada paso ya está definido en otro lado (`CLAUDE.md`, los skills de discovery, `discovery-engineering`) —
esta lista solo fija el **orden**, para no reconstruirlo de memoria cada vez. `/mision-estado` la lee para
decir en qué paso está una misión y cuál sigue.

**Esta secuencia es la de una misión de producto** (ver "Tipos de misión" arriba). Una misión **técnica**
salta los pasos 2 a 4 completos: no tiene `investigacion.md`, `producto.md` ni `experiencia.md` — va directo
del paso 1 (worktree) al paso 5 (`ingenieria.md`, citando el `A-xxx` que la sustenta en vez de un `F-xxx`).
Todo lo demás (6 en adelante) es igual para las dos.

1. **Abrir el worktree** (`EnterWorktree`, nombrado `NN-slug`) y copiar `template/` con el número siguiente.
2. **`investigacion.md`** — acumulativo, sin gate, no se aprueba. *(solo misión de producto)*
3. **`producto.md`** — gate de `discovery-product`, evaluación en un contexto separado, aprobación del
   dueño de producto (`vigente`). *(solo misión de producto)*
4. **`experiencia.md`** — gate de `discovery-ux`, evaluación en un contexto separado, aprobación. *(solo
   misión de producto)*
5. **`ingenieria.md`** — gate de `discovery-engineering` (incluye `seguridad-datos` si hay RLS), evaluación
   en un contexto separado, aprobación. Termina con el "Plan de construcción" cortado en slices — el método
   de corte está en [`references/slicing.md`](../../.claude/skills/discovery-engineering/references/slicing.md).
   Los issues del plan llevan la etiqueta de la decisión que los sustenta (`D-xxx`, `TC-xxx`), para que
   cuando esa decisión cambie se pueda encontrar exactamente qué tareas reescribir.
6. **Abrir el PR con los tres documentos** (`producto.md`, `experiencia.md`, `ingenieria.md`) — no antes de
   que los tres estén `vigente`.
7. **Mergear el PR de discovery.**
8. **Cerrar el worktree** (`ExitWorktree action: "remove"`) — antes de crear el primer issue, nunca después.
9. **Crear los issues** en GitHub desde el "Plan de construcción", uno por slice, con su label
   `type:`/`scope:` y la decisión que lo sustenta citada en el cuerpo.
10. **Por cada issue, en la raíz** (nunca en worktree): rama desde `main` → implementar → verificar
    (typecheck, build) → abrir PR citando `Closes #NNN` → **detenerse** — el checkpoint de revisión humana
    no es opcional. No arrancar el siguiente issue hasta que el PR actual esté mergeado o el dueño de
    producto pida explícitamente saltar al siguiente.
11. **Cuando todos los issues del plan estén mergeados**, cerrar la misión: actualizar el estado acá y en
    el README de la misión.

Saltarse el paso 6, 7 u 8 — ir de "`ingenieria.md` aprobado" directo al paso 9 — ya pasó una vez. No es
hipotético.
