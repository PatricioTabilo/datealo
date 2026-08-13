# Misiones

Una misión es el discovery de una feature: investigación, producto, experiencia e ingeniería, en cuatro
documentos con fuentes de verdad separadas. Cómo se escribe una está en
[`template/`](./template/README.md). Este archivo responde lo otro: qué misiones existen, en qué orden se
abrieron y de dónde salió cada una.

## Registro

| #   | Misión | Tipo | Abierta | Estado | En foco | Nace de |
| --- | ------ | ---- | ------- | ------ | ------- | ------- |
| 01  | [migración a Nuxt UI](./01-migracion-nuxt-ui/) | técnica | 2026-08-11 | cerrada 2026-08-13 | — | A-004 |

Estados: `exploración`, `definición`, `lista para construir`, `en construcción`, `en validación`,
`cerrada`, `pausada`. Al cerrar, el estado lleva su fecha (`cerrada 2026-09-30`). **En foco** es el único
documento que se está trabajando; el detalle de por qué vive en el README de la misión, no acá.

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
