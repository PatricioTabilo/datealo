# Misión 15: múltiples comunas por profesional — Producto

**Estado:** vigente — aprobado por Patricio Tabilo el 2026-09-06

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: un profesional declara todas las comunas donde atiende, no solo una

**Resultado:** un profesional como Rudiberto puede marcar en su perfil todas las comunas donde trabaja de
verdad — Llanquihue, Frutillar y Puerto Varas — y aparece como coincidencia exacta en la búsqueda de
cualquiera de ellas, no solo en la que declaró al registrarse.

**Recorte respecto del ideal:** el ideal ([investigacion.md](./investigacion.md)) no impone restricciones
de cantidad ni de zona. Esta entrega tampoco las impone — el recorte real está en la superficie donde se
muestran las comunas declaradas (perfil público, card de resultados), que queda para `experiencia.md`, y en
que no introduce ninguna jerarquía entre comunas ni ningún tope (ver [D-001](#d-001), [D-002](#d-002)).

**Restricciones aceptadas:** aplica solo a comunas activas, con el mismo criterio que usa hoy la búsqueda
(`comunas.activa = true`); no cambia el conjunto de comunas activas (Gran Santiago y la cuenca del lago
Llanquihue) ni depende de en cuál de ellas esté el profesional.

## Funcionalidades

| ID    | Funcionalidad                                                    | Lado         | Sustento              | Éxito |
| ----- | ------------------------------------------------------------------ | ------------ | ---------------------- | ----- |
| F-001 | Declarar varias comunas y aparecer como coincidencia exacta en todas | profesional (con efecto directo en buscador) | C-001, C-004, D-001 | M-001 |

<a id="f-001"></a>

### F-001 — Declarar varias comunas y aparecer como coincidencia exacta en todas

Cuando Rudiberto atiende de forma habitual en Llanquihue, Frutillar y Puerto Varas,
quiero marcar las tres en mi perfil de profesional,
para que alguien que busque gasfitería en cualquiera de esas comunas me encuentre como resultado directo,
no como una sugerencia de comuna vecina.

**Lado del marketplace:** profesional declara, buscador recibe el efecto directo en `/api/search`. **Qué
necesita del otro lado:** ninguna precondición de volumen — la funcionalidad entrega su resultado igual con
uno o con muchos profesionales en la comuna buscada.

**Sustento:** [C-001](./investigacion.md#c-001), [C-004](./investigacion.md#c-004) y [D-001](#d-001).
**Éxito:** [M-001](#m-001).

**Reglas:**

- Si el profesional marca una comuna activa además de la que ya tenía, esa comuna cuenta como coincidencia
  exacta en `/api/search`, con las mismas reglas de orden (completitud del perfil, luego antigüedad) que
  ya aplican hoy a una sola comuna.
- Si un profesional ya existía antes de este cambio, su comuna actual se preserva automáticamente como una
  de sus comunas declaradas — no tiene que volver a configurar nada para no perder la cobertura que ya
  tenía (ver [D-003](#d-003)).
- Si el profesional intenta guardar su perfil sin ninguna comuna marcada, Datealo no permite guardar — debe
  declarar al menos una, igual que exige hoy.
- El profesional puede desmarcar una comuna que había declarado, igual que puede marcar una nueva — sujeto
  a la misma regla anterior: no puede quedar con cero.
- Si una comuna que el profesional había declarado se desactiva más adelante, Datealo deja de mostrarlo ahí
  pero no borra la declaración — el mismo criterio que ya aplica a la comuna única de hoy.
- Datealo nunca agrega una comuna a la declaración de un profesional por cercanía geográfica — toda comuna
  que cuenta como exacta fue elegida a mano por él. El fallback de comunas vecinas (misión 06) sigue
  operando sin cambios para las comunas donde ningún profesional declaró cobertura directa.

**Ejemplo verificable:** dado que Rudiberto declaró Llanquihue, Frutillar y Puerto Varas, cuando alguien
busca "gasfitería" en Puerto Varas, entonces Rudiberto aparece en los resultados con `matchType: 'exacta'`,
igual que si buscaran en Llanquihue o en Frutillar.

**No incluye:** cómo se muestran las comunas declaradas en el perfil público o en la card de resultados —
hoy `comunaNombre` es un solo valor y esta funcionalidad no define su reemplazo visual, eso se resuelve en
`experiencia.md`.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta                                                        | Comportamiento esperado                                                                 | Funcionalidades |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| CL-001 | El profesional marca la misma comuna dos veces                             | Datealo la trata como una sola declaración — no genera una fila duplicada ni un resultado repetido | F-001            |
| CL-002 | Todas las comunas declaradas por un profesional quedan inactivas           | Datealo lo trata igual que hoy trata a un profesional cuya única comuna está inactiva — no aparece en ningún resultado de búsqueda | F-001            |
| CL-003 | Una comuna buscada no tiene ningún profesional con coincidencia exacta (ni declarada ni por comuna vecina propia) | El fallback de comunas vecinas se activa exactamente como hoy, sin cambios — la declaración explícita no lo reemplaza | F-001            |
| CL-004 | El profesional intenta desmarcar su única comuna declarada                | Datealo no permite guardar el cambio — la misma regla que exige al menos una comuna se aplica también al eliminar, no solo al guardar por primera vez | F-001            |

## Fuera de alcance

| Capacidad o caso                                                             | Estado      | Razón del recorte                                                                                          | Condición para reconsiderar |
| ------------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Mostrar la lista completa de comunas declaradas en la card de resultados y el perfil público | postergada  | Es una decisión de diseño de superficie, no de qué datos existen — corresponde a `experiencia.md`, no a esta entrega | cuando `experiencia.md` defina cómo mostrarlo sin sobrecargar la card |
| Tope numérico o advertencia de UX sobre cuántas comunas puede declarar un profesional | descartada por ahora | Ningún benchmark revisado (Thumbtack, Angi) sugiere que haga falta ([C-006](./investigacion.md#c-006)) | si aparece un caso real de abuso (comunas declaradas sin relación con dónde trabaja el profesional) |
| Rediseñar el grafo de "comunas vecinas" para incluir zonas funcionales como la cuenca de un lago | descartada  | La declaración explícita ya resuelve el problema que esto intentaría resolver, sin tocar un mecanismo que cumple otro propósito ([C-004](./investigacion.md#c-004)) | si aparece evidencia de que el grafo de vecinas necesita ajustarse por otra razón, independiente de esta misión |

## Señales de éxito

<a id="m-001"></a>

### M-001 — Los profesionales que atienden más de una comuna la declaran, en vez de quedarse con una sola

- **Pregunta:** ¿los profesionales en la situación de Rudiberto usan la nueva capacidad, o el problema
  seguía sin resolverse solo porque nadie sabía que podía pedirlo?
- **Señal:** de los profesionales activos, qué proporción tiene más de una comuna declarada.
- **Método y umbral:** revisión manual del total de profesionales activos con 2+ comunas declaradas, sobre
  el total de profesionales activos, en las primeras semanas tras el lanzamiento — con el volumen actual
  (pre-lanzamiento, decenas de profesionales) no alcanza para un umbral estadístico, así que la primera
  lectura es cualitativa: ¿apareció al menos un caso más además de Rudiberto?
- **Guardrail:** la proporción de profesionales con cero comunas activas válidas no debe subir respecto de
  antes del cambio — significaría que alguien perdió cobertura por un error en la migración de datos
  existentes ([D-003](#d-003)).
- **Verificación funcional (una sola vez, al implementar, no una métrica recurrente):** buscar "gasfitería"
  en Frutillar o Puerto Varas y confirmar que Rudiberto aparece con `matchType: 'exacta'` — parte del QA
  del feature, no algo que se repite después.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — Todas las comunas declaradas por un profesional cuentan igual, sin una comuna "principal"

- **Estado:** propuesta. **Fecha:** 2026-09-13.
- **Sustento:** [C-001](./investigacion.md#c-001).
- **Tensión:** simplicidad del dato y de la búsqueda (todas las comunas son iguales) contra la posibilidad
  de que el perfil público quiera destacar una comuna "de origen" para dar contexto (por ejemplo, "vive en
  Puerto Varas, también atiende en Frutillar y Llanquihue").
- **Alternativas descartadas:** mantener una comuna "principal" obligatoria más comunas "adicionales"
  opcionales — se descarta porque Rudiberto no tiene una comuna más real que las otras dos, y forzar esa
  jerarquía inventaría una distinción que el caso que motivó la misión no tiene. Ordenar las comunas
  declaradas por antigüedad de registro sin marcarlas como "principal" en los datos — se descarta como
  complejidad sin justificación: no hay evidencia de que el orden de despliegue le importe a nadie todavía.
- **Decisión y consecuencia:** las comunas declaradas se guardan como un conjunto sin orden ni jerarquía.
  Habilita que ingeniería modele una relación simple profesional↔comuna, sin una columna de "es principal".
  Limita: si más adelante el perfil público necesita destacar una comuna de origen distinta de las demás,
  hace falta una decisión nueva.
- **Reapertura:** si `experiencia.md` encuentra que el perfil público necesita mostrar una comuna "de
  origen" distinta de las demás.

<a id="d-002"></a>

### D-002 — Sin tope numérico de comunas por profesional en esta entrega

- **Estado:** propuesta. **Fecha:** 2026-09-13.
- **Sustento:** [C-006](./investigacion.md#c-006).
- **Tensión:** simplicidad (no construir ni mantener una regla de límite) contra el riesgo de que un
  profesional declare comunas sin relación real con dónde trabaja, degradando la confianza de "esta persona
  sí atiende acá".
- **Alternativas descartadas:** un tope fijo bajo (por ejemplo, máximo 5 comunas) — se descarta porque
  ningún benchmark revisado respalda un número específico, y un tope arbitrario podría bloquear a un
  profesional real con una cobertura más amplia que el número elegido. Un tope distinto según la densidad
  de la zona (más comunas permitidas en regiones que en Santiago) — se descarta por la misma razón que la
  misión 14 ya documentó para reglas dependientes de densidad: no hay datos de uso reales todavía para
  calibrarlo con algo mejor que una intuición.
- **Decisión y consecuencia:** cualquier profesional puede declarar cualquier cantidad de comunas activas.
  Si en producción aparece abuso real, se revisa con datos concretos en vez de una intuición previa.
- **Reapertura:** si se observa un profesional declarando un número de comunas que no corresponde a un área
  de trabajo real, o si aparece un reporte concreto de perfiles poco creíbles por esta razón.

<a id="d-003"></a>

### D-003 — Las comunas que un profesional ya tenía declaradas hoy se preservan automáticamente

- **Estado:** propuesta. **Fecha:** 2026-09-13.
- **Sustento:** [C-001](./investigacion.md#c-001) — ningún profesional existente debe perder cobertura por
  este cambio.
- **Tensión:** ninguna tensión fuerte entre alternativas reales — se documenta igual porque es una decisión
  sobre migración de datos existentes, cara de revertir si sale mal (Carril Full Spec de esta misión).
- **Alternativas descartadas:** pedirle a cada profesional existente que vuelva a confirmar sus comunas al
  iniciar sesión — se descarta porque agrega fricción sin resolver ninguna ambigüedad real: la comuna que
  ya tenían sigue siendo válida tal cual estaba.
- **Decisión y consecuencia:** la migración de datos convierte automáticamente el valor actual de
  `professionals.comunaCodigo` en la primera fila de la nueva relación profesional↔comuna, sin que el
  profesional tenga que hacer nada. Cómo se ejecuta esa migración en concreto es de `ingenieria.md`.
- **Reapertura:** ninguna prevista.

## Preguntas

No queda ninguna pregunta abierta que bloquee `experiencia.md`: las dos dudas originales de esta misión
(relación con comunas vecinas, tope de comunas) se resolvieron en `investigacion.md`
([C-004](./investigacion.md#c-004), [C-006](./investigacion.md#c-006)) y en las decisiones de esta página.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | —                                |
