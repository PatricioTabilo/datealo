# Misión: <nombre> — Experiencia

**Estado:** borrador

**Última actualización:** AAAA-MM-DD

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para flujos, estados, contenido e interacción. No redefine reglas de producto: si el
diseño descubre una regla nueva o invalida una, abre o actualiza una decisión en producto.md.

Núcleo obligatorio: vistas, mapa de estados, flujos críticos y estados por superficie. Las secciones bajo
demanda (modelo mental, jerarquía de información, validación) se agregan solo cuando una decisión las
necesita.

Gate de salida — experiencia.md está lista para ingenieria.md cuando:
- cada flujo crítico tiene secuencia, variantes, recuperación y criterio de término
- cada estado tiene contenido concreto (texto real, información visible, acción disponible)
- cada vista lista sus modos, y el mapa de estados cubre todas las transiciones entre ellos
- cada modo tiene su indicador permanente de estado, y cada flujo tiene todas sus salidas documentadas
- los casos límite de producto.md tienen flujo o estado mapeado
- cada flujo crítico está mockeado en móvil (390px), y en desktop si también vive ahí
- ninguna pantalla queda descrita como "similar a X" sin especificar qué cambia
-->

## Decisión de experiencia: <qué cambia para quien usa el producto>

<Modelo de interacción elegido, flujo más importante y la incertidumbre que sigue abierta.>

- **Funcionalidades cubiertas:** F-001, <otras>.
- **Pendiente bloqueante:** <pregunta o "ninguna">.

## Vistas

<!--
El listado de pantallas que define la experiencia — el mapa que se entrega antes de los flujos. Una línea
por vista, sin tabla, con sus modos anidados debajo. Una vista es un destino: se llega a ella. Un modo es
un estado de esa vista que cambia qué se puede hacer y qué se ve — se anida, nunca se lista como vista
hermana.

El porqué de cada vista, su trade-off o su justificación no van aquí: viven en su flujo (UXF) o en una
decisión (UX-xxx). Regla de formato para todo el documento: las tablas se reservan para índices de celdas
cortas; lo que lleva justificación extensa va en secciones con header + bullets, nunca en una celda.
-->

- **V-001 — <vista>** · móvil / desktop · resuelve F-001 · flujos UXF-001 · pendiente
  - modo **<nombre>** — <qué lo distingue y qué se puede hacer en él>
  - modo **<nombre>** — <ídem>

## Mapa de estados

<!--
Vistas y flujos son listas, y una lista no muestra un camino. Esta tabla conecta los modos: qué acción
lleva de uno a otro y qué pasa con el trabajo del usuario en cada salto. Cada fila que falte es una
pregunta que ingeniería resuelve inventando.
-->

| Desde  | Acción             | Queda en | Qué pasa con el trabajo              |
| ------ | ------------------ | -------- | ------------------------------------ |
| <modo> | <acción concreta>  | <modo>   | <qué se aplicó, qué quedó pendiente> |
| <modo> | <salir sin cerrar> | <modo>   | <qué se pierde o se conserva>        |

## UXF-001 — <flujo principal en verbo>

<!--
Duplica por flujo crítico. Cada paso describe acción → respuesta al nivel de "el usuario toca X → Datealo
muestra Y". Un mockup no reemplaza la secuencia porque no explica estados ni recuperación.
-->

**Objetivo:** <qué se completa o comprende>. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** <estado y superficie inicial, y qué acción trae al usuario hasta acá>.

**Criterio de término:** <estado observable que confirma que el flujo terminó bien>.

**Cómo sabe el usuario dónde está:** <el elemento concreto y permanente en pantalla que se lo dice, por
cada modo que toca este flujo>.

### Salidas

<!--
Todas las formas de irse, no solo terminar bien. El criterio de término cubre la salida buena; las otras
son las que el usuario encuentra primero. Un modo del que no se sabe salir es un modo donde el usuario se
pierde.
-->

| Salida                | Cómo se ejecuta       | Qué queda del trabajo           |
| --------------------- | --------------------- | ------------------------------- |
| <termina bien>        | <acción>              | <qué se aplicó y dónde>         |
| <descarta>            | <acción, Esc, cerrar> | <nada, ni a medias>             |
| <abandona sin cerrar> | <navega a otra parte> | <se conserva, se pierde, avisa> |

### Secuencia principal

