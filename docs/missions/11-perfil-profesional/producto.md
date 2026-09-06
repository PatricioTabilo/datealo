# Misión 11: vista de detalle de perfil de profesional — Producto

**Estado:** vigente — aprobado por Patricio el 2026-09-03

**Última actualización:** 2026-09-03

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: la vista de detalle se lee de un vistazo, sin agregar contenido nuevo

**Resultado:** al terminar esta entrega, cualquier persona que abra `/profesionales/[id]` ve foto,
identidad (nombre, categoría, comuna) y precio agrupados junto a la galería, un botón de contacto que
nunca queda tapado por otro elemento de la página, y las reseñas como su propia sección — en vez de una
sola columna donde todo pesa igual.

**Recorte respecto del ideal:** [el ideal](./investigacion.md) es una vista que se lee de un vistazo con
cualquier cantidad de datos; esta entrega reorganiza y prioriza la información que el perfil **ya
muestra hoy** (fotos, nombre, categoría, comuna, rating, descripción, precio, reseñas, contacto) — no
agrega campos nuevos al schema ni funcionalidad nueva (tags de atributos, mapa, disponibilidad). Sigue
siendo el mismo resultado central del ideal (evaluar y contactar sin fricción) con menos superficie de
cambio.

**Restricciones aceptadas:** mobile 390px sigue siendo el caso principal; desktop reutiliza el layout de
dos columnas que ya existe (`lg:flex`), reorganizando su contenido, no reemplazándolo por un layout
distinto; sin nueva funcionalidad de datos (ver "Fuera de alcance").

## Funcionalidades

| ID    | Funcionalidad                                          | Lado  | Sustento                        | Éxito |
| ----- | -------------------------------------------------------- | ----- | ---------------------------------- | ----- |
| F-001 | Vista de detalle reorganizada por jerarquía de decisión | ambos | C-001, C-002, C-003, C-004, D-001, D-002, D-003 | M-001 |

<a id="f-001"></a>

### F-001 — Vista de detalle reorganizada por jerarquía de decisión

Cuando entro al perfil de un profesional que me interesó en los resultados de búsqueda,
quiero confirmar rápido que es alguien de fiar, cuánto cobra y cómo contactarlo,
para decidir por mi cuenta si me arriesgo con un desconocido, sin tener que preguntarle a nadie más
si conviene.

**Dimensiones del job** (framework `jobs-to-be-done`): funcional — ver identidad, precio y contacto sin
leer toda la pantalla; emocional — sentir que puede confiar en dejar entrar a un desconocido a resolver
algo en su casa; social — decidir sin depender de la validación de un tercero (pareja, vecino, el grupo de
WhatsApp del edificio), que es la competencia real de esta pantalla, no otro marketplace.

