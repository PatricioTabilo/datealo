# Misión: hero y copy de la landing — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-09-04, con F-002 sumada y aceptada el mismo día

**Última actualización:** 2026-09-04

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para flujos, estados, contenido e interacción. No redefine reglas de producto: si el
diseño descubre una regla nueva o invalida una, abre o actualiza una decisión en producto.md.
-->

## Decisión de experiencia: el buscador del hero se ve como una pill segmentada con íconos, siempre visible, sin un panel que haya que abrir

El hero mantiene sus dos campos (categoría, comuna) a la vista todo el tiempo — nunca detrás de un botón
que abre un sheet, aunque comparta el lenguaje visual (pill redondeada, campos segmentados, botón de
búsqueda) con `CompactSearchBar` de `/buscar` ([D-003](./producto.md#d-003)). El copy del headline,
subheadline y trust items se reescribe para hablar directo contra el grupo de WhatsApp/Facebook del
edificio, sin usar "verificado". El header general (`AppHeader.vue`) no cambia — el buscador del hero es
un elemento del body de la landing, no del header fijo.

`LandingNavbar.vue` (el nav propio de la landing, distinto de `AppHeader.vue`) sí cambia con F-002: su
link "Para profesionales" pasa a ser directo ("Publícate"/"Mi perfil"), retomando el diseño que la misión
09 dejó pausado en el [issue #155](https://github.com/PatricioTabilo/datealo/issues/155). El resto del nav
(Categorías, Buscar, y su comportamiento al hacer scroll) no cambia — la pregunta de si el nav necesita su
propio buscador tras el scroll queda fuera de esta misión ([D-004](./producto.md#d-004)).

- **Funcionalidades cubiertas:** F-001, F-002.
- **Pendiente bloqueante:** ninguna.

## Vistas

- **V-001 — Landing: hero (`/`)** · móvil + desktop · resuelve F-001 · flujos UXF-001 · validado
  - modo **inicial** — ningún campo elegido, o solo uno de los dos; cada campo sin elegir muestra su
    placeholder ("¿Qué servicio buscas?" / "¿Qué comuna buscas?"). El botón "Buscar" está atenuado
    (`bg-secondary/50`).
  - modo **listo** — categoría y comuna elegidas; ambos campos muestran su valor en negrita. El botón
    "Buscar" pasa a su color sólido y navega a `/buscar` al tocarlo.
- **V-002 — Landing: nav (`/`)** · móvil + desktop · resuelve F-002 · sin flujo dedicado (ver más abajo)
  - modo **sin sesión de profesional** — el link de la derecha dice "Publícate" y navega a
    `/profesional/registro`.
  - modo **con sesión de profesional** — el mismo lugar dice "Mi perfil" y navega a
    `/profesional/perfil`. Nunca los dos textos a la vez.

## Mapa de estados

| Desde   | Acción                                  | Queda en                                | Qué pasa con el trabajo                                    |
| ------- | ---------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| inicial | elige categoría (falta comuna)           | inicial                                  | el campo categoría queda con el valor elegido               |
| inicial | elige categoría (comuna ya elegida)      | listo                                    | los dos valores quedan elegidos; el botón se enciende       |
| inicial | elige comuna (falta categoría)           | inicial                                  | el campo comuna queda con el valor elegido                  |
| inicial | elige comuna (categoría ya elegida)      | listo                                    | los dos valores quedan elegidos; el botón se enciende       |
| listo   | toca "Buscar"                            | sale de la vista, navega a `/buscar`     | categoría y comuna viajan como query (`categoria`, `comuna`) |
| listo   | cambia uno de los dos campos             | listo                                    | el campo que no tocó se conserva; el botón sigue encendido  |
| cualquiera | cierra un dropdown sin elegir (click afuera) | el mismo modo en que estaba          | el campo abierto vuelve a mostrar lo que ya tenía (valor o placeholder); nada se pierde |
| cualquiera | sigue haciendo scroll a otra sección de la landing | el mismo modo, fuera de vista  | lo elegido se conserva en memoria del cliente mientras no recargue la página |

## UXF-001 — Buscar desde el hero

**Objetivo:** elegir categoría y comuna y llegar a los resultados de `/buscar`. **Contrato:**
[F-001](./producto.md#f-001).

**Punto de entrada:** alguien abre `datealo.cl` (`/`) por primera vez; el hero es la primera sección que
ve, en modo inicial, con los dos campos del buscador mostrando su placeholder.

**Criterio de término:** la navegación a `/buscar?categoria=<slug>&comuna=<codigo>` con los dos parámetros
llenos.

**Cómo sabe el usuario dónde está:** el valor elegido reemplaza el placeholder dentro de su propio campo —
es el indicador permanente por campo. El color del botón "Buscar" (atenuado vs. sólido) indica si ya puede
buscar o todavía le falta un campo.

### Salidas

| Salida                          | Cómo se ejecuta                          | Qué queda del trabajo                                          |
| -------------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| Termina bien                     | toca "Buscar" con los dos campos elegidos  | navega a `/buscar` con `categoria` y `comuna` en la query        |
| Descarta la selección de un campo | cierra el dropdown sin elegir (click afuera) | el campo mantiene lo que tenía antes de abrirlo; nada se pierde |
| Abandona sin buscar               | sigue el scroll a otra sección de la landing | lo elegido se conserva en memoria mientras no recargue la página |

### Secuencia principal

| Paso | Acción                                    | Respuesta del sistema                                                                                   | Información visible                                        |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | Toca el campo "¿Qué servicio buscas?"      | Se abre debajo el dropdown de categorías (mismo `CatalogSelect` que usa el resto de la app)               | Lista de categorías por nombre                              |
| 2    | Elige "Gasfitería"                         | El campo pasa de mostrar el placeholder a mostrar "Gasfitería" en negrita; el dropdown se cierra          | El valor elegido reemplaza el placeholder                   |
| 3    | Toca el campo "¿Qué comuna buscas?"        | Se abre el dropdown de comunas, con buscador de texto (catálogo grande)                                   | Lista de comunas frecuentes, o resultados al escribir        |
| 4    | Elige "Ñuñoa"                              | El campo muestra "Ñuñoa"; con los dos campos llenos, el botón "Buscar" pasa de atenuado a su color sólido | El botón cambia de color — señal de que ya puede tocarlo    |
| 5    | Toca "Buscar"                              | Navega a `/buscar?categoria=gasfiteria&comuna=nunoa`                                                       | Vista de resultados (fuera del alcance de esta misión)      |

### Variantes y recuperación

| Condición                                              | Qué cambia                          | Cómo se entiende                                                        | Cómo se recupera                            |
| -------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| Solo eligió uno de los dos campos                       | el botón sigue atenuado                | el color apagado del botón                                                  | elige el campo que falta                       |
| Toca "Buscar" sin completar los dos campos               | no navega (mismo comportamiento tolerante de hoy) | el botón hace un shake breve (200ms) — la única señal de que faltó algo, más allá del color atenuado | completa el campo que falta                    |
| El catálogo de categorías o comunas falla al cargar      | el dropdown muestra el mensaje de error ya existente de `CatalogSelect` ("No pudimos cargar las categorías." / "...las comunas.") con botón "Reintentar" | mismo patrón que ya usa el resto de la app | toca "Reintentar"                              |
| Conexión lenta cargando el catálogo                      | el dropdown muestra el skeleton ya existente de `CatalogSelect` (3 líneas animadas) | skeleton, no spinner                          | se resuelve solo cuando termina de cargar      |

### Decisiones que no deben quedar implícitas

- Tocar "Buscar" sin los dos campos elegidos no navega, pero el botón sí responde: un shake breve
  (200ms) es la señal de que faltó algo — sin esto, un tap que no hace nada visible es indistinguible de
  un botón roto ([UX-002](#ux-002)).
- Cambiar un campo ya elegido no borra el otro — cada campo guarda su valor de forma independiente.
- No hay botón "limpiar" ni "cancelar" — es un buscador de entrada, no un formulario con estado que deba
  descartarse explícitamente.
- Los dos campos y el botón "Buscar" llevan foco visible (`focus-visible:ring-*`, ya usado en el resto de
  la app — ver `CompactSearchBarPanel`) — nunca `outline-none` sin reemplazo, para quien navega con
  teclado.
- El campo de categoría del hero usa un placeholder propio, "¿Qué servicio buscas?", en vez del
  "¿Qué necesitas?" que trae `CategoriaSelect` por defecto — ahí sí tiene sentido (alguien busca un
  servicio), a diferencia del formulario de registro de profesional donde el mismo componente se usa hoy
  y "¿Qué necesitas?" no aplica. Es un override por prop, no un cambio del default — el resto de los usos
  de `CategoriaSelect` no cambia.
- En desktop, la pill mide como máximo lo que deja la columna de dos ([D-003](./producto.md#d-003)) —
  bastante menos ancho que en mobile, donde el buscador ocupa todo el ancho disponible. Con el placeholder
  en forma de pregunta ("¿Qué servicio buscas?" / "¿Qué comuna buscas?") el texto no cabía en una línea y
  se quebraba a dos, y con eso el botón "Buscar" quedaba desproporcionado (una fila más alta a un lado,
  el botón con su altura original al otro). Por eso el placeholder de desktop es más corto —
  "Elige categoría" / "Elige comuna", el mismo estilo que ya usa `CompactSearchBarPanel` para sus estados
  vacíos — y los tres elementos de la pill (los dos campos y el botón) comparten el mismo padding vertical.
  Mobile conserva el placeholder en forma de pregunta, que ahí sí cabe cómodo en una línea.

## Estados por superficie

| Estado                | Qué se muestra (texto e información real)                                                                | Acción disponible                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| campo sin elegir (mobile) | placeholder "¿Qué servicio buscas?" o "¿Qué comuna buscas?", ícono del campo (llave para categoría, pin para comuna), botón "Buscar" atenuado | abrir el dropdown de ese campo                          |
| campo sin elegir (desktop) | placeholder corto "Elige categoría" o "Elige comuna" (la pill es más angosta que en mobile), mismo ícono por campo, botón "Buscar" atenuado | abrir el dropdown de ese campo                          |
| campo elegido          | el valor elegido ("Gasfitería", "Ñuñoa") reemplaza el placeholder, en negrita                                | cambiar de campo, o tocar "Buscar" si el otro también está elegido |
| carga del catálogo     | dentro del dropdown: 3 líneas skeleton animadas (ya existente en `CatalogSelect`)                             | ninguna, se resuelve solo                                |
| error de catálogo      | dentro del dropdown: "No pudimos cargar las categorías." o "No pudimos cargar las comunas." + botón "Reintentar" | tocar "Reintentar"                                       |

## Mockups

| Mockup | Cubre   | Estado    | Ruta                          |
| ------ | ------- | --------- | ------------------------------ |
| hero   | UXF-001 | validado  | `./design-mockups/hero.html`  |

F-002 no tiene mockup ni `UXF` propio: es el cambio de texto y destino de un link que ya existe y ya se ve
en producción (`LandingNavbar.vue`), con el mismo criterio de sesión que `AppHeader.vue` ya implementa hoy
— no hay interacción nueva que dibujar ni un estado que no se pueda leer directo de
[F-002](./producto.md#f-002) y [UX-003](#ux-003).

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                    | Estado      |
| ------------- | ------- | ------------------------------------------------------------------------ | ------------ |
| F-001         | UXF-001 | campo sin elegir, campo elegido, carga de catálogo, error de catálogo (CL-001 de tamaño de fuente cubierto por el mismo copy mockeado) | en revisión  |
| F-002         | —       | sin sesión ("Publícate"), con sesión ("Mi perfil")                        | en revisión  |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El buscador del hero mantiene los dos campos siempre visibles, sin un panel que haya que abrir

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [D-003](./producto.md#d-003), [C-006](./investigacion.md#c-006), mockup `hero.html`
  aprobado por el dueño de producto.
- **Alternativas descartadas:** reusar `CompactSearchBar` tal cual — un solo botón que abre un panel o
  sheet con los dos campos adentro — se descarta porque el hero tiene espacio de sobra (no es un header
  angosto) y alguien que llega por primera vez entiende mejor el producto viendo los dos campos
  (categoría + comuna) de entrada, sin un tap extra que los oculte; un solo campo ancho tipo "¿Qué
  necesitas? · ¿Dónde?" que abre un panel combinado — se descarta por la misma razón, esconde la
  estructura categoría+comuna que un visitante nuevo todavía no conoce.
- **Decisión y consecuencia:** el hero usa dos campos segmentados dentro de una pill blanca (mobile:
  apilados con divisor horizontal; desktop: en fila con divisor vertical), cada uno abre su propio
  dropdown en el lugar (reusa `CatalogSelect`, sin sheet ni `Teleport`), con un botón "Buscar" (ícono +
  texto) al final de la pill.
- **Impacto en producto:** ninguno — mismo nivel de detalle que ya fija [D-003](./producto.md#d-003).

<a id="ux-002"></a>

### UX-002 — El botón "Buscar" nunca bloquea el tap; el color atenuado y un shake al tocarlo incompleto son la única señal

- **Estado:** aceptada. **Fecha:** 2026-09-04, ajustada el 2026-09-04 tras la evaluación heurística
  independiente (ver más abajo).
- **Sustento:** comportamiento ya existente en `LandingHero.vue` (el CTA de hoy navega con lo que esté
  elegido, sin exigir ambos campos).
- **Alternativas descartadas:** deshabilitar el `<button>` de verdad (con `disabled` real, sin manejar el
  click) como hace `CompactSearchBar` — se descarta porque introduciría una regla de validación nueva que
  `producto.md` no pidió (F-001 no incluye cambiar la estructura funcional del buscador); el color
  atenuado ya es señal suficiente sin bloquear nada.
- **Decisión y consecuencia:** el botón siempre es clickeable. Si falta un campo, tocarlo navega a
  `/buscar` con el o los parámetros que sí estén elegidos — mismo comportamiento tolerante que existe hoy.
  El color atenuado (`bg-secondary/50`) es la señal permanente; un shake breve (200ms) al tocarlo
  incompleto es la señal del momento del tap — sin ella, un tap sin efecto visible es indistinguible de un
  botón roto. La evaluación heurística independiente atacó esta decisión (su sustento original era "es lo
  que ya existe hoy", el mismo tipo de herencia sin cuestionar que D-001 prohíbe para el copy) y el shake
  es la corrección que sobrevivió: la decisión de fondo (no bloquear el tap) se mantiene, lo que faltaba
  era el feedback del momento.
- **Impacto en producto:** ninguno.

<a id="ux-003"></a>

### UX-003 — El link de profesionales del nav de la landing reusa `useProfessionalSession`, pero no el comportamiento de `AppHeader.vue`: acá siempre muestra algo

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [F-002](./producto.md#f-002), [D-004](./producto.md#d-004). `AppHeader.vue` ya usa
  `useProfessionalSession` para decidir si muestra el avatar de perfil, pero solo con `v-if="professional"`
  y sin `v-else` — sin sesión, ese lugar del header queda vacío, porque ahí es un acceso secundario. El nav
  de la landing es la entrada principal de captación del lado profesional, así que no puede quedar vacío:
  siempre muestra "Publícate" o "Mi perfil".
- **Alternativas descartadas:** copiar el comportamiento de `AppHeader.vue` tal cual (nada visible sin
  sesión) — se descarta porque dejaría a un visitante nuevo sin ningún acceso al lado profesional desde el
  nav, que es exactamente el problema que motiva F-002.
- **Decisión y consecuencia:** `LandingNavbar.vue` consume el mismo `useProfessionalSession` que
  `AppHeader.vue`, pero con su propio `v-if`/`v-else` para nunca quedar vacío. Mientras la sesión resuelve
  (el `await` inicial), el link no tiene todavía un estado definido en este documento — ver
  [TR-002](./ingenieria.md) en `ingenieria.md`, que lo deja como riesgo a verificar en la implementación,
  no como algo ya resuelto por copiar `AppHeader.vue`.
- **Impacto en producto:** ninguno — F-002 ya lo especifica así.

## Preguntas

Ninguna abierta.
