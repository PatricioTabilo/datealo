# Misión: múltiples categorías por profesional — Producto

**Estado:** vigente — aprobado por Patricio Tabilo el 2026-09-06. [Q-001](#q-001) quedó resuelta por
`experiencia.md`.

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: un profesional declara más de una categoría, cada una con su propio precio y descripción, y aparece en los resultados de todas

**Resultado:** un profesional puede agregar categorías adicionales a su perfil (ej. Feña agrega
"Gasfitería" además de "Electricidad"), cada una con su propio precio orientativo y descripción, y
aparece en los resultados de búsqueda de cualquiera de las categorías que declaró, con el precio y la
descripción correctos para esa categoría.

**Recorte respecto del ideal:** el ideal completo (ver [investigacion.md](./investigacion.md)) no fija
todavía si declarar una segunda categoría es parte del registro inicial o solo de editar el perfil ya
creado — resuelto en `experiencia.md` ([UX-001](./experiencia.md#ux-001), ver [Q-001](#q-001)): solo
editando el perfil, sin tocar el registro. Buscar por varias categorías a la vez en una sola búsqueda
queda fuera: el buscador sigue siendo de una categoría por vez.

**Restricciones aceptadas:** sin tope numérico de categorías por profesional ([D-001](#d-001)); descripción
por categoría ([D-002](#d-002)) y precio orientativo también por categoría, aunque sin benchmark que lo
confirme ([D-003](#d-003)); sin verificación de habilidad por categoría — se apoya en la misma confianza
(reseñas, contacto directo) que ya existe hoy para una sola categoría, no se inventa un paso nuevo de
certificación.

## Funcionalidades

| ID    | Funcionalidad                                            | Lado                     | Sustento           | Éxito |
| ----- | --------------------------------------------------------- | ------------------------- | ------------------- | ----- |
| F-001 | Declarar categorías adicionales en el perfil               | profesional                | C-001, D-001, D-002, D-003 | M-001 |
| F-002 | Aparecer en los resultados de cualquiera de sus categorías | buscador (consume), profesional (habilita) | C-001, C-002        | M-001 |
| F-003 | Ver todas las categorías del profesional desde su perfil   | buscador                   | C-001                | M-001 |

<a id="f-001"></a>

### F-001 — Declarar categorías adicionales en el perfil

Cuando Feña ya tiene su perfil creado con una sola categoría (Electricidad) y quiere que también lo
encuentren por Gasfitería,
quiero agregar Gasfitería como otra categoría de su perfil, con su propio precio orientativo y
descripción,
para aparecer en las búsquedas de ambas categorías sin crear un perfil nuevo.

**Lado del marketplace:** profesional. **Qué necesita del otro lado:** nada para que la funcionalidad
exista — Feña puede declarar una segunda categoría aunque hoy no haya nadie buscando gasfitería en
Ñuñoa. Pero el valor real de hacerlo (que le llegue un contacto nuevo) depende de que exista demanda de
búsqueda en esa categoría-comuna; sin eso, declarar es trabajo extra sin retorno visible a corto plazo
(cold start del lado buscador).

**Sustento:** [C-001](./investigacion.md#c-001) y [D-001](#d-001), [D-002](#d-002), [D-003](#d-003).
**Éxito:** [M-001](#m-001).

**Reglas:**

- Si el profesional agrega una categoría que no tenía, Datealo le pide precio orientativo y descripción
  para esa categoría específica (ambos opcionales, igual que hoy permite un perfil sin descripción).
- Si el profesional quita una categoría que tenía, Datealo deja de mostrarlo en los resultados de esa
  categoría de inmediato.
- Datealo nunca deja a un profesional sin ninguna categoría activa — la interfaz no permite quitar la
  última que le queda.

**Ejemplo verificable:** dado que Feña tiene declarada Electricidad con precio $20.000, cuando agrega
Gasfitería con precio $18.000, entonces su perfil público muestra ambas categorías, cada una con su
propio precio.

**No incluye:** verificar que el profesional realmente sepa hacer el oficio que declara — es un problema
de confianza aparte, no algo que esta funcionalidad deba resolver.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

<a id="f-002"></a>

### F-002 — Aparecer en los resultados de cualquiera de sus categorías

Cuando Constanza busca "gasfiter" en Ñuñoa,
quiero que el buscador filtre por categoría igual que hoy,
para ver a Feña en esa lista aunque su categoría declarada primero haya sido electricidad.

**Lado del marketplace:** buscador consume el resultado; profesional lo habilita al declarar. **Qué
necesita del otro lado:** que existan profesionales con 2+ categorías declaradas en esa comuna — sin eso
esta funcionalidad no cambia nada observable para quien busca.

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002). **Éxito:**
[M-001](#m-001).

**Reglas:**

- Si un profesional declaró 2+ categorías, aparece en los resultados de cada una por separado, como si
  tuviera un perfil dedicado a esa categoría.
- Si dos categorías del mismo profesional tienen precios distintos, la card de resultado muestra el
  precio de la categoría por la que se está buscando, nunca el de otra.
- Datealo nunca muestra al mismo profesional dos veces dentro de los resultados de una sola búsqueda.

**Ejemplo verificable:** dado que Feña declaró Electricidad ($20.000) y Gasfitería ($18.000), cuando
alguien busca "gasfiter" en Ñuñoa, entonces Feña aparece en esa lista con el precio $18.000, no $20.000.

**No incluye:** buscar por más de una categoría a la vez (ej. `/buscar?categoria=electricidad,gasfiteria`)
— el buscador sigue siendo de una categoría por búsqueda.

<a id="f-003"></a>

### F-003 — Ver todas las categorías del profesional desde su perfil

Cuando Constanza entra al perfil completo de Feña desde un resultado de "Gasfitería",
quiero ver que también hace Electricidad,
para poder pedirle los dos trabajos sin tener que buscar de nuevo.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** que el profesional tenga más de una
categoría declarada — con una sola, el perfil se ve igual que hoy.

**Sustento:** [C-001](./investigacion.md#c-001). **Éxito:** [M-001](#m-001).

**Reglas:**

- El perfil público lista todas las categorías activas que el profesional declaró, cada una con su
  precio y descripción propios.
- Si el profesional declaró solo una categoría, el perfil se ve exactamente igual que hoy — sin lista
  extra ni espacio vacío.
- Datealo nunca mezcla el precio o la descripción de una categoría con la de otra dentro del mismo
  perfil.

**Ejemplo verificable:** dado que Feña declaró Electricidad y Gasfitería, cuando alguien abre su perfil
completo, entonces ve dos bloques de categoría, cada uno con su propio precio y descripción.

**No incluye:** ordenar las categorías por relevancia a la búsqueda que trajo a la persona — el orden de
presentación queda para `experiencia.md`. Tampoco incluye dividir las reseñas por categoría: el rating y
las reseñas que ve Constanza son las del profesional completo, iguales sin importar por cuál categoría
haya llegado (ver "Fuera de alcance").

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta                                                | Comportamiento esperado                                                                 | Funcionalidades      |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| CL-001 | Profesional con una sola categoría (la mayoría absoluta hoy), visto desde resultados de búsqueda o perfil público | Datealo se comporta exactamente igual que antes de esta misión, sin ningún cambio visible — la edición de su propio perfil sí gana la opción nueva de agregar otra categoría, aunque no la use | F-002, F-003 (F-001 gana la opción nueva de agregar, pero editar la categoría que ya tenía no cambia) |
| CL-002 | Profesional intenta quitar su última categoría activa                | Datealo no permite guardar — debe quedar al menos una categoría                          | F-001                  |
| CL-003 | Dos categorías del mismo profesional con el mismo precio             | Se muestran igual en cada bloque, sin necesidad de indicar que "coinciden"                | F-003                  |
| CL-004 | Profesional con muchas categorías declaradas (5 o más)                | La card de resultado de una búsqueda no cambia (sigue mostrando solo la categoría buscada); la legibilidad del perfil completo con muchas categorías se resuelve en `experiencia.md` | F-003 |
| CL-005 | Profesional que ya existía antes de esta funcionalidad, con `priceFrom`/`description` en las columnas actuales de `professionals` | Datealo migra esos valores como el precio y la descripción de la única categoría que ya tenía declarada — no le pide volver a ingresarlos | F-001 |

## Fuera de alcance

| Capacidad o caso                                                      | Estado     | Razón del recorte                                                                                                          | Condición para reconsiderar                                  |
| ------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Buscar por más de una categoría a la vez en una sola búsqueda            | postergada | El buscador de una categoría a la vez ya funciona y no hay evidencia de que "buscar electricidad y gasfitería juntos" sea un patrón real | Evidencia de búsquedas combinadas repetidas una vez que haya uso   |
| Verificación de habilidad por categoría (auto-certificación estilo TaskRabbit) | postergada | Es un problema de confianza/verificación aparte, no de cobertura de categorías — no se inventa acá para justificar nada     | Decisión explícita de abrir una misión de verificación            |
| Tope numérico de categorías por profesional                              | descartada | [D-001](#d-001) decide sin límite; la legibilidad de card/perfil se resuelve con diseño visual, no con una regla de negocio | Evidencia de spam de categorías una vez en producción             |
| Dividir las reseñas por categoría                                        | postergada | `reviews` no tiene columna de categoría — es del profesional completo, no de una categoría suya. Separarlas exigiría agregar esa columna y decidir a qué categoría asignar cada reseña que ya existe (todas nacieron cuando el profesional tenía una sola categoría) | Evidencia de que una reseña de una categoría se lea como engañosa al mostrarse en otra (ej. una reseña de corte de pelo mostrada en un perfil que además hace gasfitería) |

## Señales de éxito

<a id="m-001"></a>

### M-001 — Declarar una segunda categoría le trae contactos nuevos al profesional, no solo trabajo extra

- **Pregunta:** ¿declarar una segunda categoría realmente le trae contactos al profesional, o nadie la
  usa para contactarlo?
- **Señal:** de los contactos totales que reciben los profesionales con 2+ categorías declaradas, la
  proporción que llega por una categoría que no es la primera que declararon.
- **Método y umbral:** revisión manual (sin volumen para instrumentación estadística todavía) cada dos
  semanas durante el primer mes desde que la funcionalidad esté disponible, sobre los profesionales
  multi-categoría activos. Sin umbral numérico fijo todavía — se define una vez que haya al menos 10
  profesionales multi-categoría con contactos registrados.
- **Guardrail:** la tasa de contacto de la categoría principal (la primera que declaró cada profesional)
  no debe bajar. Si declarar una segunda categoría le resta contactos a la primera en vez de sumar
  contactos nuevos, la funcionalidad no está cumpliendo su propósito.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — No hay tope numérico a la cantidad de categorías que un profesional puede declarar

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** [C-002](./investigacion.md#c-002).
- **Tensión:** legibilidad del perfil y la card de resultados frente a cobertura real de oferta — más
  categorías declaradas es más oferta visible, pero un perfil con demasiadas categorías puede leerse como
  spam.
- **Alternativas descartadas:** tope de 2 categorías (alcanza para el caso más común — electricidad +
  gasfitería — pero corta el patrón real cuando aparece un tercer oficio relacionado, ej. quien además
  hace mantención general); tope de 3 categorías (no resuelve el problema real, que es legibilidad visual
  — ese problema se resuelve truncando la presentación en `experiencia.md`, no prohibiendo declarar una
  cuarta categoría en el dato).
- **Decisión y consecuencia:** el modelo de datos no impone límite; la legibilidad de card y perfil se
  resuelve con diseño visual (mostrar un máximo visible con "+N más" si hace falta), decisión que le
  corresponde a `experiencia.md`, no a esta.
- **Reapertura:** si en producción aparecen perfiles usando categorías irrelevantes solo para aparecer en
  más búsquedas, reconsiderar un tope o algo de fricción para agregar categorías adicionales.

<a id="d-002"></a>

### D-002 — La descripción pasa a ser por categoría, no un valor único del profesional

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** [C-003](./investigacion.md#c-003).
- **Tensión:** fidelidad al caso real (la experiencia de Feña en gasfitería no es la misma que en
  electricidad) frente al costo de rediseñar el modelo de datos y el formulario de perfil — hoy
  `description` es una columna única de `professionals`, y `perfil.vue` la edita como un solo campo.
- **Alternativas descartadas:** mantenerla única por profesional (más simple de construir, pero un
  profesional no puede describir por separado su experiencia en cada oficio — termina con un texto
  genérico que no dice nada específico de ninguna de sus categorías).
- **Decisión y consecuencia:** la futura relación profesional-categoría lleva su propia `description`, no
  solo el vínculo — esto es lo que `ingenieria.md` tiene que modelar. `perfil.vue` pasa de editar una
  descripción global a editar una por categoría declarada.
- **Reapertura:** si en la práctica casi todos los profesionales dejan la misma descripción en todas sus
  categorías, evaluar volver a un valor único con anulación opcional por categoría.

<a id="d-003"></a>

### D-003 — El precio orientativo también pasa a ser por categoría, aunque ningún benchmark lo confirma

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** ninguno directo en `investigacion.md` — [E-003](./investigacion.md#e-003) confirma que
  TaskRabbit separa la *descripción* por categoría, pero no dice nada sobre el precio. Esta decisión es
  una inferencia del caso real ya registrado en [C-001](./investigacion.md#c-001) (Feña cobra distinto
  según el oficio), no una lectura de evidencia — se marca así para no leerse como más sólida de lo que
  es.
- **Tensión:** la misma fidelidad al caso real (un electricista y un gasfiter no cobran lo mismo por hora)
  frente al mismo costo de rediseño que D-002, pero acá sin el respaldo de un benchmark que lo confirme.
- **Alternativas descartadas:** mantener el precio único mientras solo la descripción varía por categoría
  (opción mixta, más barata de construir y más alineada con la evidencia disponible) — descartada porque
  un precio único que promedia gasfitería y electricidad no representa bien ninguna de las dos, y separar
  precio y descripción en dos patrones distintos (uno por categoría, otro global) es más confuso de
  explicar que tratarlos igual.
- **Decisión y consecuencia:** la relación profesional-categoría lleva también su propio `priceFrom`. Si
  en la práctica esto resulta ser una sobre-construcción (ver Reapertura), el costo de revertir es menor
  que el de dejarlo fuera y tener que agregarlo después sobre una tabla ya en uso.
- **Reapertura:** si al tener profesionales multi-categoría reales, la mayoría deja el mismo precio en
  todas sus categorías, esto pasa a confirmar que un precio único hubiera bastado — volver a esa opción.

## Preguntas

Ninguna pregunta bloquea el gate — Q-001 quedó resuelta por `experiencia.md`.

| ID    | La duda                                                                 | Estado  | Respuesta, o quién la resuelve                                                                    |
| ----- | -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| Q-001 | ¿Declarar categorías adicionales es parte del registro inicial o solo de editar el perfil ya creado? | resuelta 2026-09-06 | Solo editando el perfil, nunca en el registro — [UX-001](./experiencia.md#ux-001) en `experiencia.md`: el registro (misión 04) no se toca, y añadir precio/descripción por categoría al wizard de registro agrega fricción justo donde el arranque en frío del lado profesional ya es difícil. |
