# Misión 03: taxonomía de categorías y comunas — Producto

**Estado:** en revisión

**Última actualización:** 2026-08-17

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: una lista cerrada de oficios y una lista cerrada de comunas, para que registro y
búsqueda hablen el mismo idioma

**Resultado:** cuando un profesional se registre (misión 04) va a elegir su oficio y su comuna de dos
listas fijas, no escribirlas a mano. Cuando alguien busque (misión 06), esas mismas dos listas son las que
va a poder filtrar. Ningún desarrollador de esas dos misiones inventa su propia versión.

**Recorte respecto del ideal:** el ideal (ver [investigacion.md](./investigacion.md)) es cualquier oficio
en cualquiera de las 346 comunas de Chile. Acá se recorta a 8 oficios y a las 32 comunas del Gran Santiago
— sigue siendo suficiente porque es donde la landing ya asume que va a estar la oferta inicial, y una lista
más ancha con oferta cero solo agrega categorías y comunas vacías.

**Restricciones aceptadas:** solo Gran Santiago al lanzamiento (nada de regiones ni comunas rurales de la
RM todavía), 8 oficios fijos (nada de subcategorías dentro de un oficio), español chileno como único
idioma.

## Sin funcionalidades propias

Esta misión no construye ninguna pantalla ni endpoint que un profesional o un buscador use directo — el
selector de categoría al registrarse es misión 04, el filtro de comuna en el buscador es misión 06. Lo que
esta misión entrega son las dos listas cerradas (categorías y comunas) de las que esas dos misiones
dependen. Por eso no hay una sección de Funcionalidades en formato JTBD: el resultado observable para un
profesional o un buscador va a existir recién cuando 04 y 06 se construyan sobre estas decisiones.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — Las 8 categorías ya usadas en la landing son el catálogo oficial del lanzamiento

- **Estado:** propuesta. **Fecha:** 2026-08-17. **Fecha límite:** 2026-08-24.
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

  Agregar una categoría nueva después es barato (una fila más); sacar una que ya tiene profesionales
  registrados no — por eso el catálogo parte corto a propósito.
