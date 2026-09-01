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
| 06  | [búsqueda y resultados](./06-busqueda-resultados/) | producto | 2026-08-13 | exploración | — | — |
| 07  | [reseñas verificadas por contacto](./07-resenas-verificadas-por-contacto/) | producto | 2026-08-13 | cerrada 2026-08-31 | — | — |
| 08  | [foto de perfil de profesional](./08-foto-perfil-profesional/) | producto | 2026-08-29 | definición | — | — |

Misiones 02 a 07 son las seis que llevan al MVP (registrarse, mostrarse, buscar, reseñar), en el orden de
dependencia definido en la conversación de roadmap del 2026-08-13 — el número no es prioridad, pero acá sí
refleja el orden real en que cada una desbloquea a la siguiente (ver el "Depende de" en el README de cada
una).

Estados: `exploración`, `definición`, `lista para construir`, `en construcción`, `en validación`,
`cerrada`, `pausada`. Al cerrar, el estado lleva su fecha (`cerrada 2026-09-30`). **En foco** es el único
documento que se está trabajando; el detalle de por qué vive en el README de la misión, no acá.

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

## Cómo se conecta con la ejecución

El discovery termina en el "Plan de construcción" de `ingenieria.md`: una lista ordenada de slices donde
cada slice es un Issue y un PR. Los issues llevan la etiqueta de la decisión que los sustenta (`D-xxx`,
`TC-xxx`), para que cuando una decisión cambie se pueda encontrar exactamente qué tareas reescribir.

El método de corte está en el skill `discovery-engineering`
([`references/slicing.md`](../../.claude/skills/discovery-engineering/references/slicing.md)).
