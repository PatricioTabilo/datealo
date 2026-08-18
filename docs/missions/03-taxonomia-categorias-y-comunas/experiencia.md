# Misión 03: taxonomía de categorías y comunas — Experiencia

**Estado:** en revisión

**Última actualización:** 2026-08-17

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: un componente de búsqueda con catálogo cerrado, no una pantalla

Esta misión no tiene una vista propia — no hay una URL a la que alguien navegue. Lo que `producto.md`
(D-004) pide es un **componente** que se embebe donde haga falta elegir categoría o comuna: el formulario
de registro (misión 04) y el filtro de búsqueda (misión 06). Por eso esta sección reemplaza "Vistas y
flujos de pantalla completa" por el diseño del componente mismo — sus modos son los mismos sin importar
dónde se use.

El modelo de interacción es un campo de búsqueda con autocompletado, al estilo del selector de comuna de
Mercado Libre que mencionaste: se escribe, aparecen coincidencias del catálogo debajo, se elige una — nunca
queda un valor sin elegir de la lista. En Nuxt UI (A-004) esto es `UInputMenu`, que ya trae el
comportamiento de búsqueda resuelto — no hay que inventar la mecánica, solo especificar el contenido y las
reglas.

- **Decisiones cubiertas:** [D-004](./producto.md#d-004) (categoría/comuna siempre son referencia al
  catálogo), [D-001](./producto.md#d-001) y [D-002](./producto.md#d-002) (qué contiene cada catálogo, el
  campo `activa`).
- **Pendiente bloqueante:** ninguna.

## Componente — no es una vista propia

- **C-001 — `ComunaSelect` / `CategoriaSelect`** · móvil / desktop · resuelve D-004 · flujo UXF-001 ·
  en revisión
  - modo **cerrado** — el campo muestra el valor elegido (si hay uno) o el placeholder; nada más en
    pantalla.
  - modo **abierto sin texto** — el usuario tocó el campo; aparece debajo la lista completa de opciones
    disponibles (comunas `activa = true`, o las 8 categorías), sin necesitar escribir nada.
  - modo **abierto con coincidencias** — el usuario escribió algo; la lista se filtra en vivo a las
    opciones que contienen el texto, sin distinguir mayúsculas ni tildes.
  - modo **sin coincidencias** — lo que escribió no matchea ninguna opción del catálogo.
  - modo **cargando** — primera carga del catálogo (solo la primera vez que se abre el campo en la sesión).
  - modo **error** — la carga del catálogo falló.

Los dos componentes (`ComunaSelect`, `CategoriaSelect`) comparten estos seis modos — la única diferencia es
el tamaño del catálogo que filtran (8 categorías siempre activas vs. las comunas `activa = true`, hoy
alrededor de 33: Gran Santiago + Puerto Varas) y el placeholder.

## Mapa de estados

| Desde                   | Acción                              | Queda en                | Qué pasa con el trabajo                          |
| ------------------------ | ------------------------------------ | ------------------------ | -------------------------------------------------- |
| cerrado                  | toca el campo                        | abierto sin texto        | si ya había un valor, queda precargado como texto para editar |
| abierto sin texto        | escribe una letra                    | abierto con coincidencias o sin coincidencias | el texto tipeado se conserva mientras escribe |
| abierto con coincidencias | toca/selecciona una opción           | cerrado                  | el valor elegido queda guardado con su id de catálogo |
| sin coincidencias         | borra el texto                       | abierto sin texto        | vuelve a mostrar el catálogo completo               |
| sin coincidencias         | toca una opción de la lista completa debajo del mensaje | cerrado | igual que seleccionar con coincidencias — el catálogo completo sigue visible aunque no matchee lo escrito |
| abierto (cualquier modo) | toca fuera del campo, sin seleccionar | cerrado                 | si ya había un valor previo, se restaura; si no, queda vacío — el texto tipeado sin seleccionar se descarta |
| cargando                 | termina la carga                     | abierto sin texto        | ninguno — recién ahí aparece la lista               |
| error                    | toca "Reintentar"                    | cargando                 | ninguno                                             |

## UXF-001 — Elegir categoría o comuna desde el catálogo

