# Misión: <nombre> — Ingeniería

**Estado:** borrador

**Última actualización:** AAAA-MM-DD

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para arquitectura, datos, contratos, factibilidad y pruebas. Consume el comportamiento
definido en producto. Una limitación técnica cambia el alcance solo mediante una decisión explícita en
producto.md.

Núcleo obligatorio: contratos, modelo de datos, RLS y riesgos de factibilidad. Las secciones bajo demanda
(migración, rendimiento, entrega por etapas) se agregan solo cuando el riesgo lo justifica.

Gate de salida — ingenieria.md está lista para construir cuando:
- los contratos definen qué entra, qué sale y qué invariantes se mantienen, sin ambigüedad
- el modelo de datos soporta los casos límite de producto.md sin workarounds
- el impacto en RLS está resuelto: qué policy se crea o cambia, o por qué ninguna
- la migración de datos existentes tiene estrategia o está explícitamente fuera del alcance
- los escenarios verificables de producto están mapeados a pruebas
- el plan de construcción corta el diseño en slices atómicos ordenados (un slice = un Issue = un PR)
-->

## Decisión técnica: <arquitectura y riesgo principal>

<Dirección técnica, trade-off principal y el riesgo que todavía podría invalidarla.>

- **Contratos de producto cubiertos:** F-001, <otros>.
- **Riesgo bloqueante:** <incertidumbre o "ninguna">.

## Arquitectura: <cómo se divide la responsabilidad>

<!--
La lógica de negocio se separa de la infraestructura: funciones puras en utils/ y server/utils/,
reactividad en composables, acceso a datos en server/api/ con Drizzle. Incluye diagrama solo cuando tres o
más partes interactúan.
-->

<Descripción del enfoque y por qué satisface los contratos con menor riesgo.>

| Componente | Responsabilidad       | No debe decidir | Contratos |
| ---------- | --------------------- | --------------- | --------- |
| <nombre>   | <una responsabilidad> | <frontera>      | F-001     |

## Contratos

<!--
Cada contrato especifica entrada, salida e invariantes al nivel en que se puede implementar sin reuniones
de aclaración. Incluye los errores observables y el código HTTP cuando es un endpoint.
-->

### TC-001 — <contrato en una frase>

- **Entrada:** <datos y precondiciones, con tipos y forma concreta>.
- **Salida:** <resultado y su forma concreta>.
- **Invariantes:** <qué se cumple siempre: atomicidad, consistencia, idempotencia>.
- **Errores:** <condición → código HTTP y cuerpo `{ error, code? }`, y qué puede hacer el llamador>.
- **Contrato de producto:** [F-001](./producto.md#f-001).

## Modelo de datos

<!-- Entidades con significado, escritura y ciclo de vida. El schema completo vive en server/db/. -->

| Entidad o campo | Significado             | Escritura          | Retención o historial |
| --------------- | ----------------------- | ------------------ | --------------------- |
| <dato>          | <semántica de producto> | <endpoint o acción>| <política>            |

### Invariantes de datos

- <unicidad, pertenencia, orden o consistencia temporal>.
- <qué operación es atómica o qué dato tiene una única fuente de verdad>.

### Impacto en RLS

<!--
Obligatorio. Fuente de verdad: server/db/sql/rls.sql. Si el cambio no toca ownership ni relaciones usadas
en policies, decirlo explícitamente con esa razón — no dejar la sección vacía.
-->

| Tabla    | Cambio                 | Policy afectada | Acción                    |
| -------- | ---------------------- | --------------- | ------------------------- |
| <tabla>  | <nueva, ownership, FK> | <nombre>        | <crear, actualizar, nada> |

## Riesgos y experimentos de factibilidad

<!--
Un riesgo que podría cambiar el producto se enlaza como pregunta o decisión en producto.md. Un experimento
tiene pregunta, límite de tiempo y resultado capaz de cerrar la incertidumbre.
-->

| ID     | Riesgo o pregunta | Qué invalida        | Experimento o mitigación  | Criterio de salida      | Estado  |
| ------ | ----------------- | -------------------- | ------------------------- | ----------------------- | ------- |
| TR-001 | <incertidumbre>   | <alcance en riesgo>  | <spike, prueba o recorte> | <resultado concluyente> | abierto |

## Estrategia de pruebas

<!-- Mapea los ejemplos verificables de producto.md a niveles de prueba. Qué demuestra cada una. -->

| Contrato o riesgo | Nivel                          | Caso principal | Límite o falla |
| ----------------- | ------------------------------ | -------------- | -------------- |
| F-001, CL-001     | <unidad, contrato, integración>| <caso>         | <caso>         |

### Propiedades que deben probarse

- <invariante bajo reintentos, concurrencia o distintas entradas>.
- <ausencia de efectos parciales en falla>.

## Plan de construcción

<!--
Se completa al final, cuando el gate de salida se cumple y ninguna pregunta bloqueante sigue abierta —
cortar sobre decisiones abiertas produce issues que mueren. Cada slice es un cambio funcional atómico: un
Issue, un PR, ejecutable sin haber leído la misión (el issue lleva su contrato inline) y con criterios
pass/fail enumerables como tests. Guía completa en el skill discovery-engineering.
-->

| ID    | Slice (una frase, sin "y") | Sustento      | Criterio de aceptación principal          | Depende de |
| ----- | --------------------------- | ------------- | ------------------------------------------ | ---------- |
| S-001 | <cambio atómico>           | TC-001, D-001 | <entrada concreta → resultado observable> | —          |

## Secciones bajo demanda

<!--
Agregar solo cuando el riesgo lo justifique, con estos títulos:

- "Migración y compatibilidad": cuando existan datos o consumidores que deben llegar al nuevo contrato.
  Incluye rollback lógico si la migración física no puede revertirse.
- "Rendimiento y observabilidad": cuando haya presupuesto de latencia o volumen que defender (búsqueda
  geográfica y listados paginados son los candidatos naturales).
- "SEO e indexación": cuando la superficie deba ser indexable (páginas por categoría + comuna, datos
  estructurados).
- "Entrega por etapas": cuando el cambio necesite despliegue incremental o feature flags.
-->

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — <decisión en una frase>

- **Estado:** propuesta, aceptada, reemplazada o descartada. **Fecha:** AAAA-MM-DD.
- **Contratos:** F-001 y <regla relevante>.
- **Alternativas descartadas:** <opciones y trade-offs, con el porqué del rechazo>.
- **Decisión y consecuencias:** <enfoque elegido, beneficio, costo y trabajo futuro aceptado>.
- **Reapertura:** <medición o cambio que justificaría revisar>.

## Preguntas

<!--
Todas viven en esta tabla ordenada por ID, abiertas y cerradas juntas. Ningún ID se borra ni se reutiliza.
Estado: abierta | resuelta AAAA-MM-DD | disuelta AAAA-MM-DD. Solo las abiertas llevan bloque de detalle.
-->

<Una frase que responde "¿qué falta?": la pregunta que bloquea construcción y qué bloquea.>

| ID     | La duda                | Estado              | Respuesta, o quién la resuelve                                  |
| ------ | ----------------------- | -------------------- | ----------------------------------------------------------------- |
| TQ-001 | <la duda en una frase> | abierta             | <quién la resuelve, con qué método, qué bloquea y hasta cuándo> |
| TQ-002 | <la duda en una frase> | resuelta AAAA-MM-DD | <qué se respondió, enlazando la decisión que la cerró>          |
