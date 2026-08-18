# Misión 03: taxonomía de categorías y comunas — Producto

**Estado:** vigente

**Última actualización:** 2026-08-17. **Aprobado por Patricio el:** 2026-08-17.

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: el catálogo completo de oficios y comunas, con un interruptor por fila para
controlar qué está disponible sin necesitar un deploy

**Resultado:** cuando un profesional se registre (misión 04) va a elegir su oficio y su comuna de dos
listas fijas, no escribirlas a mano — y esas listas siempre apuntan a un registro real del catálogo, nunca
a texto suelto. Cuando alguien busque (misión 06), esas mismas dos listas son las que va a poder filtrar.
Ningún desarrollador de esas dos misiones inventa su propia versión, y ambas usan el mismo componente de
selección (ver [D-004](#d-004)).

**Recorte respecto del ideal:** el ideal (ver [investigacion.md](./investigacion.md)) es cualquier oficio
en cualquiera de las 346 comunas de Chile. La tabla de datos ya cubre eso completo — las 346 comunas y las 8
categorías existen desde el día uno. Lo que se recorta no es la lista, es **cuáles de esas filas están
activas** (visibles para registro y búsqueda) al lanzamiento: Gran Santiago y Puerto Varas para partir,
controlado por un campo `activa` que se prende o apaga sin tocar código (ver [D-002](#d-002)).

**Restricciones aceptadas:** 8 oficios fijos al lanzamiento (nada de subcategorías dentro de un oficio,
aunque el catálogo puede sumar categorías nuevas después sin costo), español chileno como único idioma, sin
panel de administración todavía — activar o desactivar una fila se hace directo en la base de datos.

## Sin funcionalidades propias en registro o búsqueda — sí un componente compartido

Esta misión no construye ninguna pantalla completa que un profesional o un buscador use directo — el
formulario de registro es misión 04, la pantalla de resultados es misión 06. Lo que esta misión sí entrega,
además del catálogo, es el **componente de selección** que ambas van a importar (`ComunaSelect`,
`CategoriaSelect` — ver [D-004](#d-004) e `ingenieria.md`), para que nadie lo construya dos veces ni de
formas distintas. Por eso no hay una sección de Funcionalidades en formato JTBD: no hay un flujo completo
de usuario que viva acá, pero sí una pieza reutilizable con su propia regla de comportamiento.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — Las 8 categorías ya usadas en la landing son el catálogo oficial del lanzamiento

- **Estado:** aceptada. **Fecha:** 2026-08-17. **Aprobada por Patricio el:** 2026-08-17.
- **Sustento:** [C-001](./investigacion.md#c-001).
- **Tensión:** cubrir más oficios da más superficie de búsqueda, pero cada oficio nuevo sin profesionales
  registrados es una categoría vacía que se ve peor que no tenerla.
- **Alternativas descartadas:** taxonomía extensa estilo Thumbtack (cientos de microcategorías) — con
  oferta cero al lanzamiento, casi todas quedan vacías. Categorías genéricas estilo TaskRabbit ("Handyman")
  — pierden la palabra exacta que un chileno usa para pedir ayuda.
- **Decisión y consecuencia:** el catálogo son estas 8, en este nombre exacto, sin subcategorías:

  | Categoría     | Ejemplo de lo que cubre                          |
  | ------------- | -------------------------------------------------- |
  | Gasfitería    | Filtraciones, instalación de artefactos, cañerías |
  | Electricidad  | Instalaciones, cortocircuitos, cambio de enchufes |
  | Peluquería    | Corte, color, peinado a domicilio                 |
  | Limpieza      | Aseo profundo, aseo periódico de depto o casa      |
  | Mudanzas      | Mudanza dentro de Santiago, fletes chicos          |
  | Pintura       | Pintar living, dormitorio, fachada                 |
  | Cerrajería    | Cerraduras, llaves, emergencias de acceso          |
  | Jardinería    | Mantención de jardín, poda, pasto                  |

  Esta lista es solo el catálogo — cómo un buscador la elige en pantalla (tocar una categoría de una
  lista, como ya hace el carrusel de la landing, o escribir texto libre) es una decisión de la misión 06,
  no de esta. No se asume texto libre ni matching de sinónimos acá: eso solo haría falta si 06 decide un
  buscador de texto, y en ese caso la decisión de vocabulario se toma en su propio `producto.md`, no en
  este.

  Cada categoría tiene además un campo `activa` (ver [D-002](#d-002) para el mismo mecanismo aplicado a
  comunas) — las 8 parten activas, pero el interruptor existe por si hace falta pausar una sin borrarla
  (ej. problemas de calidad recurrentes en una categoría) o sumar una nueva sin que aparezca hasta estar
  lista.

  Agregar una categoría nueva después es barato (una fila más); sacar una que ya tiene profesionales
  registrados no — por eso el catálogo parte corto a propósito.
- **Reapertura:** cuando una categoría fuera del catálogo se pida seguido en el formulario de espera o en
  los primeros meses de operación (ver [M-001](#m-001)).

<a id="d-002"></a>

### D-002 — El catálogo tiene las 346 comunas de Chile completas; un campo `activa` por comuna controla
qué se ofrece en registro y búsqueda, sin tocar código

- **Estado:** aceptada. **Fecha:** 2026-08-17. **Aprobada por Patricio el:** 2026-08-17.
- **Sustento:** [C-002](./investigacion.md#c-002). Revisa la implicación de [C-003](./investigacion.md#c-003)
  — ver la nota de revisión ahí.
- **Tensión:** excluir comunas del catálogo (la primera versión de esta decisión) evita mostrar opciones
  sin cobertura, pero cuesta caro revertir y no hay ningún motivo real para no tener el dato completo — es
  solo una fila más por comuna, sin costo de UI ni de base de datos. Lo que sí es limitado es cuánto puede
  reclutar y verificar Patricio a mano, y eso no depende de cuántas filas tiene la tabla.
- **Alternativas descartadas:** catálogo recortado a un subconjunto fijo de comunas (Gran Santiago
  solamente, la versión anterior de esta decisión) — mezclaba "qué existe en la base de datos" con "dónde
  reclutamos primero", dos preguntas distintas que no necesitan la misma respuesta. Dejar el campo de comuna
  como texto libre — rompe [D-004](#d-004), permitiría "Ñuñoa", "ñuñoa" y "Nunoa" como tres valores
  distintos.
- **Decisión y consecuencia:** la tabla de comunas tiene las 346 comunas oficiales de Chile
  ([E-006](./investigacion.md#e-006) de investigación) desde el día uno, cada una con un campo booleano
  `activa`. Solo las comunas `activa = true` aparecen como opción en el selector de registro y de búsqueda
  — una comuna inactiva no se ofrece, no se muestra como "sin resultados". Al lanzamiento parten activas
  las comunas de Gran Santiago y Puerto Varas (los dos mercados donde Patricio puede reclutar y verificar
  profesionales directamente); el resto existe en la tabla pero apagado. Activar una comuna nueva es
  cambiar ese campo, sin deploy — hoy a mano en la base de datos, más adelante quizás desde un panel de
  administración (fuera de alcance de esta misión).
- **Reapertura:** ninguna — el catálogo ya está completo. Lo que se revisa con el tiempo es qué comunas
  están activas, y eso no necesita reabrir esta decisión (ver [M-002](#m-002)).

<a id="d-003"></a>

### D-003 — Los términos canónicos son "categoría" y "comuna"

- **Estado:** aceptada. **Fecha:** 2026-08-17. **Aprobada por Patricio el:** 2026-08-17.
- **Sustento:** vocabulario ya en uso en `CLAUDE.md` y en la landing.
- **Tensión:** ninguna — es ratificar lo que ya se usa, no una alternativa real.
- **Alternativas descartadas:** "rubro" u "oficio" como nombre del campo — "oficio" es como se explica en
  prosa, pero el campo y el código dicen "categoría", que es más neutro para cubrir también servicios que no
  son un oficio manual clásico (peluquería). "Ciudad" o "región" en vez de "comuna" — Chile no organiza su
  geografía así de fino en la vida diaria, comuna es la unidad real ("vivo en Ñuñoa", no "vivo en la
  Provincia de Santiago").
- **Decisión y consecuencia:** todo código, documento y copy usa "categoría" y "comuna" — nunca "rubro",
  "oficio" como término formal, "servicio" para esto, "ciudad" ni "región".
- **Reapertura:** ninguna prevista.

<a id="d-004"></a>

### D-004 — Categoría y comuna siempre son una referencia al catálogo, nunca texto libre guardado

- **Estado:** aceptada. **Fecha:** 2026-08-17. **Aprobada por Patricio el:** 2026-08-17.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002) — la lista solo
  cumple su función (que registro y búsqueda hablen el mismo idioma) si nadie puede guardar un valor que no
  esté en ella.
- **Tensión:** un campo de texto libre es más rápido de construir que un selector con catálogo, pero
  reabre exactamente el problema que esta misión existe para cerrar — "electricista" vs "instalaciones
  eléctricas" como dos valores distintos que no matchean entre sí.
- **Alternativas descartadas:** texto libre con normalización posterior (limpiar mayúsculas, tildes,
  sinónimos después de guardado) — la inconsistencia ya ocurrió al guardar, limpiarla después es
  reconstruir el problema de C-001 con pasos extra.
- **Decisión y consecuencia:** todo formulario que pida categoría o comuna (registro en misión 04, filtro
  de búsqueda en misión 06) usa el mismo componente de selección — un buscador con autocompletado al estilo
  del selector de comuna de Mercado Libre: la persona escribe, ve solo opciones que existen en el catálogo,
  y no puede enviar el formulario con algo que no eligió de la lista. La forma exacta de ese componente
  (estados de carga, qué pasa si no hay match) se diseña en `experiencia.md`; el componente en sí
  (`ComunaSelect`, `CategoriaSelect`) se construye una sola vez en `ingenieria.md` de esta misión, y 04 y 06
  lo importan — no lo reconstruyen.
- **Reapertura:** ninguna prevista.

## Casos límite

| ID     | Condición concreta                                                      | Comportamiento esperado | Afecta |
| ------ | ------------------------------------------------------------------------- | -------------------------- | ------ |
| CL-001 | Una categoría activa no tiene ningún profesional registrado todavía (ej. Jardinería) | Se sigue mostrando en el selector, no se esconde — misión 06 decide cómo se ve el estado vacío en el buscador | misión 04, misión 06 |
| CL-002 | Una comuna activa no tiene ningún profesional registrado todavía           | Igual que CL-001: la comuna existe y es seleccionable, el estado vacío se resuelve en misión 06 | misión 04, misión 06 |
| CL-004 | Alguien intenta buscar o registrarse en una comuna marcada `activa = false` | La comuna no aparece como opción en el selector — no es un estado vacío, es que Datealo todavía no opera ahí | misión 04, misión 06 |

CL-003 se retiró: era "alguien busca un oficio que no está en el catálogo" con texto libre, y dependía de
una mecánica de búsqueda por texto que no está decidida (ver historial de D-001). El ID no se reutiliza; si
la misión 06 más adelante define texto libre y necesita un caso límite equivalente, nace con un ID nuevo.

## Fuera de alcance

| Capacidad o caso                                              | Estado     | Razón del recorte                                                | Condición para reconsiderar |
| ---------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- | ------------------------------- |
| Subcategorías dentro de un oficio (ej. "Gasfitería - filtraciones") | postergada | Sin volumen no se justifica el filtro extra, agrega fricción al registro | Una categoría-comuna promedia 15+ profesionales |
| Categorías fuera de las 8 (ej. carpintería, gasfitería industrial, cuidado de mascotas) | postergada | Mismo criterio de cold start — sumarlas es barato, pero cada una vacía se ve peor que no tenerla | Se piden seguido en la lista de espera o en los primeros meses (M-001) |
| Panel de administración para activar/desactivar comunas y categorías | postergada | Hoy el volumen de cambios es bajo — se hace directo en la base de datos | El volumen de cambios manuales lo justifique |
| Traducción del catálogo a otro idioma                          | descartada | Datealo es Chile, español chileno es el único idioma del producto | — |

## Señales de éxito

<a id="m-001"></a>

### M-001 — El catálogo de categorías alcanza para lo que la gente pide, sin forzarlas a otra categoría

- **Pregunta:** ¿las 8 categorías cubren lo que la gente realmente busca, o hay un oficio que se pide
  seguido y no está?
- **Señal:** de los registros en la lista de espera y de las conversaciones de reclutamiento de
  profesionales, cuántas veces se menciona un oficio que no es ninguna de las 8.
- **Método y umbral:** revisión manual de Patricio sobre la lista de espera y las conversaciones de
  reclutamiento; sin umbral numérico todavía por falta de volumen — se revisa cualitativamente cada vez que
  aparece un patrón repetido (3+ menciones del mismo oficio fuera de catálogo).
- **Guardrail:** ningún profesional interesado se pierde por no encontrar su oficio en la lista — Patricio
  lo registra a mano mientras el catálogo no lo cubra, no se descarta la conversación.

<a id="m-002"></a>

### M-002 — Gran Santiago y Puerto Varas tienen tracción antes de activar más comunas

- **Pregunta:** ¿ya vale la pena activar comunas nuevas fuera de las que se están trabajando hoy?
- **Señal:** profesionales registrados y verificados en al menos la mitad de las comunas activas, con al
  menos una categoría con más de un profesional en la comuna más poblada de cada zona activa.
- **Método y umbral:** conteo directo en la base de datos una vez exista la tabla de profesionales (misión
  04); sin fecha objetivo todavía. Activar una comuna nueva no requiere esperar esta señal — es solo la
  referencia para decidir cuándo conviene, dado que el campo `activa` no tiene costo de revertir.
- **Guardrail:** activar comunas nuevas no debe diluir el esfuerzo de reclutamiento en las que ya están
  activas — no se suma una comuna a costa de dejar de reclutar en Gran Santiago o Puerto Varas.

## Preguntas

Ninguna abierta — Q-001 y Q-002 quedaron resueltas el 2026-08-17.

| ID    | La duda                                                | Estado             | Respuesta, o quién la resuelve |
| ----- | --------------------------------------------------------- | ------------------- | ----------------------------------- |
| Q-001 | ¿Las 8 categorías de la landing son de verdad las 8 correctas para el catálogo, o falta/sobra alguna? | resuelta 2026-08-17 | Sí, son las 8 correctas — Patricio las confirmó sin cambios en D-001 |
| Q-002 | ¿Hay ya un plan de reclutamiento de profesionales que priorice ciertas comunas?                       | resuelta 2026-08-17 | Sí: Gran Santiago (mercado más grande) y Puerto Varas (donde Patricio vive y puede verificar directo). Esas dos zonas parten activas en [D-002](#d-002) |
