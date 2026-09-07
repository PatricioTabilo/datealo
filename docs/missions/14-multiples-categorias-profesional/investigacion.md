# Misión: múltiples categorías por profesional — Investigación

**Estado:** activo

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando un profesional cubre más de un oficio y Datealo solo le deja declarar uno

<!--
Reconstruido a partir del patrón que describió el dueño de producto (no es una entrevista formal ni un
caso con nombre real) — ver E-001.
-->

**Situación:** Feña trabaja de forma independiente en Ñuñoa. Además de arreglos eléctricos, también hace
gasfitería — es común que quien instala o repara circuitos en una casa antigua también sepa resolver una
llave que gotea o un estanque de WC tapado, porque son trabajos que se piden juntos en el mismo tipo de
casa. Se registra en Datealo para que lo encuentren clientes de su zona.

**Acción o necesidad:** Al crear su perfil, Datealo le pide elegir **una** categoría. Feña tiene que decidir
si se registra como "Electricidad" o como "Gasfitería" — no puede declarar las dos.

**Respuesta actual:** Elige la que más le da trabajo hoy (Electricidad) y deja la otra fuera del perfil. Si
alguien lo conoce personalmente le pide también por la gasfitería, pero quien lo encuentra buscando
"gasfiter" en Ñuñoa por primera vez no lo ve en esa lista.

**Consecuencia:** Feña pierde la mitad de su demanda potencial dentro de la misma plataforma, y Datealo
muestra menos oferta de la que realmente tiene en Ñuñoa para gasfitería — un buscador que entra a esa
categoría ve una lista más corta de la real. El mismo patrón se repite con otras combinaciones de oficios
de mantención del hogar: un profesional que corta pasto también desmaleza con máquina, y hoy solo puede
declarar una de las dos.

## Preguntas que la investigación debe resolver

- ¿Cuántas categorías tiene sentido permitir por profesional, si la restricción real termina siendo la
  legibilidad de la card y del perfil, no el control de calidad? De esto depende si `experiencia.md` diseña
  con o sin tope, y si `ingenieria.md` necesita imponerlo a nivel de dato.
- ¿El precio orientativo (`priceFrom`) y la descripción siguen siendo un solo valor por profesional, o
  pasan a variar por categoría? De esto depende si la futura tabla de relación profesional-categoría es
  solo un vínculo, o si necesita campos propios.
- ¿Declarar más de una categoría es parte del registro inicial (misión 04) o una acción posterior de
  edición de perfil? Afecta si esta misión toca el flujo de registro o solo la edición y la búsqueda.

## Evidencia