**Lado del marketplace:** ambos — el buscador evalúa más rápido y con más confianza; el profesional se
beneficia de que su foto, precio y reseñas se noten en vez de perderse en una columna plana. **Qué necesita
del otro lado:** nada — es una reorganización de datos que el perfil ya tiene, no depende de volumen de
profesionales ni de reseñas.

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[C-003](./investigacion.md#c-003), [C-004](./investigacion.md#c-004) y [D-001](#d-001), [D-002](#d-002),
[D-003](#d-003). **Éxito:** [M-001](#m-001).

**Reglas:**

- Nombre, categoría, comuna y precio orientativo se agrupan junto a la galería (no dentro de la tarjeta de
  contacto), en el mismo bloque visual que la foto — son lo primero que se lee después de la imagen.
- El botón de contacto (WhatsApp y teléfono) queda visible y clickeable en todo momento del scroll, sin que
  el footer general ni ningún otro elemento de la página lo tape, en cualquier tamaño de pantalla y
  cualquier largo de contenido (ver [D-003](#d-003)).
- Las reseñas viven en su propia sección, separadas del bloque de contacto — ni la tarjeta de contacto ni
  el bloque de identidad las contienen.
- Si el profesional no tiene fotos, Datealo muestra su avatar o iniciales en el mismo espacio que ocuparía
  la galería, sin dejar un hueco vacío ni reducir el tamaño del bloque de identidad.
- Si el profesional no tiene precio orientativo cargado, Datealo omite esa línea sin dejar un espacio en
  blanco ni un placeholder tipo "Precio no disponible".
- Si el profesional no tiene reseñas, la sección de reseñas muestra la invitación a dejar la primera (ya
  construida en la misión 07) en el mismo lugar donde irían las reseñas reales.

**Ejemplo verificable:** dado el perfil de Patricio Tabilo (electricista en Puerto Varas, con 3 fotos,
precio "Desde $15.000" y cero reseñas), cuando alguien lo abre desde el celular, entonces ve la foto,
debajo su nombre + "Electricidad · Puerto Varas" + el precio, el botón "Escribir por WhatsApp" fijo y
visible en todo momento, y al bajar la invitación a dejar la primera reseña como su propia sección — el
footer general nunca cubre el botón, sin importar cuánto se desplace la página.

**No incluye:** tags de atributos, mapa o ubicación exacta, disponibilidad por horario, ni ningún dato que
el schema no tenga hoy (ver "Fuera de alcance"). No rediseña los estados de cargando/tardando/no encontrado
más allá de que el esqueleto de carga refleje las nuevas proporciones para no saltar al cargar el contenido
real.

**Experiencia:** pendiente (`experiencia.md`). **Ingeniería:** pendiente (`ingenieria.md`).

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta                                  | Comportamiento esperado                                                                 | Funcionalidades |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------- |
| CL-001 | Profesional sin fotos                                  | Avatar o iniciales ocupan el espacio de la galería, sin achicar el bloque de identidad     | F-001            |
| CL-002 | Profesional sin precio orientativo                     | La línea de precio no aparece; nada la reemplaza                                            | F-001            |
| CL-003 | Profesional sin reseñas                                | La sección de reseñas muestra la invitación a dejar la primera, no un hueco vacío           | F-001            |
| CL-004 | Descripción del profesional muy larga o muy corta      | El bloque de identidad no fuerza un alto fijo — crece o se achica con el texto real          | F-001            |

## Fuera de alcance

| Capacidad o caso                                             | Estado     | Razón del recorte                                                                                   | Condición para reconsiderar |
| ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Tags de atributos (disponibilidad, idiomas, "atiende fines de semana") | postergada | El schema de `professionals` no tiene estos campos hoy — agregarlos es una decisión de producto propia, no un ajuste de layout | Si una futura misión define y prioriza estos campos |
| Mapa o "ver ubicación exacta"                                     | descartada | Datealo no usa geolocalización en ningún punto del código (confirmado en [E-020 de la misión 09](../09-layout-general/investigacion.md#e-020)); mostrar un mapa sin esa base es agregar una funcionalidad nueva, no reorganizar la existente | Si Datealo agrega geolocalización como funcionalidad propia |
| Teléfono enmascarado con botón para revelarlo                    | descartada | Choca con el principio de contacto directo sin fricción (ver `CLAUDE.md`) — Datealo no pone pasos entre el buscador y el profesional | No aplica mientras el contacto directo siga siendo un guardrail de producto |
| Rediseño completo de estados de cargando/tardando/no encontrado  | postergada | No son el problema que motivó esta misión (ver `investigacion.md`); solo se ajusta el esqueleto de carga para que calce con las nuevas proporciones | Si una revisión futura de estados vacíos/de error cubre toda la app a la vez |

## Señales de éxito

<a id="m-001"></a>

### M-001 — la vista se entiende sin explicación

- **Pregunta:** ¿alguien que nunca vio esta pantalla identifica en segundos quién es el profesional, cuánto
  cobra y cómo contactarlo?
- **Señal:** se le muestra la vista nueva (en el celular, sin contexto previo) a 5 personas ajenas al
  proyecto. Al menos 4 de las 5 dicen sin ayuda, en menos de 10 segundos, el nombre/oficio, el precio
  orientativo y cómo contactar — y ninguna la describe como "desordenada" o "confusa" sin que se le
  pregunte por eso.
- **Línea en la arena:** si menos de 4 de 5 lo logran, la entrega no se da por terminada — se revisa la
  jerarquía visual antes de abrir el PR, no se corrige después de mergeado.
- **Método:** revisión cualitativa, conversación uno a uno mostrando la pantalla — no hay instrumentación
  automática posible sin usuarios reales todavía (etapa "Empatía" del framework `lean-analytics`, igual que
  en la misión 09: la métrica esperada en esta etapa son notas de conversación, no un número instrumentado).
- **Guardrail (contramétrica):** no aumentar el tiempo de carga de la página ni introducir scroll horizontal
  en ningún tamaño de pantalla — evita que "se ve más ordenado" se logre a costa de rendimiento o de romper
  el layout mobile.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — esta entrega reorganiza datos existentes; no agrega campos nuevos al perfil

- **Estado:** propuesta. **Fecha:** 2026-09-10.
- **Sustento:** [C-002](./investigacion.md#c-002).
- **Tensión:** la referencia de directorio de servicios ([E-004](./investigacion.md#e-004)) trae tags de
  atributos y ubicación con mapa, que harían la ficha más rica — pero ninguno de esos datos existe hoy en
  el schema de `professionals`.
- **Alternativas descartadas:** agregar esos campos en la misma misión, para calzar más con la referencia
  — se descarta porque mezclaría una decisión de qué datos nuevos pedirle a un profesional (con su propio
  costo de fricción en el registro) con un problema que es puramente de layout; encarece y alarga esta
  misión sin necesidad.
- **Decisión y consecuencia:** el recorte reorganiza y prioriza lo que el perfil ya muestra. Habilita que
  `experiencia.md` e `ingenieria.md` trabajen solo sobre componentes existentes, sin tocar `server/db/schema`.
- **Reapertura:** si una misión futura decide agregar atributos o ubicación al perfil de profesional.

<a id="d-002"></a>

### D-002 — las reseñas salen de la tarjeta de contacto y pasan a ser una sección propia

- **Estado:** propuesta. **Fecha:** 2026-09-10.
- **Sustento:** [C-003](./investigacion.md#c-003).
- **Tensión:** dejarlas donde están hoy (dentro de la misma columna que el CTA) es el cambio más chico;
  moverlas a una sección propia es más trabajo de layout pero libera esa columna para que sea solo de
  contacto.
- **Alternativas descartadas:** dejar las reseñas donde están y solo separar visualmente con más espaciado
  — se descarta porque no resuelve que compitan por la misma columna angosta que el precio y el CTA, que es
  justo lo que el dueño de producto señaló como parte del desorden.
- **Decisión y consecuencia:** las reseñas se diseñan en `experiencia.md` como bloque de ancho completo (o
  equivalente), separado del bloque de identidad+contacto. En mobile esto cambia el orden de scroll actual
  (hoy: descripción → precio → reseñas → CTA fijo).
- **Reapertura:** si en el diseño de `experiencia.md` una sección separada resulta peor en mobile por el
  espacio que ocupa — se evaluaría ahí, no acá.

<a id="d-003"></a>

### D-003 — el botón de contacto reserva su propio espacio; no depende del buffer genérico del footer

- **Estado:** propuesta. **Fecha:** 2026-09-10.
- **Sustento:** [C-004](./investigacion.md#c-004).
- **Tensión:** la solución más simple es agrandar el `pb-24` que `general.vue` ya reserva — pero ese número
  fue pensado para el buscador compacto de la misión 09, no para esta barra, y un número fijo más grande
  sigue siendo frágil si el contenido de cualquiera de las dos barras cambia a futuro.
- **Alternativas descartadas:** subir el buffer genérico a un número más grande y probar — se descarta como
  decisión de producto porque es un parche que no explica por qué ese número es el correcto; queda como
  posible solución técnica, pero la decisión de producto es que el comportamiento (nunca taparse) no puede
  depender de que alguien adivine bien un número de píxeles.
- **Decisión y consecuencia:** el requisito de producto es el comportamiento ("nunca tapado"), no el
  mecanismo — cómo se reserva ese espacio exactamente (buffer propio, medición dinámica, u otro) es
  decisión de `ingenieria.md`.
- **Reapertura:** no aplica — es el tipo de decisión que no debería necesitar reabrirse si `ingenieria.md`
  la resuelve bien la primera vez.

## Preguntas

Sin preguntas abiertas — el recorte de esta entrega quedó definido en D-001 a D-003.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | —                                |
