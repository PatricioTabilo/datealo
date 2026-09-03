# Misión: vista de resultados de búsqueda — Producto

**Estado:** vigente — aprobado por Patricio el 2026-09-02

**Última actualización:** 2026-09-02

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: cada resultado de /buscar se ve como una tarjeta completa, no un renglón pelado

**Resultado:** cualquier búsqueda en `/buscar` —tenga 1 resultado o varios— muestra cards con foto de
trabajo (o avatar) y reseñas cuando existen, dentro de una página con ancho máximo que no se estira vacía
en desktop.

**Recorte respecto del ideal:** ninguno de fondo — esta entrega cubre el ideal completo de
[investigación](./investigacion.md#el-ideal-cada-resultado-se-ve-completo-exista-o-no-una-foto-de-trabajo),
salvo lo que el ideal mismo excluye explícitamente.

**Restricciones aceptadas:** no se agrega ningún campo nuevo al modelo de profesional (sin "verificado",
sin favoritos, sin contador de vistas); la card solo expone datos que ya existen (`photoUrls`,
`avatarUrl`, `ratingAverage`, `reviewCount`, `priceFrom`, `comunaNombre`). No se toca el selector de
categoría/comuna ni el resto del header — eso es alcance de la misión 09, en curso en paralelo.

## Funcionalidades

| ID    | Funcionalidad                                                     | Lado     | Sustento     | Éxito |
| ----- | -------------------------------------------------------------------- | -------- | ------------ | ----- |
| F-001 | La card muestra la foto de trabajo (o avatar) y las reseñas del profesional | buscador | C-001, D-001 | M-001 |
| F-002 | La página de resultados tiene un ancho máximo y un grid de alto uniforme | buscador | C-002, C-003, D-002 | M-001 |

<a id="f-001"></a>

### F-001 — La card muestra la foto de trabajo (o avatar) y las reseñas del profesional

Cuando el buscador ve un resultado en `/buscar`,
quiero reconocer al profesional con la misma sustancia que vería en su perfil,
para decidir si contactarlo sin tener que abrirlo primero.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** que el profesional haya completado su
perfil (misión 04) — la foto de trabajo y el rating son opcionales y la card funciona sin ellos, pero
cuantos más profesionales los tengan cargados, más resultados se ven completos.

**Sustento:** [C-001](./investigacion.md#c-001) y [D-001](#d-001). **Éxito:** [M-001](#m-001).

**Reglas:**

- Si el profesional subió al menos una foto de trabajo (`photoUrls`), Datealo la muestra en el slot de
  imagen de la card.
- Si no subió ninguna, Datealo muestra su avatar (`avatarUrl` o iniciales) en ese mismo slot — nunca lo
  deja vacío ni usa una imagen de stock genérica.
- Si el profesional tiene reseñas (`reviewCount > 0`), Datealo muestra el promedio (`ratingAverage`) y la
  cantidad junto al nombre.
- Si todavía no tiene reseñas, Datealo no muestra un rating vacío ni "0.0" — omite esa línea por completo.
- Datealo nunca muestra un badge de "destacado" pagado, un contador de vistas ni un ícono de favoritos —
  no son features de esta entrega.

**Ejemplo verificable:** dado un profesional de Electricidad en Puerto Varas con 2 fotos de trabajo
subidas y 3 reseñas (promedio 4,7), cuando el buscador filtra por esa categoría y comuna, entonces su card
muestra la primera foto, "4,7 · 3 reseñas" junto al nombre, la comuna y el precio desde — sin abrir el
perfil. El formato exacto (coma decimal, separador "·", palabra "reseñas") es el mismo que ya usa el
perfil público (`app/pages/profesionales/[id].vue`) — se especifica en `experiencia.md`.

**No incluye:** ningún control para que el buscador elija qué foto ver (carrusel, swipe) — se muestra
siempre la primera de `photoUrls`; eso es del perfil completo (misión 05), no de la card de resultado.

**Experiencia:** por definir en `experiencia.md`. **Ingeniería:** por definir en `ingenieria.md`.

<a id="f-002"></a>

### F-002 — La página de resultados tiene un ancho máximo y un grid de alto uniforme

Cuando el buscador ve resultados en un monitor ancho,
quiero que la vista ocupe un espacio proporcional a lo que realmente encontró,
para no sentir que Datealo "no tiene nada" cuando en realidad encontró justo lo que buscaba.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** nada — es un cambio de layout, no
depende de cuántos profesionales existan.

**Sustento:** [C-002](./investigacion.md#c-002) y [C-003](./investigacion.md#c-003), [D-002](#d-002).
**Éxito:** [M-001](#m-001).

**Reglas:**

- El contenedor de `/buscar` (filtro y resultados) tiene un ancho máximo en desktop; el espacio sobrante
  se reparte como márgenes, no como vacío dentro del área de resultados.
- Todas las cards de una misma fila del grid comparten el mismo alto, tenga o no foto cada profesional
  (ver [CL-001](#cl-001)).
- Con 1 solo resultado, la card conserva su proporción normal — no se estira para "llenar" el ancho
  disponible (ver [CL-002](#cl-002)).
- En mobile, la vista sigue siendo una sola columna de arriba a abajo — esta funcionalidad no cambia nada
  ahí.

**Ejemplo verificable:** dado que una búsqueda en un monitor de 1920px de ancho devuelve 1 resultado,
cuando se carga `/buscar`, entonces la card aparece dentro de un contenedor centrado con ancho máximo, sin
que el resto de la pantalla quede en blanco de borde a borde.

**No incluye:** cambios al filtro de categoría/comuna en sí (posición, tamaño, comportamiento) — eso es
alcance de la misión 09.

**Experiencia:** por definir en `experiencia.md`. **Ingeniería:** por definir en `ingenieria.md`.

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta                                                         | Comportamiento esperado                                                                                 | Funcionalidades |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| CL-001 | Profesional sin fotos de trabajo y sin reseñas (el caso más común hoy)     | La card cae a avatar + nombre + comuna + precio, sin rating — pero mantiene el mismo alto que las cards con foto/rating de su misma fila | F-001, F-002     |
| CL-002 | 1 solo resultado en un monitor ancho                                       | El ancho máximo del contenedor y el grid centrado evitan que la card quede perdida en una esquina; la card no se distorsiona para ocupar más espacio (ver [UX-003](./experiencia.md#ux-003)) | F-002            |
| CL-003 | Resultado en modo "vecina" (comuna vecina, ver misión 06)                  | Conserva el tratamiento en negrita ya existente para avisar que no es la comuna exacta, ahora dentro de la card enriquecida — sin competir visualmente con la foto o el rating | F-001            |
| CL-004 | Profesional con reseñas pero sin precio publicado                         | La línea de precio se omite; el resto de la card (foto/avatar, nombre, comuna, rating, antigüedad) queda igual — `priceFrom` ya es opcional en F-001 | F-001            |

## Fuera de alcance

| Capacidad o caso                                        | Estado     | Razón del recorte                                                                                          | Condición para reconsiderar |
| ---------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Favoritos o guardar un profesional                          | descartada | El dueño de producto fue explícito: esta misión mejora la vista existente, no agrega funcionalidad nueva    | Si se decide explorar retención vía favoritos, abre su propio discovery |
| Contador de vistas o de contactos                           | descartada | Mismo motivo, y Datealo no instrumenta ese dato hoy                                                          | Igual que arriba |
| Badge de "destacado" pagado                                 | descartada | Choca directo con el guardrail de no-bidding entre profesionales                                            | No se reconsidera salvo cambio explícito de ese guardrail |
| Rediseño del selector de categoría/comuna (el buscador)     | postergada | Es alcance de la misión 09, en curso en paralelo                                                             | Se retoma si la 09 identifica algo que dependa de esta vista |
| Carrusel o editor de fotos dentro de la card de resultado    | descartada | Ninguna otra superficie de Datealo lo tiene todavía; no es una regresión específica de esta funcionalidad    | Si se agrega en el perfil completo, se evalúa acá también |

## Señales de éxito

<a id="m-001"></a>

### M-001 — La card más completa cambia cómo se comporta el buscador, no solo cómo se ve

- **Pregunta:** ¿mostrar foto y reseñas en la card mueve al buscador a hacer clic (abrir perfil o
  WhatsApp), o solo mejora la percepción sin cambiar el comportamiento?
- **Señal:** de los buscadores que abren `/buscar` y ven al menos un resultado, qué proporción hace clic
  en una card, comparando el período antes y después de este cambio.
- **Método y umbral:** revisión manual de los primeros resultados de búsqueda tras el lanzamiento, sin
  umbral numérico todavía — no hay tráfico para un umbral serio en esta etapa.
- **Guardrail:** el tiempo de carga de `/buscar` no debe empeorar por cargar fotos adicionales — se
  mantiene el mismo estándar de lazy loading que ya usa el resto del producto.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — La card de resultado solo expone datos que el profesional ya cargó, sin campos ni features nuevas

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-001](./investigacion.md#c-001).
- **Tensión:** hacer la card más rica y atractiva (como las referencias de Airbnb y de marketplaces de
  servicios) frente a mantener el guardrail de no agregar funcionalidad antes de tener tracción.
- **Alternativas descartadas:** (a) badge "destacado" pagado — descartada, choca directo con el guardrail
  de no-bidding entre profesionales; (b) contador de vistas o contactos — descartada, es una feature
  nueva sin decidir y Datealo no instrumenta ese dato hoy; (c) ícono de favoritos/guardar — descartada,
  mismo motivo, y el dueño de producto fue explícito en que esta misión mejora la vista, no agrega
  funcionalidad.
- **Decisión y consecuencia:** la card enriquecida se construye solo con datos que ya existen en el modelo
  (`photoUrls`, `avatarUrl`, `ratingAverage`, `reviewCount`). Esto acota el trabajo de ingeniería a
  exponer esos campos en `SearchResultProfessional`, sin tocar schema ni agregar tablas.
- **Reapertura:** si más adelante el dueño de producto decide explorar favoritos o algún tipo de
  destacado, es su propia misión de discovery, no una extensión de esta.

<a id="d-002"></a>

### D-002 — Toda card reserva el mismo slot de imagen; sin foto, cae al avatar existente en vez de una card compacta distinta

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-003](./investigacion.md#c-003).
- **Tensión:** la preferencia del dueño de producto por una card compacta cuando no hay foto (sin dejar
  un hueco de imagen vacío) frente a mantener el grid con el mismo alto de card en toda la fila cuando
  conviven profesionales con foto y sin foto.
- **Alternativas descartadas:** (a) card compacta real (sin slot de imagen) cuando falta la foto —
  descartada porque en una fila con cards de distinto alto el grid se ve irregular, exactamente lo que se
  quería evitar; (b) layout tipo masonry/Pinterest que tolera alturas libres — descartada porque en un
  listado donde el orden importa (cercanía/relevancia), las alturas libres dificultan escanearlo en
  orden — le sirve a un feed de descubrimiento, no a un listado de resultados.
- **Decisión y consecuencia:** toda card reserva el mismo slot de imagen con aspect-ratio fijo; sin foto,
  ese slot muestra el avatar que `SearchResultCard.vue` ya usa (`avatarUrl` o iniciales) en vez de dejarlo
  vacío o angosto. El grid mantiene alto uniforme sin depender de que todos los profesionales suban fotos.
- **Reapertura:** si en producción la mayoría de los profesionales termina subiendo fotos de trabajo, se
  reevalúa si vale la pena una card sin slot fijo para los pocos casos sin foto.

## Preguntas

Ninguna abierta — las dos dudas que motivaron esta misión (qué elementos de las referencias traer, y cómo
resolver "compacta sin foto" sin romper el grid) se resolvieron en conversación con el dueño de producto y
quedaron registradas como D-001 y D-002.
