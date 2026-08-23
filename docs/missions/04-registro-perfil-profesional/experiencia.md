# Misión 04: registro y perfil de profesional — Experiencia

**Estado:** en revisión

**Última actualización:** 2026-08-23

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: un formulario corto que publica solo, y una sola pantalla de edición para todo lo demás

Don Héctor entra con su email (D-001, enlace mágico — nunca una contraseña), completa 4 campos y queda
publicado en el acto (D-002). De ahí en más no hay "registro" y "perfil" como dos cosas separadas para él:
hay una sola pantalla de edición (F-002, ya fusionó lo que antes eran F-002 y F-004 en producto.md) donde
cambia cualquier dato — nombre, categoría, comuna, contacto, fotos, descripción, precio — las veces que
quiera, sin que nada de eso lo oculte del buscador mientras lo hace.

Lo que sigue abierto es el detalle del formulario de registro en sí: cuántos campos van en una sola
pantalla scrolleable vs. varios pasos con barra de progreso. Se resuelve en UXF-002 con una decisión
explícita (UX-001), no queda implícito.

- **Funcionalidades cubiertas:** F-001, F-002, F-003.
- **Pendiente bloqueante:** ninguna.

## Vistas

- **V-001 — Iniciar sesión** · móvil · resuelve [D-001](./producto.md#d-001) · flujos UXF-001
  - modo **ingresar email** — el único campo, sin contraseña en ningún lado
  - modo **formato de email inválido** — escribió un email mal formado y tocó "Enviar enlace"
  - modo **revisa tu correo** — el enlace ya se mandó, esperando que lo toque
  - modo **enlace inválido o expirado** — volvió a la app por un enlace viejo o ya usado

- **V-002 — Registro de profesional** · móvil · resuelve [F-001](./producto.md#f-001) · flujos UXF-002
  - modo **formulario** — los 5 campos, en una sola pantalla scrolleable
  - modo **enviando** — tocó "Publicar mi perfil", esperando la respuesta del servidor
  - modo **error al enviar** — falló el servidor, no un error de validación (esos son inline)

- **V-003 — Editar perfil** · móvil · resuelve [F-002](./producto.md#f-002) · flujos UXF-002 (continuación),
  UXF-003
  - modo **vacío** — recién publicado, sin fotos, descripción ni precio todavía
  - modo **con datos** — ya tiene algo cargado, editable campo por campo
  - modo **editando un campo** — tocó un campo, se volvió input in-place con el valor actual precargado
  - modo **formato inválido al escribir** — escribió un contacto sin formato de teléfono válido, no deja
    guardar hasta corregir
  - modo **guardando** — salió del campo con un valor nuevo, esperando confirmación
  - modo **error al guardar** — un cambio no se pudo guardar

## Mapa de estados

| Desde                        | Acción                                       | Queda en                     | Qué pasa con el trabajo |
| ----------------------------- | --------------------------------------------- | ------------------------------ | -------------------------- |
| V-001 modo ingresar email     | escribe su email, toca "Enviar enlace"        | V-001 modo revisa tu correo    | el email queda guardado en la sesión, no se reenvía si vuelve a esta pantalla |
| V-001 modo ingresar email     | escribe un email mal formado, toca "Enviar enlace" | V-001 modo formato de email inválido | el texto escrito se mantiene en el campo para corregirlo, no se envía nada |
| V-001 modo formato de email inválido | corrige el email, toca "Enviar enlace" de nuevo | V-001 modo revisa tu correo    | sigue el flujo normal, como si no hubiera fallado |
| V-001 modo revisa tu correo   | toca el enlace desde su correo                | V-003 modo con datos (si ya tenía cuenta) o V-002 modo formulario (si el email no tiene cuenta todavía) | ninguno — recién entra |
| V-001 modo revisa tu correo   | el enlace expiró (pasaron más de 60 min) o ya se usó | V-001 modo enlace inválido o expirado | ninguno |
| V-001 modo enlace inválido    | toca "Enviar uno nuevo"                       | V-001 modo ingresar email      | vuelve a empezar, sin dato previo que conservar |
| V-002 modo formulario         | completa los 5 campos, toca "Publicar mi perfil" | V-002 modo enviando         | los datos del formulario se conservan mientras espera |
| V-002 modo enviando           | el servidor confirma                          | V-003 modo vacío               | el perfil ya existe y está `activa = true`; llega el correo de F-003 en paralelo |
| V-002 modo enviando           | el servidor falla                             | V-002 modo error al enviar     | los datos del formulario se conservan, nada se pierde |
| V-002 modo error al enviar    | toca "Reintentar"                             | V-002 modo enviando            | reintenta con los mismos datos, sin que los vuelva a escribir |
| V-002 modo formulario         | ya existe un perfil suyo al tocar "Publicar" (CL-003, doble envío) | V-003 modo con datos, con un aviso | nada del formulario se guarda — pero tampoco se pierde nada, es su perfil ya existente |
| V-003 modo vacío o con datos  | toca un campo                                 | V-003 modo editando un campo   | el valor actual queda precargado como punto de partida del input |
| V-003 modo editando un campo  | escribe y sale de foco / toca "Listo"          | V-003 modo guardando           | el valor anterior sigue visible hasta confirmar |
| V-003 modo editando un campo  | sale de foco sin cambiar el valor              | V-003 modo con datos           | no dispara guardado — nada cambió |
| V-003 modo editando un campo (Contacto) | escribe un valor sin formato de teléfono válido, sale de foco / toca "Listo" | V-003 modo formato inválido al escribir | el valor escrito se mantiene en el campo para corregirlo, no se envía al servidor |
| V-003 modo formato inválido al escribir | corrige el valor, sale de foco / toca "Listo" (ahora válido) | V-003 modo guardando           | sigue el flujo normal, como si no hubiera fallado |
| V-003 modo guardando          | el servidor confirma                          | V-003 modo con datos           | el cambio ya es público de inmediato |
| V-003 modo guardando          | el servidor falla                             | V-003 modo error al guardar    | el valor anterior se mantiene visible; el cambio no se pierde, queda para reintentar |
| V-003 (cualquier modo)        | se va a WhatsApp o cierra la pestaña sin guardar un campo a medio escribir | V-003 modo con datos (al volver) | los campos ya guardados quedan; el que estaba a medio escribir sin confirmar se descarta |

## UXF-001 — Iniciar sesión con enlace mágico

**Objetivo:** entrar a Datealo sin contraseña, para completar el registro o volver a editar un perfil ya
creado. **Contrato:** [D-001](./producto.md#d-001).

**Punto de entrada:** don Héctor toca "Soy profesional" desde la landing, o vuelve a datealo.cl semanas
después para actualizar su perfil — mismo punto de entrada en ambos casos, la app no distingue "primera
vez" de "ya tengo cuenta" hasta que el enlace se toca.

**Criterio de término:** don Héctor está autenticado y en V-002 (si es la primera vez) o V-003 (si ya
tenía un perfil).

**Cómo sabe el usuario dónde está:** en "revisa tu correo", el email que escribió queda visible arriba del
mensaje ("Te mandamos un enlace a hector@gmail.com") — para que sepa a cuál correo tiene que ir a mirar sin
tener que recordarlo.

### Salidas

| Salida                          | Cómo se ejecuta                     | Qué queda del trabajo |
| ---------------------------------- | -------------------------------------- | ------------------------- |
| Termina bien                       | toca el enlace del correo              | queda autenticado, en V-002 o V-003 |
| Cierra la app sin tocar el enlace  | cierra la pestaña o la app             | el email escrito se pierde; puede volver a empezar cuando quiera, sin penalidad |
| El enlace expira o ya se usó       | pasaron 60 min, o lo tocó dos veces    | ve el modo "enlace inválido", con la opción de pedir uno nuevo |

### Secuencia principal

| Paso | Acción                                  | Respuesta del sistema                                          | Información visible |
| ---- | ------------------------------------------ | -------------------------------------------------------------------- | ----------------------- |
| 1    | Escribe su email, toca "Enviar enlace"      | Datealo manda el correo (Resend/Supabase Auth) y cambia a "revisa tu correo" | "Te mandamos un enlace a hector@gmail.com. Ábrelo desde este mismo celular." |
| 2    | Abre su app de correo, toca el enlace       | Se abre Datealo de nuevo, ya autenticado                             | Pantalla de destino (V-002 o V-003) directamente, sin pantalla intermedia de "bienvenido" |

### Variantes y recuperación

| Condición                          | Qué cambia                                  | Cómo se entiende                          | Cómo se recupera |
| --------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | --------------------- |
| Escribe un email mal formado (sin @, dominio incompleto) | El botón "Enviar enlace" no manda nada | El campo se marca en rojo + "Ese correo no parece válido — revisa que esté bien escrito" bajo el campo | Corrige el texto ahí mismo, sin perder lo que ya había escrito |
| El enlace se abre en otro navegador/dispositivo del que lo pidió | Igual funciona — Supabase Auth no exige que sea el mismo browser | No hay ningún aviso especial, simplemente entra | No aplica, funciona igual |
| El enlace ya expiró (+60 min) o ya se usó | No autentica                                | "Este enlace ya no funciona" + botón "Enviar uno nuevo" | Vuelve a V-001 modo ingresar email |
| El correo no llega (falla de Resend/spam) | No hay forma de que Datealo lo detecte en el momento | Después de un minuto sin nada, se muestra "¿No te llegó? Revisa spam o pide otro enlace" bajo el mensaje principal | Botón "Enviar otro enlace" reintenta sin perder el email ya escrito |

### Decisiones que no deben quedar implícitas

- El botón "Enviar enlace" queda deshabilitado mientras se procesa el envío, para que no se manden dos
  correos por doble click.
- Si don Héctor pide un segundo enlace antes de que expire el primero, el primero deja de servir — solo el
  más reciente es válido (comportamiento estándar de Supabase Auth, no algo que Datealo decide a mano).
- El email valida formato antes de enviar nada — es el único dato de D-001, un typo ahí significa que el
  enlace mágico nunca le llega a nadie (ni a él, ni a un error obvio de otra persona) y don Héctor se queda
  sin saber por qué.

## UXF-002 — Registrarse y quedar publicado

**Objetivo:** completar el registro y llegar a un perfil ya visible en el buscador, sin aprobación de
nadie. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** don Héctor llega recién autenticado por primera vez (UXF-001), sin ningún perfil
todavía asociado a su email.

**Criterio de término:** su perfil existe con `activa = true`, y está en V-003 modo vacío, invitado a
completarlo — no una pantalla de "gracias por registrarte" separada.

**Cómo sabe el usuario dónde está:** el título de la pantalla ("Crea tu perfil") y una barra de progreso
simple bajo el título (ver [UX-001](#ux-001)) le confirman que está en el registro, no ya editando un
perfil existente.

### Salidas

| Salida                             | Cómo se ejecuta                          | Qué queda del trabajo |
| --------------------------------------- | -------------------------------------------- | -------------------------- |
| Termina bien                            | completa los 5 campos, toca "Publicar mi perfil" | el perfil se crea y publica; pasa a V-003 |
| Cierra la app a medio llenar             | cierra la pestaña o navega afuera            | nada se guarda — no hay borrador; tiene que volver a escribir todo si regresa |
| Ya existe su perfil al tocar "Publicar" (CL-003, doble envío) | envía el formulario dos veces (dos pestañas, o un formulario viejo que quedó cargado) | nada del formulario se guarda; va directo a V-003 con un aviso ("Ya tienes un perfil — te llevamos a verlo") |

### Secuencia principal

| Paso | Acción                                        | Respuesta del sistema                                    | Información visible |
| ---- | -------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| 1    | Completa nombre, elige categoría (`CategoriaSelect`), elige comuna (`ComunaSelect`), escribe su contacto (WhatsApp o teléfono) | Cada campo valida en el momento (ej. formato de teléfono) — nunca solo al final | Los 5 campos en una sola pantalla, el botón "Publicar mi perfil" abajo, deshabilitado hasta que los 5 estén completos |
| 2    | Toca "Publicar mi perfil"                          | Botón pasa a estado de carga; a los <2s, Datealo crea el perfil y redirige | Spinner en el botón, sin bloquear el resto de la pantalla |
| 3    | Llega a V-003 modo vacío                           | El correo de confirmación (F-003) se dispara en paralelo, no bloquea la navegación | "¡Listo! Tu perfil ya es visible. Agrega fotos para que la gente confíe más en ti" + los campos de F-002 vacíos, listos para completar |

### Variantes y recuperación

| Condición                     | Qué cambia                              | Cómo se entiende                             | Cómo se recupera |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------------- | --------------------- |
| Falla el servidor al publicar      | No se crea el perfil                         | "No pudimos publicar tu perfil. Tus datos siguen acá" + botón "Reintentar" | Reintenta con los mismos datos, sin volver a escribirlos |
| Ya existe su perfil (CL-003), envió el formulario dos veces | No se crea un perfil duplicado | "Ya tienes un perfil — te llevamos a verlo" en V-003 | No aplica — sigue autenticado, no hay nada que recuperar, solo ve su perfil ya existente |
| Conexión lenta al publicar (>300ms)| El botón muestra un spinner, no toda la pantalla | El resto del formulario sigue visible y legible, no se congela | Si pasa de 10s, mismo mensaje de falla de servidor con "Reintentar" |

### Decisiones que no deben quedar implícitas

- No hay un paso de "revisar antes de publicar" — al completar los 5 campos y tocar el botón, publica
  directo (D-002 ya decidió que no hay aprobación de nadie, ni siquiera del propio don Héctor mirando un
  resumen).
- Los 5 campos van en una sola pantalla scrolleable, no en pasos separados con "Siguiente" — ver
  [UX-001](#ux-001) para el porqué.
- El chequeo de "perfil ya existente" al tocar "Publicar" (CL-003) es una red de seguridad para un doble
  envío del mismo usuario (dos pestañas, formulario viejo) — el email nunca lo escribe en V-002, viene fijo
  de su sesión autenticada (D-001), así que nunca puede ser la cuenta de otra persona. Por eso lleva directo
  a V-003, no de vuelta a V-001 a autenticarse de nuevo.

## UXF-003 — Editar el perfil ya creado

**Objetivo:** que cualquier campo del perfil (los 5 del registro, más fotos, descripción y precio) se
pueda cambiar sin fricción, en cualquier momento. **Contrato:** [F-002](./producto.md#f-002).

**Punto de entrada:** llega desde UXF-002 (recién publicado, modo vacío) o desde UXF-001 (vuelve semanas
después a editar, modo con datos).

**Criterio de término:** no tiene un final — es la pantalla donde don Héctor vuelve cada vez que necesita
cambiar algo. El "término" de una edición puntual es que el campo quede guardado y visible.

**Cómo sabe el usuario dónde está:** cada campo editado muestra un check verde breve (≤1s) al guardarse, y
el estado guardado persiste visible sin necesitar tocar nada más — no hay un botón único de "Guardar todo"
al final de la pantalla, cada campo se guarda por su cuenta.

### Salidas

| Salida                              | Cómo se ejecuta                    | Qué queda del trabajo |
| ------------------------------------ | -------------------------------------- | -------------------------- |
| Guarda un campo y sigue en la pantalla | sale de foco del campo o confirma      | ese campo queda guardado y público de inmediato |
| Se va a WhatsApp a mostrarle el perfil a alguien | toca un enlace externo o cierra la app | todo lo ya guardado se conserva; si había un campo a medio escribir sin confirmar, se pierde ese campo puntual, no el resto |
| Cierra la app entre ediciones        | cierra la pestaña                      | todo lo ya guardado se conserva — no hay "sesión de edición" que expire |

### Secuencia principal

| Paso | Acción                                   | Respuesta del sistema                                | Información visible |
| ---- | --------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| 1    | Toca el campo que quiere cambiar (ej. precio) | El campo se vuelve editable in-place, sin abrir otra pantalla | El resto del perfil sigue visible arriba/abajo |
| 2    | Escribe el nuevo valor, sale del campo (blur) o toca "Listo" en el teclado | Datealo guarda automático, sin pedir confirmación aparte | Check verde breve junto al campo, luego el valor nuevo queda mostrado normal |
| 3    | (para fotos) Toca "+ Agregar foto"            | Abre el selector nativo de fotos del celular                | Miniaturas de las fotos ya subidas, con opción de borrar cada una |

### Variantes y recuperación

| Condición                          | Qué cambia                                | Cómo se entiende                            | Cómo se recupera |
| ---------------------------------------- | ---------------------------------------------- | -------------------------------------------------- | --------------------- |
| Falla el guardado de un campo            | El valor vuelve al anterior, no se queda a medias | Ícono de error junto al campo + "No se pudo guardar, toca para reintentar" | Toca el campo de nuevo, reintenta con el valor que había escrito |
| Escribe el Contacto sin formato de teléfono válido | No llega a guardarse — ni siquiera lo intenta | El input se marca en rojo + "Ese número no parece válido" bajo el campo, mientras sigue escribiendo | Corrige el valor ahí mismo; recién ahí sale de foco y guarda |
| Cambia categoría o comuna (campos del registro) | Mismo mecanismo in-place que cualquier otro campo — no hay un flujo distinto ni una advertencia especial | Mismo check verde al guardar | Igual que cualquier campo |
| Perfil sin fotos todavía (modo vacío, CL-001) | La sección de fotos muestra un espacio invitando a subir, no un error | "Agrega fotos de tus trabajos — los perfiles con fotos generan más confianza" con el botón "+ Agregar foto" destacado | No aplica — es el estado esperado al llegar de UXF-002 |
| Perfil sin descripción o precio (CL-002) | Esos campos muestran un ejemplo real como placeholder ("Ej: 'Electricista con 10 años de experiencia en Ñuñoa'", "Ej: Desde $10.000"), nunca un dato inventado ni una instrucción vacía | El placeholder es visualmente distinto al valor real (más claro, cursiva) — y le muestra a don Héctor el formato esperado, no solo que falta completarlo | Toca el placeholder para escribir el valor por primera vez |

### Decisiones que no deben quedar implícitas

- Guardado campo por campo, no un botón único al final — reduce el riesgo de perder varios cambios si
  falla la conexión a mitad de una sesión larga de edición.
- Editar categoría o comuna no dispara ningún aviso de "esto va a cambiar dónde apareces" — la consecuencia
  (aparece en la nueva categoría/comuna, deja de aparecer en la anterior) es directa y esperable, no necesita
  una confirmación extra que ralentice algo tan simple como corregir un dato.
- El campo de categoría o comuna, al tocarlo para editar, abre `CategoriaSelect`/`ComunaSelect` tal cual
  quedaron definidos en misión 03 (su propio comportamiento — buscar, filtrar, elegir de la lista — no se
  rediseña acá). No hay mockup nuevo para ese estado: es el componente ya construido, no una pantalla
  distinta.
- Contacto valida formato de teléfono en el momento, igual que en el registro (UXF-002) — no espera a
  intentar guardar contra el servidor para avisar que el número no sirve. Es el dato que un buscador usa
  para contactar a don Héctor; un contacto mal escrito lo deja invisible sin que nadie lo note.

## Estados por superficie

| Estado                                | Qué se muestra (texto e información real)                                            | Acción disponible |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------- |
| V-002 inicial (formulario vacío)            | Título "Crea tu perfil", los 5 campos vacíos con placeholder, botón deshabilitado            | Completar los campos |
| V-002 error al enviar                       | "No pudimos publicar tu perfil. Tus datos siguen acá — inténtalo de nuevo"                   | "Reintentar" |
| V-003 vacío (recién publicado)              | "¡Listo! Tu perfil ya es visible." + fotos con invitación a completar, descripción con placeholder "Ej: 'Electricista con 10 años de experiencia en Ñuñoa'" y precio con "Ej: Desde $10.000" | "+ Agregar foto", tocar cualquier campo |
| V-003 con datos                             | Encabezado "Héctor Silva · Electricidad · Ñuñoa", 3 fotos, descripción, "Desde $10.000" y tarjeta "Tus datos" con las 4 filas (nombre, categoría, comuna, contacto) | Tocar cualquier campo para editar, incluidos los de "Tus datos" |
| V-003 editando un campo                     | El campo tocado (ej. "Contacto") se vuelve un input con el valor actual precargado, el resto de la pantalla no se mueve | Escribir y salir del campo para guardar |
| V-003 formato inválido al escribir          | El input de Contacto en rojo + "Ese número no parece válido" bajo el campo, el valor escrito se mantiene | Corregir el valor, no se guarda hasta que sea válido |
| V-003 guardando un campo                    | El campo muestra un spinner chico inline, el resto de la pantalla no se bloquea              | Ninguna hasta que termine |
| V-003 error al guardar un campo             | Ícono de error junto al campo + "No se pudo guardar, toca para reintentar"                   | Reintentar ese campo |
| V-001 revisa tu correo                      | "Te mandamos un enlace a hector@gmail.com. Ábrelo desde este mismo celular."                 | "¿No te llegó? Revisa spam o pide otro enlace" (aparece a los 60s) |
| V-001 enlace inválido                       | "Este enlace ya no funciona"                                                                 | "Enviar uno nuevo" |
| V-001 formato de email inválido             | Campo en rojo + "Ese correo no parece válido — revisa que esté bien escrito" bajo el campo    | Corregir el texto y tocar "Enviar enlace" de nuevo |

## Mockups

| Mockup           | Cubre            | Estado      | Ruta |
| ----------------- | ------------------ | ------------- | ------ |
| registro          | UXF-002 (V-002)     | exploración   | `./design-mockups/registro.html` |
| editar-perfil     | UXF-002/UXF-003 (V-003) | exploración | `./design-mockups/editar-perfil.html` |
| iniciar-sesion    | UXF-001 (V-001)     | exploración   | `./design-mockups/iniciar-sesion.html` |

## Cobertura

| Funcionalidad | Flujo    | Estados cubiertos                              | Estado    |
| ------------- | -------- | ----------------------------------------------- | --------- |
| F-001         | UXF-002  | formulario, enviando, error, perfil ya existe por doble envío (CL-003) | borrador |
| F-002         | UXF-003  | vacío (CL-001, CL-002), con datos, editando, formato inválido, guardando, error | borrador |
| F-003         | UXF-002  | correo de confirmación (contenido en la secuencia) | borrador |
| D-001         | UXF-001  | ingresar email, formato inválido, revisa tu correo, enlace inválido | borrador |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El registro es una sola pantalla scrolleable, no varios pasos con "Siguiente"

- **Estado:** aceptada. **Fecha:** 2026-08-22.
- **Sustento:** [D-003 de producto](./producto.md#d-003) (registro sin fricción, 5 campos mínimos).
- **Alternativas descartadas:** wizard de varios pasos (uno por campo, con "Siguiente"/"Atrás") — con solo
  5 campos cortos (uno de ellos un selector, no texto libre a escribir), partirlo en pasos agrega toques y
  pantallas de transición sin reducir el esfuerzo real de completarlo; tiene sentido para formularios
  largos, no para este. Acordeón donde cada campo se expande al tocarlo — agrega una interacción extra
  (expandir) sin necesidad, ya que los 5 campos caben completos en una pantalla de 390px sin abrumar.
- **Decisión y consecuencia:** los 5 campos de F-001 van visibles de una, en orden (email ya viene de la
  sesión de auth, así que en la práctica son 4 campos a completar: nombre, categoría, comuna, contacto), con
  el botón "Publicar mi perfil" fijo abajo (`safe-bottom`), deshabilitado hasta que los 4 estén completos.
- **Impacto en producto:** ninguno — es una decisión de cómo se ve el formulario, no de qué pide.

## Preguntas

Ninguna bloquea — los tres flujos críticos (UXF-001 a UXF-003) están completos con secuencia, variantes y
recuperación.

| ID      | La duda | Estado | Respuesta, o quién la resuelve |
| ------- | ------- | ------ | ------------------------------- |
| —       | —       | —      | sin preguntas abiertas todavía |