| ID    | Tipo         | Fuente                                                                                                  | Hecho verificable                                                                                                        | Límite de la evidencia                                                                                          |
| ----- | ------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| E-001 | Observación  | Dueño de producto, conocimiento directo del rubro de oficios en Chile                                            | Profesionales de oficios de mantención del hogar suelen cubrir más de un rubro relacionado (electricidad+gasfitería, jardín+desmalezado a máquina) | No es una entrevista ni un conteo — no dice qué fracción de profesionales tiene esta característica ni cuántas categorías es lo típico. |
| E-002 | Benchmark    | [Thumbtack — guía de perfil](https://help.thumbtack.com/article/profile-guide)                                   | Un profesional puede agregar cualquier número de categorías de servicio a su perfil, sin límite explícito documentado                     | Thumbtack opera con millones de profesionales y moderación de contenido — no valida si la ausencia de tope es sana con la oferta baja de Datealo pre-lanzamiento. |
| E-003 | Benchmark    | [TaskRabbit — qué categorías agregar](https://support.taskrabbit.com/hc/en-us/articles/360052736472) y [cómo describir habilidades por categoría](https://www.taskrabbit.com/blog/crafting-the-ultimate-skills-and-experience-description/) | Cada categoría que un tasker agrega exige auto-certificar habilidad/herramientas/licencias para ella, y el texto de "Skills & Experience" se redacta por separado en cada categoría, no una sola vez para todo el perfil | TaskRabbit es de tareas domésticas variadas (mudanza, ensamblaje), no oficios técnicos regulados como en Chile; y no confirma si el precio también varía por categoría. |

<a id="e-001"></a>

### E-001 — El dueño de producto reporta el patrón directamente desde el rubro

Dos ejemplos de combinaciones distintas de oficios que se dan juntas en la práctica: alguien que hace
electricidad y también gasfitería, y alguien que corta pasto y también desmaleza con máquina. No son la
misma pareja de categorías, lo que sugiere que el patrón es una familia de combinaciones dentro de oficios
de mantención del hogar, no un caso aislado de dos categorías específicas.

Esto permite afirmar que el problema existe hoy con la oferta que Datealo ya tiene diseñada (categorías de
oficios del hogar), pero no demuestra con qué frecuencia ocurre ni si aplica igual a categorías de
servicios personales (peluquería, por ejemplo).

<a id="e-002"></a>

### E-002 — Thumbtack no pone tope numérico a las categorías de un profesional

Un pro de Thumbtack puede sumar cualquier cantidad de categorías de servicio a su cuenta; cada categoría
trae su propio set de preferencias configurables, pero no hay un máximo documentado.

Esto permite afirmar que a la escala de un marketplace maduro un tope duro no es necesario para que el
sistema funcione, pero no demuestra que la ausencia de tope sea igual de sana con la oferta reducida que
tendrá Datealo el primer año (ver "Cold start" y guardrail de spam de categorías del README de la misión).

<a id="e-003"></a>

### E-003 — TaskRabbit condiciona cada categoría a una certificación propia y separa la experiencia por categoría

Para sumar una categoría, TaskRabbit exige que el tasker certifique que tiene las habilidades, herramientas
y licencias necesarias para esa categoría específica — no es un permiso genérico de "puedo hacer tareas".
Además, el texto de "Skills & Experience" se redacta categoría por categoría, no una sola vez para todo el
perfil.

Esto permite afirmar que el control de calidad de "quién puede declarar qué categoría" se resuelve con una
certificación por categoría, no con un tope numérico — y que la experiencia/descripción de un profesional
puede no ser uniforme entre sus categorías. No demuestra que el precio deba seguir el mismo patrón, ni que
Datealo necesite un paso de certificación explícito por categoría (ese es un problema de verificación que
la misión no tiene por qué resolver de nuevo si ya hay una decisión vigente al respecto).

## Conclusiones

<a id="c-001"></a>

### C-001 — Cubrir más de un oficio relacionado es un patrón real y esperable, no una excepción rara

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** el dueño de producto reporta el patrón desde conocimiento directo del rubro, con dos
  ejemplos de combinaciones distintas de categorías, lo que indica una familia de casos y no una pareja
  puntual de categorías que se podría resolver con una excepción ad hoc.
- **Implicación:** el modelo de datos de "una categoría por profesional" subcuenta oferta real desde el
  día uno de Datealo — no es un caso límite que aparecerá más adelante con volumen, ya existe hoy con la
  primera oferta que se registre.
- **Confianza:** media, porque no hay conteo ni entrevista formal — es la lectura de un experto del
  dominio, no una medición sobre profesionales reales de Datealo (todavía no existen).

<a id="c-002"></a>

### C-002 — El tope a las categorías, si existe, se justifica por legibilidad del perfil, no por control de calidad

- **Sustento:** [E-002](#e-002), [E-003](#e-003).
- **Razonamiento:** Thumbtack y TaskRabbit, con volumen y necesidad de calidad mucho mayores que Datealo,
  no imponen un tope numérico a las categorías por profesional; en cambio, TaskRabbit condiciona cada
  categoría a una auto-certificación de habilidad. Eso separa dos problemas que el README de la misión
  trae mezclados ("sin límite, o un tope para que no se use como spam de categorías"): evitar que alguien
  se declare en una categoría sin poder cubrirla es un problema de verificación, y mantener el perfil
  legible con 2-3 categorías visibles es un problema de diseño visual.
- **Implicación:** un tope a las categorías por profesional, si `producto.md` lo decide, debe justificarse
  por espacio y jerarquía en la card/perfil (una decisión de `experiencia.md`), no como sustituto de
  verificación de habilidad — la verificación, si Datealo la necesita, es una decisión aparte que ya existe
  o debe abrirse en su propia misión, no inventarse acá para justificar el tope.
- **Confianza:** media — el benchmark no transfiere 1:1 por diferencia de escala (millones de
  profesionales vs. los primeros que se registren en Datealo) y de rubro (oficios técnicos regulados en
  Chile vs. tareas domésticas variadas en EE.UU.).

<a id="c-003"></a>

### C-003 — La información asociada a una categoría puede no ser uniforme dentro de un mismo profesional

- **Sustento:** [E-003](#e-003).
- **Razonamiento:** TaskRabbit separa el texto de experiencia por categoría porque la experiencia de un
  tasker en "Ensamblaje de muebles" no es la misma que en "Ayuda para mudanza", aun siendo la misma
  persona. El mismo argumento aplica a Feña: su experiencia y su precio orientativo en electricidad no
  tienen por qué ser los mismos que en gasfitería.
- **Implicación:** si Datealo sigue este patrón, la futura relación profesional-categoría no es solo un
  vínculo N:N — puede necesitar campos propios (ej. precio orientativo por categoría), lo que cambia
  `priceFrom` y `description` de columnas únicas del profesional a algo que varía por categoría. Esta
  conclusión no decide el cambio, solo advierte el costo de rediseño si `producto.md` lo adopta.
- **Confianza:** baja — una sola fuente de benchmark, y Datealo hoy ya tiene `priceFrom` y `description`
  como campos únicos del profesional, así que el costo de cambiarlo es real y debe evaluarse en
  `producto.md`/`ingenieria.md`, no asumirse acá.

## El ideal: cualquier profesional aparece en todas las categorías que realmente cubre, sin duplicar su perfil

### El resultado ideal se ve así

Feña arregla instalaciones eléctricas y hace gasfitería en Ñuñoa y comunas vecinas. Declaró ambas
categorías en su perfil de Datealo. Cuando Constanza busca "gasfiter" en Ñuñoa porque se le tapó el
estanque del baño, Feña aparece en esa lista junto a los gasfiters que solo hacen gasfitería, con la
etiqueta "Gasfitería" visible en su card — no aparece mezclado con resultados de electricidad en esa misma
búsqueda. Cuando Constanza entra a su perfil completo, ve las dos categorías que ofrece, así que piensa "ya
que vino, le pregunto también por el enchufe que no funciona en la pieza". En el otro extremo, don Sergio
corta pasto y desmaleza con máquina en La Reina — dos categorías del mismo rubro de jardín y aseo exterior
— y aparece en los resultados de ambas búsquedas sin tener que crear dos perfiles ni pagarle a Datealo el
doble por existir dos veces.

### Capacidades del ideal

| Capacidad                                    | Acción habilitada                                                                                  | Respuesta esperada                                                                                     | Conclusión que la justifica |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Declarar más de una categoría                 | El profesional agrega, al crear o editar su perfil, cualquier categoría activa donde tenga las herramientas o habilidades | Datealo guarda todas las categorías que declaró, no solo una                                             | [C-001](#c-001)               |
| Aparecer en cualquiera de sus búsquedas       | El buscador filtra por una categoría a la vez (`/buscar?categoria=X`)                                | El profesional multi-categoría aparece en los resultados de cada categoría que declaró, no solo la primera | [C-001](#c-001), [C-002](#c-002) |
| Ver todas sus categorías desde cualquier entrada | Alguien llega al perfil completo del profesional desde cualquiera de sus categorías                | El perfil muestra todas las categorías que ofrece, no solo la que trajo la búsqueda                       | [C-001](#c-001)               |

### El ideal no significa que cualquiera declara cualquier categoría sin control, ni que el precio cambia por categoría desde ya

- No significa que un profesional puede declarar cualquier categoría sin ningún control de que realmente
  tiene esa habilidad — la verificación real (si Datealo la implementa) es un problema de confianza
  aparte, no algo que esta misión deba inventar para justificar un tope.
- No significa que el precio orientativo o la descripción tienen que variar por categoría desde el día uno
  — eso es una pregunta abierta (ver C-003), no una conclusión cerrada; puede resolverse manteniendo un
  precio y una descripción únicos por profesional en la primera entrega.
- No significa "categorías ilimitadas" como decisión ya tomada — el benchmark descarta que el tope exista
  por control de calidad, pero si existe un tope por legibilidad visual, esa es una decisión de
  `producto.md`/`experiencia.md`, no algo que la investigación resuelva por sí sola.

## Referencias

- [Thumbtack — guía de perfil](https://help.thumbtack.com/article/profile-guide): usado en E-002 para
  confirmar que no hay tope documentado de categorías por profesional.
- [TaskRabbit — qué categorías agregar a tu perfil](https://support.taskrabbit.com/hc/en-us/articles/360052736472-Which-Task-Categories-Should-I-Add-To-My-Profile):
  usado en E-003 para la auto-certificación por categoría.
- [TaskRabbit — cómo redactar la experiencia por categoría](https://www.taskrabbit.com/blog/crafting-the-ultimate-skills-and-experience-description/):
  usado en E-003 para confirmar que la experiencia se describe por categoría, no una sola vez.
