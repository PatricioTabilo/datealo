# Misión: foto de perfil de profesional — Experiencia

**Estado:** en revisión

**Última actualización:** 2026-08-31

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: un círculo de foto, en tres lugares que ya existen

Esta misión no agrega ninguna vista nueva. Modifica tres vistas que ya construyeron las misiones 04, 05 y
06: dónde el profesional sube su foto, y dónde el buscador la ve en vez de las iniciales. El único flujo
real es la subida — mismo patrón que "Fotos de tus trabajos" (misión 04), con un solo círculo en vez de
una grilla.

La incertidumbre que sí hubo: `producto.md` dice que la foto de perfil va "en el mismo lugar donde hoy se
ven las iniciales", pero ese lugar solo existe cuando el profesional no cargó ninguna foto de trabajo — si
cargó, el carrusel de trabajos ocupa ese espacio entero y no hay ningún círculo ahí. Se resuelve en
[UX-001](#ux-001).

- **Funcionalidades cubiertas:** F-001, F-002.
- **Pendiente bloqueante:** ninguna.

## Vistas

Ninguna es nueva — las tres ya existen y esta misión les agrega o modifica una pieza.

- **V-003 de la misión 04 — Editar perfil** (`/profesional/perfil.vue`) · móvil · resuelve
  [F-001](./producto.md#f-001) · flujos UXF-001
  - modo **sin foto de perfil** — un círculo punteado con ícono de cámara, igual de alcanzable que el
    botón "+" de fotos de trabajo
  - modo **con foto de perfil** — la foto reemplaza el círculo punteado; "Quitar foto" debajo
- **V-001 de la misión 05 — Perfil público** (`/profesionales/[id].vue`) · móvil / desktop · resuelve
  [F-002](./producto.md#f-002)
  - modo **con foto de perfil, sin fotos de trabajo** — el círculo grande que hoy muestra iniciales pasa a
    mostrar la foto de perfil (sin cambio de tamaño ni posición)
  - modo **con foto de perfil, con fotos de trabajo** — un círculo chico junto al nombre, nuevo, porque el
    carrusel de trabajos ya ocupa el lugar del círculo grande (ver [UX-001](#ux-001))
  - modo **sin foto de perfil** — igual que hoy, sin cambios
- **V-001 de la misión 06 — Resultados de búsqueda** (`/buscar`) · móvil / desktop · resuelve
  [F-002](./producto.md#f-002)
  - modo **con foto de perfil** — la foto reemplaza el círculo de iniciales de la card, mismo tamaño y
    posición
  - modo **sin foto de perfil** — igual que hoy, sin cambios

  Sin frame desktop propio: el cambio es interno a una card cuyo grid desktop ya construyó la misión 06
  sin tocar — a diferencia del perfil público, acá no hay ninguna pregunta de dónde va el elemento nuevo.

## Mapa de estados

Solo V-003 (misión 04) tiene transiciones nuevas — los otros dos modos cambian solo qué se dibuja, no a
dónde se navega.

| Desde              | Acción                    | Queda en            | Qué pasa con el trabajo                  |
| ------------------- | -------------------------- | -------------------- | ------------------------------------------- |
| sin foto de perfil  | toca el círculo punteado  | subiendo             | ninguno — recién se abre el selector de archivo |
| subiendo            | la subida termina bien    | con foto de perfil  | la foto queda guardada, visible de inmediato |
| subiendo            | la subida falla            | sin foto de perfil  | nada se guardó; el mensaje de error queda visible hasta el próximo intento |
| con foto de perfil  | toca la foto               | subiendo             | la foto anterior sigue visible mientras sube la nueva |
| con foto de perfil  | toca "Quitar foto"         | sin foto de perfil  | la foto se borra de inmediato, sin confirmación adicional |

## UXF-001 — Subir la foto de perfil

**Objetivo:** que el profesional deje una foto de su cara asociada a su perfil, distinta de sus fotos de
trabajo. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** el profesional está en "Editar perfil" (V-003 de la misión 04), la misma pantalla
donde ya sube y borra fotos de trabajo. No hay otro punto de entrada — no se pide al completar el registro
(V-002 de la misión 04), porque `producto.md` ya la describe como algo que se agrega "al completar o
editar" el perfil, nunca como paso obligatorio antes de publicar.

**Criterio de término:** la foto aparece dentro del círculo, reemplazando el ícono de cámara — sin ningún
mensaje de confirmación aparte, igual que al subir una foto de trabajo hoy.

**Cómo sabe el usuario dónde está:** el círculo mismo. Punteado y con ícono de cámara si no hay foto, con
la foto real si ya subió una — nunca un estado intermedio ambiguo entre los dos.

### Salidas

| Salida                       | Cómo se ejecuta                          | Qué queda del trabajo                        |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| Sube la foto                    | elige un archivo en el selector nativo      | la foto queda guardada y visible                 |
| Cierra el selector sin elegir   | cancela el picker nativo del sistema        | nada cambia, sigue en el mismo modo              |
| Se va de la pantalla mientras sube | navega a otra parte durante la subida    | la subida sigue en curso; al volver, el resultado ya está aplicado (mismo comportamiento que las fotos de trabajo hoy) |

### Secuencia principal

| Paso | Acción                                              | Respuesta del sistema                                                       | Información visible |
| ---- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| —    | (antes de tocar nada)                                     | —                                                                                   | "Foto de perfil" arriba del círculo, "Para que te reconozcan antes de escribirte. Opcional." al lado — visible desde que se entra a la pantalla |
| 1    | El profesional toca el círculo punteado                  | Se abre el selector de archivos nativo del sistema                                | Sin cambios todavía |
| 2    | Elige una foto de su galería                              | El círculo muestra un spinner mientras sube (mismo comportamiento que fotos de trabajo) | El círculo punteado se reemplaza por el spinner |
| 3    | La subida termina bien                                    | La foto real reemplaza el spinner; debajo aparece "Toca la foto para cambiarla" y "Quitar foto" | La foto, ya guardada |
| 3b   | (alternativa) La subida falla                              | El círculo vuelve a punteado; mensaje "No pudimos subir la foto. Intenta de nuevo." | El mismo mensaje que ya usan las fotos de trabajo |

### Variantes y recuperación

| Condición                          | Qué cambia                          | Cómo se entiende                                              | Cómo se recupera                    |
| ---------------------------------- | ------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------- |
| La subida falla (red o servidor)   | Vuelve al círculo punteado           | "No pudimos subir la foto. Intenta de nuevo." debajo del círculo   | Tocar el círculo de nuevo, mismo paso 1 |
| Reemplaza una foto ya subida        | La anterior sigue visible mientras sube la nueva | El spinner se dibuja sobre la foto actual, no sobre un círculo vacío | Ninguna — es el camino principal, no un error |
| Quita la foto                       | Vuelve al círculo punteado, sin confirmación | El cambio es inmediato, igual que borrar una foto de trabajo hoy   | Volver a subir una si se arrepiente     |

### Decisiones que no deben quedar implícitas

- Quitar la foto no pide confirmación — mismo criterio que borrar una foto de trabajo hoy (la papelera del
  bucket, no una acción destructiva sobre el perfil completo).
- No hay editor de recorte ni preview antes de confirmar — la foto elegida en el selector nativo se sube
  tal cual, mismo patrón que fotos de trabajo (`producto.md`, Restricciones aceptadas).
- Subir una foto nueva reemplaza la anterior sin dejar historial — no hay "fotos de perfil anteriores" que
  recuperar.
- Tocar la foto ya subida la reemplaza directo, sin pasar por "Quitar foto" primero — a diferencia de
  fotos de trabajo (donde hay que borrar y volver a tocar "+"), acá tiene sentido porque es una sola foto,
  no una grilla: no hay ninguna otra que se pueda confundir con la que se está reemplazando.
- "Quitar foto" es texto subrayado chico, pero su área de toque real llega a los ~40px con padding
  invisible alrededor del texto — mismo criterio que el botón de borrar una foto de trabajo (24px), nunca
  solo el ancho visual de la palabra.

## Estados por superficie

| Estado                                                             | Qué se muestra (texto e información real)                                                | Acción disponible |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| V-003 (misión 04), sin foto de perfil                                | Círculo punteado con ícono de cámara + "Para que te reconozcan antes de escribirte. Opcional." | Tocar el círculo        |
| V-003 (misión 04), subiendo                                          | Spinner dentro del círculo                                                                     | Ninguna                |
| V-003 (misión 04), con foto de perfil                                | La foto real + "Toca la foto para cambiarla" + "Quitar foto"                                   | Tocar la foto, o "Quitar foto" |
| V-003 (misión 04), error de subida                                   | Círculo punteado + "No pudimos subir la foto. Intenta de nuevo."                               | Tocar el círculo de nuevo |
| V-001 (misión 05), con foto de perfil y sin fotos de trabajo         | El círculo grande de "Marcelo Rojas" muestra su foto real en vez de "MR"                        | Tocar para ver la foto ampliada, igual que hoy |
| V-001 (misión 05), con foto de perfil y con fotos de trabajo         | El carrusel de trabajos se ve igual que hoy; junto al nombre aparece un círculo chico con la foto real, con un anillo claro que lo separa del fondo de la foto detrás | Ninguna — es informativo |
| V-001 (misión 05), sin foto de perfil                                | Igual que hoy, sin ningún elemento nuevo (ejemplo: "Héctor Silva" sigue mostrando "HS")          | — |
| V-001 (misión 06), con foto de perfil                                | La card de "Marcelo Rojas" muestra su foto real en el círculo, mismo lugar que "MR" hoy         | Tocar la card, igual que hoy |
| V-001 (misión 06), sin foto de perfil                                | Igual que hoy, sin ningún elemento nuevo (ejemplo: "Héctor Silva" sigue mostrando "HS")          | — |

## Mockups

| Mockup        | Cubre                                                     | Estado    | Ruta                                    |
| ---------------- | -------------------------------------------------------------- | ----------- | -------------------------------------------- |
| foto-perfil     | UXF-001 (móvil), F-002 (móvil, más un frame desktop del perfil público) | validado    | `./design-mockups/foto-perfil.html`          |

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                        | Estado    |
| ------------- | ------- | -------------------------------------------------------------------------- | --------- |
| F-001         | UXF-001 | sin foto, subiendo, con foto, error                                        | en revisión |
| F-002         | —       | con foto (con y sin fotos de trabajo, en perfil y resultados), sin foto    | en revisión |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El avatar chico junto al nombre solo aparece cuando el carrusel de trabajos ya ocupa el lugar del círculo grande

- **Estado:** aceptada. **Fecha:** 2026-08-31.
- **Sustento:** [F-002](./producto.md#f-002) dice que la foto de perfil va "en el mismo lugar donde hoy se
  ven las iniciales" — pero ese lugar (el círculo grande de `ProfessionalPublicPhotos.vue`) solo existe
  cuando el profesional no cargó ninguna foto de trabajo. Con fotos de trabajo cargadas, el carrusel ocupa
  ese espacio entero y hoy no hay ningún círculo de iniciales visible en absoluto.
- **Alternativas descartadas:** (a) agregar el círculo chico siempre, tenga o no fotos de trabajo —
  descartada porque cuando no hay fotos de trabajo ya existe el círculo grande con la misma foto, y
  mostrar la cara dos veces en la misma pantalla no agrega información, solo ruido; (b) reemplazar el
  círculo grande de iniciales por el carrusel de trabajos con la foto de perfil superpuesta como badge
  fijo — descartada porque cambia el layout ya construido y aprobado de la misión 05 para un caso que el
  círculo chico ya resuelve sin tocarlo.
- **Decisión y consecuencia:** el círculo chico junto al nombre (V-001 de la misión 05) se dibuja solo
  cuando `photoPaths` no está vacío (el carrusel de trabajos está activo) **y** existe `avatarPath`. Lleva
  un anillo claro alrededor (contraste contra `--ui-bg`, luego el borde) porque el fondo detrás es la foto
  de trabajo del carrusel, no un color plano — sin el anillo, un avatar claro sobre una foto clara se
  pierde. En cualquier otro caso, el comportamiento de hoy no cambia.
- **Impacto en producto:** ninguno — es una precisión de dónde vive el elemento que F-002 ya describe, no
  un cambio de qué se muestra.

## Preguntas

Ninguna abierta.

| ID      | La duda                                                        | Estado              | Respuesta, o quién la resuelve |
| ------- | ------------------------------------------------------------------ | ------------------- | ------------------------------------ |
| UXQ-001 | ¿Dónde va la foto de perfil cuando el carrusel de trabajos ya ocupa el lugar de las iniciales? | resuelta 2026-08-31 | Círculo chico junto al nombre, ver [UX-001](#ux-001) |