| Paso | Acción            | Respuesta del sistema         | Información visible |
| ---- | ----------------- | ----------------------------- | ------------------- |
| 1    | <acción concreta> | <feedback o cambio de estado> | <dato y jerarquía>  |

### Variantes y recuperación

| Condición          | Qué cambia              | Cómo se entiende    | Cómo se recupera             |
| ------------------ | ----------------------- | ------------------- | ---------------------------- |
| <sin resultados>   | <estado>                | <mensaje concreto>  | <acción disponible>          |
| <sin permiso de ubicación> | <comportamiento> | <indicador visible> | <alternativa manual>         |
| <conexión lenta>   | <skeleton, no spinner>  | <qué se ve mientras>| <qué pasa si falla>          |

### Decisiones que no deben quedar implícitas

- <qué ocurre al cancelar, volver atrás, reintentar o confirmar>.
- <qué cambio se guarda inmediato y cuál necesita confirmación>.

## Estados por superficie

<!--
El contenido es concreto: texto real, no "mensaje apropiado". El estado vacío de un marketplace
pre-lanzamiento no es un detalle: para muchas búsquedas será el estado principal durante meses.
-->

| Estado  | Qué se muestra (texto e información real) | Acción disponible                   |
| ------- | ----------------------------------------- | ----------------------------------- |
| inicial | <contenido>                               | <acción>                            |
| vacío   | <por qué está vacío, con texto concreto>  | <cómo avanzar, o ninguna y por qué> |
| carga   | <skeleton de qué forma>                   | <ninguna>                           |
| error   | <causa útil y alcance>                    | <recuperación>                      |

## Mockups

<!--
Los mockups viven en design-mockups/ como HTML (ver el skill discovery-ux y docs/design/README.md).
Exploran o materializan una decisión; no son fuente de verdad de reglas de producto.
-->

| Mockup   | Cubre   | Estado                 | Ruta                              |
| -------- | ------- | ---------------------- | --------------------------------- |
| <nombre> | UXF-001 | exploración o validado | `./design-mockups/<archivo>.html` |

## Cobertura

<!-- Detecta huecos antes de construir. Una funcionalidad sin pantalla nueva igual tiene estados. -->

| Funcionalidad | Flujo   | Estados cubiertos       | Estado    |
| ------------- | ------- | ----------------------- | --------- |
| F-001         | UXF-001 | principal, vacío, error | pendiente |

## Secciones bajo demanda

<!--
Agregar solo cuando una decisión las necesite, con estos títulos:

- "Modelo mental y lenguaje": cuando un concepto de producto pueda confundirse en la interfaz.
- "Jerarquía de información": cuando una superficie densa exija decidir qué se ve primero (una card de
  resultado con foto, rating, distancia, precio y disponibilidad es exactamente ese caso).
- "Validación (UXV-xxx)": cuando una incertidumbre de diseño necesite prueba con usuarios.
- "Accesibilidad y adaptación": cuando el contexto de uso cambie el flujo o la representación.
-->

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — <decisión en una frase>

- **Estado:** propuesta, aceptada, reemplazada o descartada. **Fecha:** AAAA-MM-DD.
- **Sustento:** F-001 o <hallazgo>.
- **Alternativas descartadas:** <opciones relevantes y trade-off, con el porqué del rechazo>.
- **Decisión y consecuencia:** <qué flujo o superficie cambia>.
- **Impacto en producto:** <ninguno o enlace a D-xxx/F-xxx actualizado>.

## Preguntas

<!--
Todas viven en esta tabla ordenada por ID, abiertas y cerradas juntas. Ningún ID se borra ni se reutiliza.
Estado: abierta | resuelta AAAA-MM-DD | disuelta AAAA-MM-DD. Solo las abiertas llevan bloque de detalle.
-->

<Una frase que responde "¿qué falta?": la pregunta que bloquea construcción y qué bloquea.>

| ID      | La duda                | Estado              | Respuesta, o quién la resuelve                                  |
| ------- | ---------------------- | ------------------- | --------------------------------------------------------------- |
| UXQ-001 | <la duda en una frase> | abierta             | <quién la resuelve, con qué método, qué bloquea y hasta cuándo> |
| UXQ-002 | <la duda en una frase> | resuelta AAAA-MM-DD | <qué se respondió, enlazando la decisión que la cerró>          |