**Objetivo:** que la persona termine con un valor de categoría o comuna válido, sin poder guardar texto que
no exista en el catálogo. **Contrato:** [D-004](./producto.md#d-004).

**Punto de entrada:** cualquier formulario que necesite un valor de categoría o comuna. Hoy no hay ninguno
construido — este documento especifica el componente para que la misión 04 (registro) y la misión 06
(búsqueda) lo embeban igual, sin diseñarlo cada una por su lado.

**Criterio de término:** el campo tiene un valor elegido de la lista, identificado por su id de catálogo —
no basta con que el texto visible coincida con el nombre de una opción.

**Cómo sabe el usuario dónde está:** el campo cerrado muestra el valor elegido como texto legible (el
nombre de la categoría o comuna, nunca un id). Mientras está abierto, la opción resaltada por teclado o por
hover queda visualmente distinta del resto de la lista.

### Salidas

| Salida                              | Cómo se ejecuta                          | Qué queda del trabajo                            |
| ------------------------------------ | ------------------------------------------ | --------------------------------------------------- |
| Termina bien                        | toca/selecciona una opción de la lista    | el valor queda aplicado en el campo, cerrado        |
| Descarta sin seleccionar            | toca fuera del campo (blur), tecla Esc    | vuelve al valor que tenía antes, o queda vacío — nunca guarda el texto tipeado |
| Abandona sin cerrar (navega afuera) | cierra la pestaña, va a otra pantalla     | lo maneja el formulario que contiene el componente (misión 04/06), no este documento |

### Secuencia principal

| Paso | Acción                                    | Respuesta del sistema                                                | Información visible |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------ | ---------------------- |
| 1    | Toca el campo (vacío o con un valor previo) | Se abre la lista completa de opciones disponibles debajo del campo       | Todas las opciones del catálogo activo, en orden alfabético |
| 2    | Escribe (opcional)                          | La lista se filtra en vivo a las opciones que contienen el texto, sin distinguir mayúsculas ni tildes | Solo las opciones que matchean, resaltando la parte del texto que coincide |
| 3    | Toca/selecciona una opción                  | El campo se cierra mostrando ese valor; aparece un ícono para volver a abrirlo | El valor elegido, en texto legible |

### Variantes y recuperación

| Condición                             | Qué cambia                                              | Cómo se entiende                                  | Cómo se recupera |
| ---------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| Lo que escribió no matchea nada          | Aparece "No encontramos '<texto>'" arriba de la lista completa | El mensaje nombra exactamente lo que se escribió, no un genérico | Puede seguir escribiendo o tocar cualquier opción de la lista completa que sigue debajo |
| El catálogo activo es chico (hoy ~33 comunas, 8 categorías) | La lista completa cabe sin scroll largo | No aplica — es el caso normal, no un estado especial | No aplica |
| Conexión lenta al cargar el catálogo por primera vez | Skeleton de 4 líneas con la forma de una opción, no spinner | El skeleton ocupa el mismo espacio que la lista real, para que no salte el layout | Se resuelve solo cuando termina la carga |
| Falla la carga del catálogo              | El campo muestra "No pudimos cargar las comunas" con botón "Reintentar" | Mensaje visible en el lugar donde iría la lista | Tocar "Reintentar" vuelve a modo cargando |
| Intenta continuar el formulario sin seleccionar nada | El botón de acción principal del formulario permanece deshabilitado | El botón se ve visualmente inactivo, no aparece un error al tocarlo | Completar la selección habilita el botón |

### Decisiones que no deben quedar implícitas

- Si ya había un valor elegido y el usuario vuelve a tocar el campo, el valor previo se precarga como
  texto editable — no se borra a ciegas ni obliga a escribir desde cero.
- El componente nunca ofrece "crear" una opción que no está en el catálogo — a diferencia de un combobox
  genérico que a veces agrega "crear '<texto>'", acá esa opción no existe, es la garantía de D-004.
- Una comuna con `activa = false` no aparece en absoluto en la lista — no se muestra deshabilitada ni con
  una nota, simplemente no está (ver [CL-004](./producto.md) de producto).

## Estados por superficie

| Estado                 | Qué se muestra (texto e información real)                         | Acción disponible                     |
| ------------------------ | --------------------------------------------------------------------- | ---------------------------------------- |
| cerrado, sin valor        | Placeholder: "¿Qué comuna buscas?" (ComunaSelect) o "¿Qué necesitas?" (CategoriaSelect) | Tocar para abrir |
| cerrado, con valor        | El nombre elegido, ej. "Ñuñoa" o "Gasfitería"                        | Tocar para cambiar                       |
| abierto, lista completa   | Todas las opciones activas, orden alfabético, ej. "Cerrillos", "Conchalí", "Estación Central"... | Escribir o tocar una opción |
| abierto, sin coincidencias | "No encontramos 'nunoaa'" + la lista completa debajo                | Seguir escribiendo o tocar una opción del catálogo |
| carga                    | Skeleton de 4 líneas con la forma de una opción                      | Ninguna                                  |
| error                    | "No pudimos cargar las comunas. Inténtalo de nuevo."                 | Botón "Reintentar"                       |

## Mockups

| Mockup         | Cubre   | Estado    | Ruta                                            |
| ---------------- | ------- | --------- | -------------------------------------------------- |
| Selector de comuna | UXF-001 | validado | `./design-mockups/comuna-select.html`             |

## Cobertura

| Decisión | Flujo   | Estados cubiertos                                                 | Estado  |
| --------- | ------- | --------------------------------------------------------------------- | ------- |
| D-004     | UXF-001 | cerrado, abierto sin texto, abierto con coincidencias, sin coincidencias, carga, error | vigente |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El componente muestra el catálogo completo al abrir, no espera a que se escriba algo

- **Estado:** aceptada. **Fecha:** 2026-08-17.
- **Sustento:** D-002 — con solo ~33 comunas activas y 8 categorías, obligar a escribir antes de ver
  cualquier opción agrega un paso sin necesidad; el catálogo es chico a propósito (cold start).
- **Alternativas descartadas:** no mostrar nada hasta que el usuario escriba al menos una letra (patrón
  común en catálogos grandes tipo Thumbtack) — tiene sentido con miles de opciones, no con 33; acá solo
  agrega fricción a alguien que quiere tocar y elegir de una lista corta y reconocible.
- **Decisión y consecuencia:** tocar el campo, sin escribir nada, ya muestra la lista completa de opciones
  activas. Escribir es un atajo para achicarla, no un requisito para verla.
- **Impacto en producto:** ninguno — es una decisión de interacción, no cambia D-001/D-002/D-004.

## Preguntas

Ninguna abierta.