- **Reapertura:** cuando una categoría fuera del catálogo se pida seguido en el formulario de espera o en
  los primeros meses de operación (ver [M-001](#m-001)).

<a id="d-002"></a>

### D-002 — El catálogo de comunas cubre las 32 comunas del Gran Santiago desde el día uno; el foco de
reclutamiento de profesionales es una decisión de go-to-market aparte, no un recorte de la lista

- **Estado:** propuesta. **Fecha:** 2026-08-17. **Fecha límite:** 2026-08-24.
- **Sustento:** [C-002](./investigacion.md#c-002), [C-003](./investigacion.md#c-003).
- **Tensión:** cubrir toda la Región Metropolitana (52 comunas) sigue el ideal de cobertura total, pero con
  oferta inicial en decenas de profesionales la mayoría de comunas van a estar vacías. Cubrir solo un
  puñado (5-10) evita comunas vacías, pero exige elegir cuáles de antemano sin tener todavía dato propio de
  dónde va a estar la demanda o los primeros profesionales reclutados — sería una apuesta sin sustento.
- **Alternativas descartadas:** las 52 comunas de la RM completa — vacía casi todo con la oferta inicial
  (C-003). Elegir a mano un subconjunto chico (ej. 10 comunas de mayor ingreso) — no hay evidencia propia
  de Datealo que sustente cuáles 10, y excluir una comuna del modelo de datos es más caro de revertir que
  restringir dónde se hace difusión.
- **Decisión y consecuencia:** la tabla de comunas nace con las 32 de la Provincia de Santiago (Gran
  Santiago urbano — la lista completa está en [E-006](./investigacion.md#e-006) de investigación). Ninguna
  se excluye estructuralmente. Qué comunas se trabajan primero para reclutar profesionales (dónde se hace
  difusión, dónde se prioriza el primer lote de verificaciones) es una decisión operativa de Patricio, fuera
  de este documento — así una comuna sin profesionales todavía no es un bug del catálogo, es el estado
  esperado de un marketplace recién lanzado.
- **Reapertura:** cuando haya tracción validada en Gran Santiago (ver [M-002](#m-002)), se evalúa sumar
  comunas fuera de la Provincia de Santiago o una segunda región.

<a id="d-003"></a>

### D-003 — Los términos canónicos son "categoría" y "comuna"

- **Estado:** propuesta. **Fecha:** 2026-08-17. **Fecha límite:** 2026-08-24.
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

## Casos límite

| ID     | Condición concreta                                                      | Comportamiento esperado | Afecta |
| ------ | ------------------------------------------------------------------------- | -------------------------- | ------ |
| CL-001 | Una categoría del catálogo no tiene ningún profesional registrado todavía (ej. Jardinería) | Se sigue mostrando en el catálogo, no se esconde — misión 06 decide cómo se ve en el buscador | misión 04, misión 06 |
| CL-002 | Una comuna del catálogo no tiene ningún profesional registrado todavía     | Igual que CL-001: la comuna existe en la lista, el estado vacío se resuelve en misión 06 | misión 04, misión 06 |

## Fuera de alcance

| Capacidad o caso                                              | Estado     | Razón del recorte                                                | Condición para reconsiderar |
| ---------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- | ------------------------------- |
| Subcategorías dentro de un oficio (ej. "Gasfitería - filtraciones") | postergada | Sin volumen no se justifica el filtro extra, agrega fricción al registro | Una categoría-comuna promedia 15+ profesionales |
| Comunas fuera de la Provincia de Santiago (resto de la RM o de Chile) | postergada | Cold start: cobertura sin oferta real es solo un catálogo vacío | Tracción validada en Gran Santiago (M-002) |
| Categorías fuera de las 8 (ej. carpintería, gasfitería industrial, cuidado de mascotas) | postergada | Mismo criterio de cold start que las comunas | Se piden seguido en la lista de espera o en los primeros meses (M-001) |
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

### M-002 — Gran Santiago tiene tracción antes de ampliar cobertura

- **Pregunta:** ¿ya vale la pena cubrir más comunas o regiones?
- **Señal:** profesionales registrados y verificados en al menos la mitad de las 32 comunas del Gran
  Santiago, con al menos una categoría con más de un profesional en la comuna más poblada.
- **Método y umbral:** conteo directo en la base de datos una vez exista la tabla de profesionales (misión
  04); sin fecha objetivo todavía.
- **Guardrail:** ampliar cobertura no debe diluir la densidad de Gran Santiago — no se suma una comuna
  nueva a costa de dejar de reclutar en las que ya están activas.

## Preguntas

Nada bloquea todavía — D-001 y D-002 están redactadas con recomendación explícita, a la espera de tu
aprobación (fecha límite 2026-08-24 en ambas).

| ID    | La duda                                                | Estado  | Respuesta, o quién la resuelve |
| ----- | --------------------------------------------------------- | ------- | ----------------------------------- |
| Q-001 | ¿Las 8 categorías de la landing son de verdad las 8 correctas para el catálogo, o falta/sobra alguna? | abierta | Patricio confirma o ajusta en la revisión de D-001, antes del 2026-08-24 |
| Q-002 | ¿Hay ya un plan de reclutamiento de profesionales que priorice ciertas comunas del Gran Santiago, que debería quedar registrado acá? | abierta | Patricio responde si existe; si no, D-002 queda como está (las 32 sin prioridad explícita) |

<a id="q-001"></a>

### Q-001 — ¿Las 8 categorías de la landing son las correctas para el catálogo real?

- **La duda, con un ejemplo:** la landing se armó para verse bien en un carrusel, no como catálogo — por
  ejemplo, no incluye "carpintería" ni "cuidado de mascotas", que también son oficios comunes a domicilio en
  Chile. ¿Se quedan fuera a propósito o es solo que no entraron en el carrusel?
- **Afecta a:** [D-001](#d-001).
- **Cómo se resolverá:** Patricio revisa la tabla de D-001 y confirma, agrega o saca categorías.
- **¿Bloquea algo?:** bloquea que D-001 pase de "propuesta" a "aceptada" — mientras tanto misión 04 y 06
  no deberían empezar a construir el selector de categoría.

<a id="q-002"></a>

### Q-002 — ¿Existe ya un orden de prioridad de comunas para reclutar profesionales?

- **La duda, con un ejemplo:** si Patricio ya sabe que va a partir reclutando en Providencia y Ñuñoa antes
  que en Puente Alto, esa prioridad debería quedar escrita acá aunque el catálogo de datos incluya las 32
  comunas por igual.
- **Afecta a:** [D-002](#d-002).
- **Cómo se resolverá:** Patricio responde directo; si no hay prioridad todavía, no bloquea nada.
- **¿Bloquea algo?:** no bloquea D-002 (la lista de 32 comunas es independiente de la prioridad de
  reclutamiento), pero sí conviene saberlo antes de la misión 04.
