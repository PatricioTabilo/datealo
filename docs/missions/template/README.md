# Plantilla de misión

Una misión documenta el discovery de una feature en cuatro documentos con fuentes de verdad separadas.
La investigación se acumula; el resultado se reescribe. Cada documento debe permitir que otra persona
entienda, cuestione y ejecute sin reconstruir conversaciones.

La escritura sigue la [narrativa del proyecto](../../project-narrative.md). Las instrucciones en
comentarios HTML se eliminan al completar cada sección. Las secciones que no aportan una decisión, riesgo
o contrato verificable también se eliminan.

## Los cuatro documentos

| Documento                                | Naturaleza                  | Fuente de verdad para                            |
| ---------------------------------------- | --------------------------- | ------------------------------------------------ |
| [`investigacion.md`](./investigacion.md) | Se acumula, no se reescribe | Evidencia, benchmarks, conclusiones y el ideal   |
| [`producto.md`](./producto.md)           | Viva, siempre vigente       | Qué construimos: funcionalidades, reglas, señales |
| [`experiencia.md`](./experiencia.md)     | Viva, siempre vigente       | Flujos, estados, contenido y validación          |
| [`ingenieria.md`](./ingenieria.md)       | Viva, siempre vigente       | Contratos, datos, factibilidad y pruebas         |

El flujo es `investigacion → producto → experiencia → ingenieria`, con loops de vuelta: si experiencia o
ingeniería invalidan una decisión, el cambio se registra primero en `producto.md` y desde ahí se propaga.
Los documentos pueden avanzar en paralelo, pero nada se declara listo fuera de ese orden.

## Trazabilidad

`E-001 evidencia → C-001 conclusión → D-001 decisión → F-001 funcionalidad → M-001 señal de éxito`

Evidencia y conclusiones viven en `investigacion.md`. Decisiones, funcionalidades y señales viven en
`producto.md` y enlazan hacia la investigación. Experiencia (`UX`) e ingeniería (`T`) enlazan a `F` o `D`.
Una funcionalidad sin conclusión que la sostenga es una apuesta sin validar y se presenta como tal.

Datealo está pre-lanzamiento: la mayoría de la evidencia disponible es benchmark, entrevista o
comportamiento observado fuera del producto, no datos de uso propios. Eso no baja el estándar — sube la
importancia de la columna "límite de la evidencia".

## Cómo iniciar una misión

1. Copiar esta carpeta a `docs/missions/NN-<slug>/`, con el número siguiente del
   [registro de misiones](../README.md), y agregar ahí su fila.
2. Empezar por el problema y la evidencia en `investigacion.md`.
3. Abrir `producto.md` cuando la investigación sostenga al menos una conclusión.
4. Abrir `experiencia.md` e `ingenieria.md` cuando producto cumpla su gate de salida.
5. Mantener este README como mapa de dependencias, hito y decisiones bloqueantes — el estado de cada
   documento se mantiene en su propio encabezado, no acá.

## Estado y ciclo de aprobación

**Misión NN** — abierta el AAAA-MM-DD. Nace de: `<D-xxx de la misión NN>` o "ninguna". Ver el
[registro de misiones](../README.md).

**Estado de la misión:** exploración · definición · lista para construir · en construcción ·
en validación · cerrada · pausada

**Última actualización:** AAAA-MM-DD

<!-- El estado de cada documento va en su propio encabezado, no acá — ver docs/missions/README.md
para la convención completa (estados, quién marca vigente, gates). No la repitas en esta lista. -->

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** <resultado verificable> — fecha límite AAAA-MM-DD.

Si la fecha del hito pasó, la misión está estancada y este README debe decirlo explícitamente, con la
causa y la decisión que la destranca.

## Decisiones cruzadas

<!-- Solo decisiones que cambian más de un documento. El detalle vive en su fuente de verdad. -->

| ID    | Decisión en una frase | Fuente de verdad | Impacta | Estado    | Fecha límite |
| ----- | --------------------- | ---------------- | ------- | --------- | ------------ |
| D-001 | <decisión>            | `producto.md`    | UX, T   | propuesta | AAAA-MM-DD   |

Toda decisión `propuesta` lleva fecha límite y qué la desbloquea. Una decisión sin deadline es un pocket
veto: nadie la rechaza, nadie la aprueba y se construye igual. Estados: propuesta, aceptada, reemplazada,
descartada. Una decisión reemplazada enlaza la nueva.

## Resumen ejecutivo

<!-- Lectura de dos minutos. Resultados y decisiones, no cronología. Se actualiza durante toda la misión. -->

- **Problema confirmado:** <situación observable y consecuencia>.
- **Dirección elegida:** <cómo cambia el producto>.
- **Alcance actual:** <resultado que entregará esta etapa>.
- **Fuera de alcance:** <límite principal>.
- **Decisión bloqueante:** <pregunta pendiente o "ninguna">.

## Por qué esta estructura

Combina prácticas públicas adaptadas a una misión viva en un repositorio:

- [Working Backwards de Amazon][aws]: el resultado del usuario se escribe antes que el feature, y la
  investigación es insumo, no parte del comunicado.
- [Shape Up de Basecamp][basecamp-pitch]: problema concreto, solución al nivel justo de abstracción,
  límites explícitos.
- [Procesos RFC][rfc]: la estructura pesada va en la gestión del documento (estados, deadlines, decisor
  nombrado), no en su contenido.

[aws]: https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-product-development/start-with-why.html
[basecamp-pitch]: https://basecamp.com/shapeup/1.5-chapter-06
[rfc]: https://blog.pragmaticengineer.com/rfcs-and-design-docs/
