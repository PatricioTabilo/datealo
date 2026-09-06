# Misión 11: vista de detalle de perfil de profesional — Investigación

**Estado:** activo

**Última actualización:** 2026-09-03

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando alguien ya decidió que un profesional le interesa y va a contactarlo

**Situación:** una persona buscó "electricista" en Puerto Varas, encontró a Patricio Tabilo en los
resultados de `/buscar` y entró a su perfil (`/profesionales/[id]`) para confirmar que es quien necesita
antes de escribirle.

**Acción o necesidad:** revisar fotos de trabajos, precio orientativo y reseñas para decidir si confía en
él, y después tocar "Escribir por WhatsApp" sin que la interfaz le genere dudas justo en ese momento.

**Respuesta actual:** la vista ya tiene todo el contenido resuelto desde las misiones 05 a 07 (galería con
carrusel y miniaturas, ficha con nombre/categoría/comuna/rating/descripción/precio, bloque de reseñas, CTA
de WhatsApp y teléfono), pero nunca recibió una pasada de diseño dedicada — a diferencia del header/footer
(misión 09) y de los resultados de búsqueda (misión 10), que sí la tuvieron. El dueño de producto la
describe así al mirarla hoy: en desktop "se ve desordenada" — foto grande a la izquierda, todo lo demás
apilado en una sola columna a la derecha sin jerarquía clara entre identidad, confianza y contacto; en
mobile, el botón fijo "Escribir por WhatsApp" se solapa visualmente con el footer general de la página al
llegar al final del scroll ([E-001](#e-001)).

**Consecuencia:** la pantalla pierde prolijidad justo en el paso donde la persona ya decidió que el
profesional le sirve y solo falta el empujón final de contactar — el peor punto del flujo para que la
interfaz reste confianza. En mobile, el solape puede además tapar el botón mismo, el único camino de
contacto de esta vista.

## Preguntas que la investigación debe resolver

- ¿Qué jerarquía (foto → identidad → señales de confianza → precio → contacto, o algún otro orden) refleja
  mejor cómo alguien evalúa a un profesional, en vez de apilar todo lo que el schema permite mostrar?
- ¿Dónde vive el bloque de reseñas — junto a la ficha de contacto como hoy, o como sección propia más abajo
  en la página, después del CTA?
- ¿Qué causa el solape del CTA fijo con el footer en mobile, y por qué el buffer que `general.vue` ya
  reserva (`pb-24`, agregado en la misión 09) no alcanza?

## Evidencia

| ID    | Tipo               | Fuente                                                                              | Hecho verificable | Límite de la evidencia |
| ----- | ------------------ | ------------------------------------------------------------------------------------ | ------------------ | ----------------------- |
| E-001 | código + observación | `app/pages/profesionales/[id].vue:108-118`, `app/layouts/general.vue:7`             | Ver desarrollo abajo | No mide impacto en usuarios reales — Datealo no tiene tráfico todavía. |
| E-002 | código              | `app/pages/profesionales/[id].vue:60-119`                                            | El layout desktop es un `lg:flex` de dos columnas: galería al 55% de ancho, columna derecha con avatar+nombre+categoría+rating+descripción+precio+reseñas+"en Datealo desde"+CTA, todo con el mismo peso visual y sin separadores entre secciones salvo `mt-*`. | Confirma la estructura actual, no dice cuál es mejor — eso lo define esta misión. |
| E-003 | código              | `app/components/professional-public/ProfessionalPublicPhotos.vue`                    | La galería ya tiene carrusel a `aspect-4/3` con `dots`, y en desktop (`lg:flex`) una tira de hasta N miniaturas de 64×64 debajo. Sin fotos, muestra el avatar o las iniciales centradas sobre un fondo plano. | Es una base sólida — la pregunta de esta misión es de proporción y jerarquía, no de funcionalidad faltante. |
| E-004 | benchmark           | [listivo6.tangiblewp.com](https://listivo6.tangiblewp.com/) — mismo theme citado como [E-005 de la misión 09](../09-layout-general/investigacion.md#e-005), esta vez su vista de detalle de un listado ("John's Plumbing") — captura compartida por el dueño de producto en la conversación de discovery del 2026-09-03, sin archivo guardado en el repo (no hay forma de extraer una imagen pegada en el chat al filesystem) | Estructura de la columna principal: galería con contador ("1/3") y flechas superpuestas a la foto (sin miniaturas aparte), y **debajo** de la galería — no en una tarjeta separada — el nombre del negocio, un tag de categoría, la ubicación con link "See map", y una fila de tags de atributos (disponibilidad, idiomas). Sigue con bloques propios para "Description" y "Services". La columna lateral es una tarjeta de contacto acotada: datos del anunciante, teléfono enmascarado con botón para revelarlo, y los botones de chat/WhatsApp — sin reseñas ni rating ahí. | Theme genérico de directorio de listados con anuncios pagos y cuentas de comprador — el dueño de producto pidió explícitamente la estructura (foto con overlay + info debajo + tarjeta de contacto acotada), no sus features (sin "cuenta online", sin Viber, sin "listados destacados", sin masking de teléfono). |
| E-005 | benchmark           | Airbnb, vista de detalle de un alojamiento — captura compartida por el dueño de producto en la misma conversación, sin archivo guardado en el repo (mismo límite que E-004) | El título va **arriba** de la galería (mosaico de fotos, no carrusel). Debajo del mosaico: título repetido + rating y conteo de reseñas en la misma línea que la info básica, antes de cualquier detalle del anfitrión. La tarjeta lateral es de acción (precio + CTA de reserva), no de identidad. Las reseñas completas viven como sección propia más abajo en la página, fuera de la tarjeta lateral. | Es una reserva con pago y fechas, no un contacto directo — el patrón que aplica a Datealo es la *posición* de las reseñas (sección propia, no comprimida en la tarjeta lateral), no el resto del flujo de compra. |
| E-006 | código              | `app/components/professional-public/ProfessionalPublicReviews.vue`, `[id].vue:98-105` | Hoy las reseñas viven dentro de la misma columna que la ficha de contacto, entre la descripción/precio y el aviso "En Datealo desde…" — compitiendo por espacio con el resto de la información de identidad. | Confirma la ubicación actual; no dice si moverlas resuelve el desorden percibido — depende de cómo quede el resto de la jerarquía. |

<a id="e-001"></a>

### E-001 — el CTA fijo se solapa con el footer general en mobile

`ProfessionalPublicContactBar` se envuelve en un contenedor `fixed inset-x-0 bottom-0` en mobile
(`[id].vue:109-118`), con dos botones lado a lado (WhatsApp + teléfono) dentro de `p-4`. `general.vue:7`
agrega `pb-24` (96px) al `AppFooter` para reservarle espacio a barras fijas como esta — buffer agregado en
la misión 09 pensando en el buscador compacto, no en este CTA específico.

En una pantalla angosta (390px, el caso principal de Datealo) el botón "Escribir por WhatsApp" lleva texto
más el ícono; si el ancho disponible no alcanza para las dos ramas en una fila, el buffer fijo de 96px deja
de ser suficiente apenas el contenido interno crece una línea. No se verificó todavía si eso es lo que
ocurre o si el buffer simplemente nunca fue pensado para esta barra en particular — solo que el dueño de
producto lo observó al revisar la pantalla real.

Esto permite afirmar que el ajuste de la misión 09 no cubre este caso, pero no determina todavía la causa
exacta ni si la solución es agrandar el buffer, hacerlo dinámico, o cambiar cómo esta vista reserva espacio
para su propio CTA — eso es una decisión de ingeniería, no de esta investigación.

## Conclusiones

<a id="c-001"></a>

### C-001 — el desorden percibido viene de tratar toda la info con el mismo peso visual, no de que falte contenido

- **Sustento:** [E-002](#e-002), [E-006](#e-006).
- **Razonamiento:** el código ya tiene identidad, señales de confianza (rating, reseñas), precio y contacto
  — el problema no es de cobertura de datos sino de que ninguno se destaca sobre el resto: mismo tamaño de
  fuente relativo, mismo espaciado `mt-*`, sin secciones visualmente separadas.
- **Implicación:** el rediseño es de jerarquía y agrupación (qué va junto, qué se separa, qué pesa más),
  no de agregar funcionalidad nueva.
- **Confianza:** alta porque se verificó leyendo el componente real, no una descripción de segunda mano.

<a id="c-002"></a>

### C-002 — la referencia de directorio de servicios valida sacar identidad+ubicación de la tarjeta lateral y ponerla bajo la galería

- **Sustento:** [E-004](#e-004).
- **Razonamiento:** tanto la referencia de directorio (E-004) como el layout deseado por el dueño de
  producto coinciden en que nombre, categoría y ubicación se leen mejor pegados a la foto que dentro de una
  tarjeta lateral compacta — libera esa tarjeta para ser solo el mecanismo de contacto.
- **Implicación:** F-xxx de `producto.md` deberá describir una columna principal (galería + identidad +
  descripción) y una tarjeta lateral acotada a precio + contacto, en vez de la tarjeta única de hoy que
  mezcla ambas cosas.
- **Confianza:** media — es un benchmark aportado por el dueño de producto (evidencia de intención, no de
  comportamiento de usuarios), pero coincide con su propio criterio explícito, no es solo una lectura
  nuestra del benchmark.

<a id="c-003"></a>

### C-003 — las reseñas ganan claridad como sección propia, separada del bloque de contacto

- **Sustento:** [E-005](#e-005), [E-006](#e-006).
- **Razonamiento:** Airbnb separa la decisión de reservar (tarjeta lateral) de la evaluación social
  (sección de reseñas más abajo) — en Datealo la reseña es la señal de confianza principal (no hay pagos,
  ni fechas, ni disponibilidad que mostrar en la tarjeta), así que separarla del bloque de contacto le da
  espacio propio en vez de competir con el precio y el CTA por la misma columna angosta.
- **Implicación:** `producto.md` debe decidir si las reseñas bajan a una sección de ancho completo (debajo
  de todo el bloque superior) o si se quedan en la columna de identidad pero por debajo del CTA — cualquiera
  de las dos saca reseñas de la tarjeta de contacto.
- **Confianza:** media — mismo límite que C-002, benchmark de un producto con un modelo de negocio distinto.

<a id="c-004"></a>

### C-004 — el buffer fijo de la misión 09 no está pensado para el CTA de esta vista y necesita revisión propia

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** el `pb-24` de `general.vue` se agregó para el buscador compacto de la misión 09; esta
  vista tiene su propio elemento fijo con contenido que puede crecer (dos botones, uno con texto), y nadie
  verificó que el mismo número de píxeles le alcance.
- **Implicación:** el rediseño del CTA de contacto debe fijar su propio espacio reservado (o un mecanismo
  que no dependa de adivinar un número fijo), no asumir que el buffer existente basta.
- **Confianza:** alta en que el bug existe (reportado y verificable en el código); media en la causa exacta
  — queda para `ingenieria.md` confirmar el porqué preciso.

## El ideal: cualquier perfil de profesional se lee de un vistazo, sin importar cuántos datos tenga cargados

### El resultado ideal se ve así

Alguien entra al perfil de Patricio Tabilo, electricista en Puerto Varas, desde el celular. Lo primero que
ve es una foto grande de un trabajo suyo (el tablero eléctrico instalado), con miniaturas debajo para las
otras dos fotos que subió. Debajo de la foto: su nombre, "Electricidad · Puerto Varas", y de inmediato el
precio ("Desde $15.000") — sin tener que buscar esa información entre otros bloques. Un botón grande
"Escribir por WhatsApp" queda siempre visible al fondo de la pantalla, sin que ningún otro elemento de la
página (footer incluido) lo tape nunca, en ningún tamaño de pantalla ni cantidad de contenido. Si sigue
bajando, encuentra la descripción que Patricio escribió sobre su experiencia, y más abajo una sección
propia de reseñas — sea la de alguien que ya lo contrató, o la invitación a ser el primero en dejar una si
todavía no tiene ninguna. En desktop, la misma información se organiza en dos columnas: la galería a la
izquierda con más espacio para mostrar fotos grandes, y a la derecha una tarjeta de contacto que se queda
fija en pantalla mientras se hace scroll por la descripción y las reseñas — nunca una tarjeta que intenta
contener todo a la vez.

### Capacidades del ideal

| Capacidad                          | Acción habilitada                                              | Respuesta esperada                                                      | Conclusión que la justifica |
| ----------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| Jerarquía clara de identidad y precio | Evaluar en segundos si el profesional y su precio calzan con lo que se busca | Foto, nombre, categoría/comuna y precio se leen antes que cualquier otro dato, agrupados y separados del resto | [C-001](#c-001), [C-002](#c-002) |
| CTA de contacto siempre accesible y nunca tapado | Tocar "Escribir por WhatsApp" en cualquier momento del scroll, sin que otro elemento lo cubra | El botón queda visible y clickeable en todo momento, en cualquier tamaño de pantalla | [C-004](#c-004) |
| Reseñas como sección propia | Evaluar la reputación del profesional sin que compita visualmente con el contacto | Bloque de reseñas con su propio espacio, separado de la tarjeta de contacto | [C-003](#c-003) |

### El ideal no significa copiar el diseño de Airbnb o de un directorio de listados

- Datealo no vende reservas ni anuncios pagos — no hay fechas, disponibilidad, ni "listados destacados" que
  mostrar en la tarjeta lateral, aunque la referencia los tenga.
- No implica agregar funcionalidad nueva (chat interno, mapa, tags de atributos) — el recorte de qué se
  construye en esta entrega es decisión de `producto.md`, no de esta investigación.

## Referencias

- [listivo6.tangiblewp.com](https://listivo6.tangiblewp.com/): usado en E-004 para la estructura de galería
  con overlay + identidad debajo + tarjeta de contacto acotada. Mismo theme citado en
  [E-005 de la misión 09](../09-layout-general/investigacion.md#e-005).
- Airbnb (vista de detalle de un alojamiento, captura compartida por el dueño de producto en el chat de
  discovery, sin archivo en el repo): usado en E-005 para la posición de las reseñas como sección propia,
  separada de la tarjeta de acción.
