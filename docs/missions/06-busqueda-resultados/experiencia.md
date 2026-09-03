# Misión: búsqueda y resultados — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-08-29

**Última actualización:** 2026-08-29

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: una sola pantalla reactiva, sin pasos ni mapa

El buscador es una sola vista (V-001) con los selectores de categoría y comuna siempre visibles arriba —
nunca un asistente de pasos, nunca un mapa. Apenas los dos campos tienen un valor, Datealo pide los
resultados: si hay profesionales en la comuna exacta, esos se ven primero; si no hay ninguno, la misma
pantalla se completa con los de sus comunas vecinas reales, marcados con su comuna, sin que el buscador
tenga que hacer nada más que mirar hacia abajo. Tocar una card lleva al perfil del profesional (misión 05);
esta vista no tiene ningún paso de contacto propio.

- **Funcionalidades cubiertas:** F-001, F-002.
- **Pendiente bloqueante:** ninguna.

## Vistas

- **V-001 — Resultados de búsqueda** · móvil / desktop · resuelve [F-001](./producto.md#f-001),
  [F-002](./producto.md#f-002) · flujo UXF-001
  - modo **eligiendo** — falta categoría y/o comuna; los selectores están visibles, no hay ninguna lista
    abajo
  - modo **cargando** — categoría y comuna completas, esperando la respuesta del servidor
  - modo **con resultados** — al menos un profesional activo en la comuna exacta
  - modo **comunas vecinas** — la comuna exacta no tiene a nadie de esa categoría; se muestran las comunas
    vecinas reales (F-002)
  - modo **sin resultados** — ni la comuna exacta ni sus vecinas tienen a nadie de esa categoría
    ([CL-001](./producto.md#cl-001), [CL-002](./producto.md#cl-002) de producto.md)

## Mapa de estados

| Desde                                              | Acción                                             | Queda en          | Qué pasa con el trabajo |
| --------------------------------------------------- | --------------------------------------------------- | ------------------- | ----------------------------- |
| eligiendo                                          | completa categoría y comuna (en cualquier orden)   | cargando           | ninguno — recién se arma la búsqueda |
| eligiendo                                          | llega desde el carrusel de categorías de la landing | eligiendo          | la categoría queda pre-elegida, solo falta comuna |
| cargando                                           | el servidor responde con resultados en la comuna exacta | con resultados | ninguno |
| cargando                                           | el servidor no encuentra nada en la comuna exacta pero sí en vecinas | comunas vecinas | ninguno |
| cargando                                           | el servidor no encuentra nada en ningún lado        | sin resultados      | ninguno |
| con resultados / comunas vecinas / sin resultados  | cambia categoría o comuna                           | cargando            | los selectores quedan con el valor nuevo; la lista anterior desaparece |
| con resultados / comunas vecinas                   | toca una card                                       | fuera de V-001, al perfil del profesional | ninguno — al volver con "atrás", V-001 se ve igual que la dejó |

## UXF-001 — Buscar y ver resultados de una categoría en una comuna

**Objetivo:** encontrar rápido a quién contactar, con o sin oferta en la comuna exacta. **Contrato:**
[F-001](./producto.md#f-001), [F-002](./producto.md#f-002).

**Punto de entrada:** dos caminos. (a) toca una categoría del carrusel de la landing
(`LandingCategories.vue`, hoy decorativo) — llega con la categoría ya elegida, solo falta comuna. (b) entra
directo a "Buscar" — llega con los dos campos vacíos. Ninguno de los dos exige sesión ni cuenta.

**Criterio de término:** no es una acción que "se completa" de una vez — el buscador puede ajustar
categoría y comuna varias veces antes de decidirse. Termina cuando toca una card y sigue al perfil, o
cuando se va.

**Cómo sabe el usuario dónde está:** los dos campos de categoría y comuna, siempre visibles arriba de
cualquier lista, muestran exactamente lo que se está buscando en este momento — nunca hay una lista en
pantalla sin sus filtros a la vista al mismo tiempo.

### Divergencia antes de converger

Para resolver el mismo JTBD (encontrar a quién contactar, cerca, hoy) se generaron tres enfoques
genuinamente distintos:

- **Enfoque A — pantalla única reactiva:** los selectores de categoría y comuna quedan arriba, siempre
  visibles y editables; la lista de abajo se actualiza sola apenas ambos tienen un valor. Es el patrón de
  un portal inmobiliario chileno (Yapo.cl, Portalinmobiliario) — tipo de propiedad + comuna en la misma
  barra, sin pasos — que el brief de esta misión ya usa como referencia.
- **Enfoque B — asistente de dos pantallas:** paso 1 elegir categoría en una grilla de tarjetas grandes
  (pantalla completa), paso 2 elegir comuna (otra pantalla completa), paso 3 resultados. Una decisión a la
  vez, más simple de entender la primera vez, pero agrega dos transiciones de pantalla completa a algo que
  hoy se resuelve con dos campos chicos.
- **Enfoque C — mapa como vista principal:** pines por profesional, lista como panel secundario. Ya
  descartado por `producto.md` ("Mapa visual de resultados", Fuera de alcance) — sin coordenadas que
  mostrarle al buscador ni presupuesto de UI para esta entrega, no se desarrolla más acá.

**Elegido: A.** El contexto real de uso de este skill (buscador de pie, apurado, con una mano) pesa contra
el Enfoque B: dos pantallas completas y dos "Siguiente" para llegar al mismo lugar que A resuelve tocando
dos campos que ya están a la vista. Ninguna conclusión de investigación pide una ceremonia de pasos, y C ya
quedó fuera del alcance de producto antes de llegar a esta misión. A además es el único que cumple "cómo
sabe el usuario dónde está" de este flujo sin depender de memoria: en B, el buscador nunca ve los dos
filtros juntos en la misma pantalla, así que no hay ningún punto del flujo en el que confirme de un
vistazo qué está pidiendo.

### Jerarquía de información

Con foto/iniciales, nombre, categoría, comuna, precio y antigüedad compitiendo por la misma card, el orden
es:

1. **Foto o iniciales** — primera señal, igual que en el perfil (misión 05); nunca un ícono genérico.
2. **Nombre** — quién es.
3. **Comuna** — confirma dónde trabaja. La categoría no se repite acá: los selectores de arriba quedan
   `position: sticky` durante todo el scroll de la lista (ver "Decisiones que no deben quedar implícitas"),
   así que ya está a la vista todo el tiempo y repetirla en cada card sería la misma información dos veces
   sin agregar nada. En modo comunas vecinas, esta línea es la que avisa que no es la comuna exacta — va en
   negrita en ese modo, para que el peso visual, no solo el texto, marque la diferencia (ver
   "Decisiones que no deben quedar implícitas").
4. **Precio** ("Desde $X", si existe) — filtro rápido de presupuesto.
5. **"En Datealo desde..."** — mismo dato que el perfil, la única señal de actividad que no se inventa.

Arriba de la lista, un texto corto y siempre verdadero indica cuántos resultados hay ("3 resultados", "1
resultado") — nunca un espacio vacío sin explicar qué se está viendo, ni un número fabricado.

Nunca aparece un número de distancia, un rating ni un contador de reseñas — ninguno de esos datos existe
hoy ([C-002](./investigacion.md#c-002) de investigación, [D-001](./producto.md#d-001) de producto).
**Superado por la misión 10** ([F-001](../10-vista-resultados-busqueda/producto.md#f-001)): una vez que
existen reseñas (misión 07), la card sí muestra rating y cantidad — la distancia en km sigue sin
aparecer, eso no cambió.

### Salidas

| Salida                                    | Cómo se ejecuta                  | Qué queda del trabajo |
| -------------------------------------------- | ----------------------------------- | -------------------------- |
| Encuentra a alguien y sigue al perfil        | toca una card                       | los filtros quedan guardados en V-001; si vuelve con "atrás", la ve igual |
| Cambia de búsqueda                           | edita categoría o comuna            | la lista anterior se reemplaza, sin transición de pantalla |
| Se va sin encontrar nada                     | cierra la pestaña o navega a otra parte | nada que perder — no hay ningún dato sin guardar |

### Secuencia principal

| Paso | Acción                                                          | Respuesta del sistema                                                                                       | Información visible |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| 1    | Llega a V-001 (desde la landing con categoría pre-elegida, o directo) | Ve los dos selectores arriba; si falta alguno, ve el modo eligiendo                                                 | "Elige tu comuna para ver profesionales de Gasfitería cerca de ti" (si ya eligió categoría) o "Elige una categoría y tu comuna para ver profesionales disponibles" (si ninguna) |
| 2    | Elige o confirma categoría y comuna (`CategoriaSelect`, `ComunaSelect`) | Apenas ambos tienen valor, Datealo pide los resultados; si tarda más de 300ms, ve un skeleton con la forma de 4 cards | Ninguna dato real todavía, solo la forma |
| 3    | El servidor responde con resultados en la comuna exacta            | Ve un texto corto con el total ("3 resultados") y la lista: cada card con nombre, comuna, "Desde $X" si existe, "En Datealo desde..."                  | Nombre, foto o iniciales, comuna, precio si existe, antigüedad |
| 3b   | (alternativa) No hay nada en la comuna exacta, sí en comunas vecinas | Ve un aviso corto arriba de la lista y debajo la sección de comunas vecinas, cada card con su comuna real visible   | Mismo contenido de card; la comuna de cada una nunca es la que se pidió |
| 3c   | (alternativa) No hay nada ni en la comuna ni en sus vecinas         | Ve el estado vacío: título, texto y los mismos selectores arriba, listos para cambiar                               | Ningún dato — solo el mensaje y el camino de vuelta a los selectores |
| 4    | Toca una card                                                       | Navega al perfil del profesional (misión 05)                                                                        | — |

### Variantes y recuperación

| Condición                                                            | Qué cambia                                                                       | Cómo se entiende                                                     | Cómo se recupera |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------- |
| Comuna exacta sin resultados, vecinas sí ([F-002](./producto.md#f-002))    | Aviso corto + sección de comunas vecinas, cada card marcada con su comuna real           | El texto dice explícitamente que no son de la comuna pedida                  | Cambia de comuna, o contacta a uno de comuna vecina |
| Ni la comuna ni sus vecinas tienen nada, pero la categoría sí existe en otro lado activo ([CL-001](./producto.md#cl-001)) | Estado vacío enmarcado por zona: "cerca de \<comuna\>"                                  | Título que sugiere que el problema es geográfico — cambiar de comuna sí puede ayudar | Cambia comuna, ya visible arriba |
| La categoría no tiene ningún profesional en ninguna comuna activa del país ([CL-002](./producto.md#cl-002)) | Estado vacío sin enmarcar por zona — nunca dice "cerca de \<comuna\>", porque cambiar de comuna acá no ayudaría | Título que deja claro que el problema es de categoría, no de ubicación        | Cambia categoría, ya visible arriba |
| Un solo profesional en toda la comuna y categoría ([CL-003](./producto.md#cl-003)) | La lista muestra una sola card, sin ningún elemento fabricado tipo "más opciones cerca" | No hay ninguna insinuación de que falte algo                                 | Ninguna — es el resultado real |
| Conexión lenta (>300ms)                                                    | Skeleton con forma de 4 cards, mismo patrón que el perfil (misión 05)                    | Igual al resto de Datealo                                                    | Si pasa de 10s, mensaje "Esto está tardando más de lo normal" + "Reintentar" |
| Cambia categoría o comuna mientras una lista ya está visible               | La lista anterior desaparece y vuelve el modo cargando, sin transición de pantalla       | Los dos campos de arriba siempre reflejan lo que se está pidiendo ahora mismo | No aplica — no hay error que recuperar |

### Decisiones que no deben quedar implícitas

- Ninguna card muestra un número de distancia en km ni un ícono de mapa — la única señal de cercanía es en
  qué sección aparece la card ("en tu comuna" o la sección de comunas vecinas), ver
  [D-002](./producto.md#d-002).
- El orden dentro de cada sección nunca se explica en pantalla — no hay badge de "recomendado" ni "perfil
  completo": el criterio es interno ([D-001](./producto.md#d-001)).
- Los selectores de categoría y comuna quedan `position: sticky` en la parte superior durante todo el
  scroll de la lista — nunca se pierden de vista. Por eso la card no repite la categoría (ya visible
  arriba); si no fueran sticky, esta decisión se revisa, porque ahí sí haría falta repetirla.
- En modo comunas vecinas, el nombre de la comuna en cada card va en negrita (mismo tamaño, más peso) en
  vez del gris muted que usa en modo "con resultados" — el guardrail de
  [M-002 de producto.md](./producto.md#m-002) exige que el fallback "nunca se presente como si fuera un
  resultado real de la comuna exacta", y un texto con el mismo peso visual en los dos modos no cumple eso
  con suficiente fuerza por sí solo.
- Cambiar categoría o comuna no navega a otra URL ni recarga la pantalla completa — solo la lista se
  reemplaza; los selectores de arriba quedan fijos en su lugar.
- El botón "Buscar profesionales" que ya existe en el modo "no encontrado" del perfil (misión 05) navega
  exactamente a esta vista, en modo eligiendo.
- Ningún ícono de esta vista es un emoji — mismo criterio que el resto del producto (`@lucide/vue`,
  `CLAUDE.md`); el mockup los representa como SVG.
- En desktop, los modos eligiendo, comunas vecinas y sin resultados reusan el mismo layout centrado que en
  móvil, solo más ancho — no cambian de composición, así que no llevan su propio frame de mockup; el modo
  con resultados sí, porque pasa de lista vertical a grilla.

## Estados por superficie

| Estado                                       | Qué se muestra (texto e información real)                                                                          | Acción disponible |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| eligiendo, sin categoría ni comuna              | "Elige una categoría y tu comuna para ver profesionales disponibles." + los dos selectores vacíos                        | Elegir categoría o comuna |
| eligiendo, con categoría (llegó de la landing)  | "Elige tu comuna para ver profesionales de Gasfitería cerca de ti." + selector de comuna con foco                        | Elegir comuna |
| cargando                                        | 4 skeletons con forma de card                                                                                             | Ninguna |
| con resultados                                  | "3 resultados" + cards: "Marcelo Rojas", "Ñuñoa", "Desde $15.000", "En Datealo desde julio de 2026" (y más cards igual, ordenadas por completitud — la más completa primero) | Tocar una card |
| con resultados, un solo profesional (CL-003)    | "1 resultado" + una sola card, mismo formato — nunca un elemento fabricado tipo "más opciones cerca"                      | Tocar la card |
| comunas vecinas                                 | "Todavía no hay profesionales de Gasfitería en Puente Alto" + sección "Cerca de Puente Alto" con cards marcadas, en negrita, "La Florida", "San Bernardo" | Tocar una card, o cambiar comuna |
| sin resultados, comuna sin oferta (CL-001)      | "Todavía no hay profesionales de Gasfitería cerca de Puente Alto." + "Prueba con otra comuna."                            | Cambiar comuna (selector arriba) |
| sin resultados, categoría sin oferta (CL-002)   | "Todavía no hay profesionales de Jardinería en Datealo." + "Prueba con otra categoría."                                   | Cambiar categoría (selector arriba) |
| tardando (>10s)                                 | "Esto está tardando más de lo normal."                                                                                    | "Reintentar" |

## Mockups

| Mockup               | Cubre           | Estado       | Ruta |
| ---------------------- | ------------------ | -------------- | ------ |
| resultados-busqueda   | UXF-001 (V-001)   | validado — 9 frames, evaluación heurística aplicada (contradicciones documento↔mockup corregidas, emoji reemplazados, overflow protegido) | `./design-mockups/resultados-busqueda.html` |

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                            | Estado    |
| ------------- | ------- | -------------------------------------------------------------------------------- | --------- |
| F-001         | UXF-001 | eligiendo, cargando, con resultados, un solo resultado (CL-003), tardando        | en revisión |
| F-002         | UXF-001 | comunas vecinas, sin resultados en comuna (CL-001), sin resultados en categoría (CL-002) | en revisión |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — Pantalla única reactiva, sin asistente de pasos ni mapa

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** contexto real de uso de `discovery-ux` (buscador apurado, con una mano); "Mapa visual de
  resultados" y "Búsqueda por texto libre de categoría" ya en Fuera de alcance de `producto.md`.
- **Alternativas descartadas:** ver "Divergencia antes de converger" de UXF-001 — asistente de dos
  pantallas (agrega transiciones completas sin necesidad) y mapa como vista principal (fuera de alcance de
  producto desde antes de esta misión).
- **Decisión y consecuencia:** layout definido en la Secuencia principal de UXF-001 — selectores fijos
  arriba, lista reactiva abajo, sin pantallas intermedias entre elegir y ver resultados.
- **Impacto en producto:** ninguno.

<a id="ux-002"></a>

### UX-002 — Comuna exacta y comunas vecinas van en la misma lista con un aviso separador, nunca en pestañas distintas

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** [C-001](./investigacion.md#c-001) de investigación (pocos o cero resultados es el caso
  típico, no la excepción).
- **Alternativas descartadas:** pestañas "En tu comuna" / "Cerca" — separan con claridad las dos fuentes,
  pero exigen un toque extra para ver la alternativa; con el volumen esperado, la pestaña "En tu comuna" va
  a estar vacía la mayoría de las veces (C-001), así que obligar a cambiar de pestaña para ver lo único que
  sí existe es fricción sin ningún beneficio.
- **Decisión y consecuencia:** una sola lista continua. Si hay resultados en la comuna exacta, se ven
  directo, sin ningún aviso adicional. Si no los hay, un aviso corto ("Todavía no hay profesionales de
  Gasfitería en Puente Alto") antecede a la sección de comunas vecinas — nunca aparecen mezcladas sin ese
  aviso.
- **Impacto en producto:** ninguno.

## Preguntas

Ninguna bloquea UXF-001 tal como queda definido acá.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de experiencia |
