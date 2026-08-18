# Misión 03: taxonomía de categorías y comunas — Experiencia

**Estado:** vigente

**Última actualización:** 2026-08-18. **Aprobado por Patricio el:** 2026-08-18.

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
  vigente
  - modo **cerrado** — el campo muestra el valor elegido (si hay uno) o el placeholder; nada más en
    pantalla.
  - modo **enfocado sin texto** — el usuario tocó el campo; el cursor queda activo, pero no aparece
    ninguna lista todavía — igual que el selector de comuna de Mercado Libre, no se muestra nada hasta
    que se empieza a escribir.
  - modo **abierto con coincidencias** — el usuario escribió al menos una letra; aparece debajo la lista
    filtrada a las opciones que contienen el texto, sin distinguir mayúsculas ni tildes.
  - modo **sin coincidencias** — lo que escribió no matchea ninguna opción del catálogo.
  - modo **cargando** — primera carga del catálogo (solo la primera vez que se abre el campo en la sesión).
  - modo **error** — la carga del catálogo falló.

Los dos componentes (`ComunaSelect`, `CategoriaSelect`) comparten estos seis modos — la única diferencia es
el tamaño del catálogo que filtran (8 categorías siempre activas vs. las comunas `activa = true`, hoy
alrededor de 33: Gran Santiago + Puerto Varas) y el placeholder.

## Mapa de estados

| Desde                   | Acción                              | Queda en                | Qué pasa con el trabajo                          |
| ------------------------ | ------------------------------------ | ------------------------ | -------------------------------------------------- |
| cerrado                  | toca el campo                        | enfocado sin texto       | si ya había un valor, queda precargado como texto para editar; el catálogo empieza a cargar en silencio, sin mostrar nada |
| enfocado sin texto       | escribe una letra, catálogo ya disponible | abierto con coincidencias o sin coincidencias | el texto tipeado se conserva mientras escribe |
| enfocado sin texto       | escribe una letra, catálogo aún cargando | cargando                | el texto tipeado se conserva; el filtro se aplica apenas termine de cargar |
| abierto con coincidencias | toca/selecciona una opción           | cerrado                  | el valor elegido queda guardado con su id de catálogo |
| sin coincidencias         | borra el texto hasta dejarlo vacío  | enfocado sin texto       | la lista desaparece, igual que al enfocar por primera vez |
| abierto (cualquier modo) | toca fuera del campo, sin seleccionar | cerrado                 | si ya había un valor previo, se restaura; si no, queda vacío — el texto tipeado sin seleccionar se descarta |
| cargando                 | termina la carga, sin texto tipeado mientras esperaba | enfocado sin texto | ninguno — el catálogo queda listo para filtrar en cuanto se escriba |
| cargando                 | termina la carga, con texto ya tipeado mientras esperaba | abierto con coincidencias o sin coincidencias | se aplica el filtro sobre el texto que ya estaba escrito |
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
| 1    | Toca el campo (vacío o con un valor previo) | El cursor queda activo; no aparece ninguna lista todavía. El catálogo empieza a cargar en silencio | Si había un valor previo, queda como texto editable; si no, el placeholder |
| 2    | Escribe al menos una letra                  | Aparece debajo la lista filtrada a las opciones que contienen el texto, sin distinguir mayúsculas ni tildes | Solo las opciones que matchean, resaltando la parte del texto que coincide |
| 3    | Toca/selecciona una opción                  | El campo se cierra mostrando ese valor; aparece un ícono para volver a abrirlo | El valor elegido, en texto legible |

### Variantes y recuperación

| Condición                             | Qué cambia                                              | Cómo se entiende                                  | Cómo se recupera |
| ---------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| Lo que escribió no matchea nada          | Aparece "No encontramos '<texto>'" — sin lista debajo, el catálogo no se muestra completo en ningún momento | El mensaje nombra exactamente lo que se escribió, no un genérico | Puede seguir escribiendo o borrar para volver a "enfocado sin texto" |
| Escribe antes de que el catálogo termine de cargar | El campo queda en modo cargando con el texto conservado | Skeleton de 4 líneas en vez de la lista filtrada | El filtro se aplica solo al terminar de cargar, sin que el usuario tenga que volver a escribir |
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
| enfocado, sin texto       | Nada debajo del campo — ni lista ni mensaje, solo el cursor activo   | Escribir                                 |
| abierto, con coincidencias | Las opciones que matchean lo escrito, con la coincidencia resaltada  | Tocar una opción o seguir escribiendo    |
| abierto, sin coincidencias | "No encontramos 'nunoaa'" — sin lista debajo                        | Seguir escribiendo o borrar               |
| carga                    | Skeleton de 4 líneas con la forma de una opción                      | Ninguna                                  |
| error                    | "No pudimos cargar las comunas. Inténtalo de nuevo."                 | Botón "Reintentar"                       |

## Mockups

| Mockup         | Cubre   | Estado    | Ruta                                            |
| ---------------- | ------- | --------- | -------------------------------------------------- |
| Selector de comuna | UXF-001 | validado | `./design-mockups/comuna-select.html`             |

## Cobertura

| Decisión | Flujo   | Estados cubiertos                                                 | Estado  |
| --------- | ------- | --------------------------------------------------------------------- | ------- |
| D-004     | UXF-001 | cerrado, enfocado sin texto, abierto con coincidencias, sin coincidencias, carga, error | vigente |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El componente no muestra nada hasta que el usuario empieza a escribir

- **Estado:** aceptada. **Fecha:** 2026-08-18.
- **Sustento:** D-004 — el modelo de interacción ya declarado ahí es "al estilo del selector de comuna de
  Mercado Libre", y ese selector no abre ninguna lista hasta que se escribe la primera letra. La primera
  versión de esta decisión (mostrar el catálogo completo al enfocar) se apartaba de esa referencia sin un
  motivo de Datealo que lo justificara — era una preferencia mía, no algo pedido.
- **Alternativas descartadas:** mostrar el catálogo completo al enfocar, sin esperar texto (la primera
  versión de esta decisión) — parecía razonable con un catálogo chico (~33 comunas activas, 8 categorías),
  pero se apartaba sin necesidad del patrón de referencia que D-004 ya fijó, y agrega una lista completa en
  pantalla en el primer toque cuando la mayoría de las veces la persona ya sabe qué va a escribir.
- **Decisión y consecuencia:** tocar el campo no muestra nada — ni lista ni mensaje, solo el cursor activo.
  El catálogo se precarga en silencio en ese momento (ver mapa de estados) para que, apenas se escriba la
  primera letra, filtrar sea instantáneo la mayoría de las veces — el modo "cargando" solo aparece si esa
  precarga no alcanzó a terminar.
- **Impacto en producto:** ninguno — es una decisión de interacción, no cambia D-001/D-002/D-004.

## Preguntas

Ninguna abierta.
