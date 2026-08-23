# Misión 04: registro y perfil de profesional — Producto

**Estado:** borrador

**Última actualización:** 2026-08-22

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: un profesional se registra y aparece en el buscador el mismo día

**Resultado:** don Héctor completa su registro desde el celular en un par de minutos, con solo lo mínimo
necesario para ser encontrable (nombre, categoría, comuna, contacto), y su perfil queda visible de
inmediato — sin esperar a que nadie lo apruebe. Fotos, descripción y un precio "desde $X" los agrega cuando
quiera, antes o después de publicarse, sin que eso bloquee nada. Todo el registro (incluidas categoría y
comuna) sigue siendo editable después, si su situación cambia. El precio es solo texto que se muestra en
el perfil — Datealo nunca gestiona ni cobra comisión por el pago del servicio ([D-004](#d-004)).

**Recorte respecto del ideal:** el ideal (ver [investigacion.md](./investigacion.md)) no distingue entre
"registrarse" y "tener un perfil completo" — ambos pasan en el mismo momento. Acá sí se separan: el
registro exige solo 5 campos, el resto del perfil (fotos, precio, descripción) es editable después, en
cualquier momento, sin volver a pasar por el formulario de registro.

**Restricciones aceptadas:** una sola categoría por perfil al lanzamiento — `CategoriaSelect` (misión 03)
guarda un solo valor, no una lista; ampliar a varias categorías es un cambio de componente que esta misión
no fuerza. Sin verificación automatizada de ningún tipo. Autenticación sin contraseña. Sin panel de
administración para activar/desactivar perfiles — mismo criterio manual que categorías y comunas.

## Funcionalidades

| ID    | Funcionalidad                                    | Lado         | Sustento     | Éxito |
| ----- | ------------------------------------------------- | ------------ | ------------ | ----- |
| F-001 | Crear cuenta y quedar publicado de inmediato       | profesional  | C-001, C-002, D-001, D-002 | M-001 |
| F-002 | Editar el perfil: fotos, descripción, precio ("desde $X"), categoría, comuna, nombre y contacto | profesional | C-001, C-005, C-006, D-004 | M-002, M-003 |
| F-003 | Confirmar por correo que el registro funcionó      | profesional  | brief de esta misión (ver README) | M-001 |
| F-004 | *(fusionada en F-002 el 2026-08-22)*               | —            | —                          | —     |

<a id="f-001"></a>

### F-001 — Crear cuenta y quedar publicado de inmediato

Cuando don Héctor decide que quiere que lo encuentren fuera de su círculo,
quiero completar mi registro en un par de minutos desde el celular,
para que mi perfil ya exista sin tener que esperar el visto bueno de nadie.

**Lado del marketplace:** profesional. **Qué necesita del otro lado:** nada para completarse — el registro
funciona igual con cero buscadores activos. Para que le sirva de algo a don Héctor sí necesita que existan
búsquedas en Electricidad + Ñuñoa (o comuna vecina), pero eso no es una condición de esta funcionalidad.

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[D-001](#d-001), [D-002](#d-002). **Éxito:** [M-001](#m-001).

**Reglas:**

- Si don Héctor completa email, nombre, categoría (`CategoriaSelect`), comuna (`ComunaSelect`) y un
  WhatsApp o teléfono de contacto, Datealo crea el perfil con `activa = true` en el mismo paso.
- Si falta cualquiera de esos 5 campos, Datealo no deja enviar el formulario — son los únicos obligatorios,
  no hay más.
- Datealo nunca pide RUT, antecedentes, ni ningún dato que sirva para un background check.
- Si el email ya tiene una cuenta, Datealo lo manda a iniciar sesión en vez de crear un perfil duplicado.
- Al terminar el registro, Datealo lleva a don Héctor directo a la pantalla de F-002 (fotos y precio) — no
  a una pantalla genérica de "listo". Es una invitación, no un paso obligatorio: puede salir de ahí sin
  completar nada y su perfil sigue publicado igual.

**Ejemplo verificable:** dado que don Héctor no tiene ninguna cuenta en Datealo, cuando completa email,
"Héctor Silva", "Electricidad", "Ñuñoa" y su WhatsApp y envía el formulario, entonces su perfil existe con
`activa = true` y aparece si alguien busca "electricista" en Ñuñoa desde ese mismo instante.

**No incluye:** elegir más de una categoría (restricción aceptada de esta entrega), ni ningún paso de
verificación previo a publicarse.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

<a id="f-002"></a>

### F-002 — Editar el perfil: fotos, descripción, precio, categoría, comuna, nombre y contacto

Cuando algo en el perfil de don Héctor deja de reflejar su situación real — le faltan fotos, cambió de
comuna, empezó a hacer otro oficio, quiere ajustar su precio —
quiero poder editarlo directo, sin crear una cuenta nueva ni perder nada de lo que ya tiene,
para que mi perfil público siempre sea verdad, no una foto fija del día que me registré.

**Lado del marketplace:** profesional. **Qué necesita del otro lado:** nada — es una acción que don Héctor
hace solo, en cualquier momento después de registrarse.

**Sustento:** [C-001 de investigación](./investigacion.md#c-001) (E-001: la landing ya promete "perfil
público con fotos"), [C-005](./investigacion.md#c-005), [C-006](./investigacion.md#c-006). **Éxito:**
[M-002](#m-002), [M-003](#m-003).

**Reglas:**

- Don Héctor puede editar cualquier campo de su perfil — fotos, descripción, precio, categoría, comuna,
  nombre, contacto — en cualquier momento después de registrarse, no solo durante el registro. No hay una
  ventana de tiempo para completarlo, y no es una pantalla distinta según qué campo se edite.
- La descripción es texto libre corto (pensado para 1-2 frases, no un currículum) — cuenta a qué se dedica,
  no reemplaza ningún campo del catálogo (categoría sigue siendo la de `CategoriaSelect`, no texto suelto).
- El precio es un solo número: "desde $X" — el piso, no un rango. Un rango fijo miente para trabajos tan
  distintos entre sí como destapar un WC o cambiar un calefont completo (C-006); "desde" nunca miente,
  solo dice el mínimo. Si quiere aclarar qué cubre ese mínimo (ej. "desde $10.000 la visita"), esa nuance
  va en la descripción, no en el número.
- El precio es **siempre opcional** — nunca una condición para que el perfil exista o siga visible, ni al
  registrarse ni después. Tampoco **es un monto que Datealo procese, cobre ni retenga**: es información
  que se muestra en el perfil, igual que una foto — ver [D-004](#d-004).
- Editar categoría, comuna, nombre o contacto no reinicia ni oculta nada acumulado — reseñas futuras,
  antigüedad del perfil (C-005).
- Ningún campo requiere una nueva revisión para guardarse — el perfil sigue publicado mientras se edita,
  sin una ventana de "guardando cambios" donde desaparezca del buscador.
- Si no sube ninguna foto, el perfil sigue visible igual — ver [CL-001](#cl-001).
- Si no define descripción o precio, el perfil sigue visible igual — ver [CL-002](#cl-002).
- Datealo nunca oculta ni penaliza la posición de un perfil por tener cualquiera de estos campos vacíos.

**Ejemplo verificable:** dado el perfil activo de don Héctor (categoría Electricidad, comuna Ñuñoa, sin
fotos ni precio), cuando sube 3 fotos, escribe "Electricista con 10 años de experiencia" como descripción,
define "Desde $10.000" como precio, y más adelante cambia su categoría a Gasfitería y su comuna a
Providencia, entonces cada cambio se refleja de inmediato en su perfil público, sin ocultarlo ni perder
nada acumulado, y sin que nadie pueda pagar ni reservar nada desde ahí.

**No incluye:** un historial visible de valores anteriores (solo el estado actual es público), un límite
mínimo de fotos para publicar, una revisión de que las fotos sean reales o correspondan al trabajo de don
Héctor, ni ningún mecanismo de pago, cotización formal o reserva — ver [D-004](#d-004).

**Experiencia:** pendiente. **Ingeniería:** pendiente.

<a id="f-003"></a>

### F-003 — Confirmar por correo que el registro funcionó

Cuando don Héctor termina de completar el formulario,
quiero recibir algo que confirme que quedó guardado,
para no quedarme dudando si funcionó o si tengo que intentarlo de nuevo.

**Lado del marketplace:** profesional. **Qué necesita del otro lado:** nada.

**Sustento:** brief original de esta misión (ver [README](./README.md)) — no viene de una `C-xxx` de
investigación porque es una necesidad operativa (confirmar que una acción se ejecutó), no un hallazgo de
investigación. **Éxito:** [M-001](#m-001) (mismo indicador que F-001 — es parte de la misma acción).

**Reglas:**

- Al crear el perfil (F-001), Datealo envía un correo a don Héctor confirmando que su perfil ya está
  publicado — no "en revisión", porque no hay revisión (D-002).
- Si don Héctor no subió ninguna foto ni definió precio al momento del registro (se fue de la pantalla de
  F-002 sin completarla), el correo incluye una invitación a hacerlo, con un enlace directo a esa pantalla.
- Si el correo no llega (falla de Resend), Datealo no bloquea ni deshace el registro — el perfil ya existe
  igual, el correo es una confirmación, no una condición.

**Ejemplo verificable:** dado que don Héctor completa el registro sin agregar fotos, cuando el perfil se
crea, entonces recibe un correo en menos de un minuto confirmando que su perfil ya es visible, con un
enlace para agregar fotos y precio.

**No incluye:** ningún otro correo transaccional de esta misión (recordatorios, digest de mensajes) — eso
es de misiones futuras si hace falta.

**Experiencia:** pendiente. **Ingeniería:** pendiente. El mecanismo de envío (`sendEmail()`) ya existe
(misión 02); esta misión define el contenido y el disparador, no el transporte.

<a id="f-004"></a>

### F-004 — Editar categoría, comuna, nombre o contacto *(fusionada en F-002)*

**Estado: fusionada en [F-002](#f-002) el 2026-08-22.** No eran dos funcionalidades distintas — editar
categoría/comuna/nombre/contacto y editar fotos/descripción/precio son la misma acción (editar el perfil
ya creado), solo con campos distintos; no hay razón para dos pantallas ni dos flujos separados. El detalle
completo (reglas, ejemplo, sustento) vive ahora en F-002. Esta entrada se conserva para que el ID no
desaparezca sin explicación.

## Casos límite que cruzan funcionalidades

<a id="cl-001"></a>

| ID     | Condición concreta                                          | Comportamiento esperado                                              | Funcionalidades |
| ------ | ------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------- |
| CL-001 | Un perfil activo no tiene ninguna foto subida                 | Se muestra igual en el buscador, con un espacio vacío o genérico — nunca una foto de stock que insinúe que es del profesional | F-001, F-002 |
| CL-002 | Un perfil activo no tiene descripción ni precio definido        | Se muestra igual, sin esos datos — el buscador no filtra por precio si no lo puso | F-002 |
| CL-003 | Don Héctor ya tiene perfil pero el formulario de registro se envía igual (dos pestañas con el mismo enlace mágico, o un formulario viejo que quedó cargado) | Datealo no crea un perfil duplicado — lo lleva a ver/editar el que ya existe; nunca "esa cuenta es de otra persona", porque el email siempre viene de su propia sesión autenticada (D-001) | F-001 |

## Fuera de alcance

| Capacidad o caso                                    | Estado     | Razón del recorte                                                         | Condición para reconsiderar |
| ------------------------------------------------------- | ---------- | -------------------------------------------------------------------------- | -------------------------------- |
| Verificación automatizada (background check, RUT)       | descartada | Datealo no tiene esa infraestructura y el volumen de lanzamiento no la justifica (C-002) | — |
| Activación manual por Patricio antes de publicar         | postergada | Al lanzamiento no hay volumen que filtrar; costaría fricción sin un problema real detrás (C-002) | Cuando el volumen de registros haga que un perfil de mala calidad sea un riesgo real, no hipotético |
| Múltiples categorías por perfil                         | postergada | `CategoriaSelect` (misión 03) guarda un solo valor — soportar varias exige extender el componente | Cuando un profesional real pida activamente registrar más de un oficio |
| Panel de administración para activar/desactivar perfiles | postergada | Mismo criterio que categorías y comunas — hoy el volumen de cambios es bajo | El volumen de cambios manuales lo justifique |
| Cualquier mecanismo de pago, cobro o comisión intermediado por Datealo | descartada | Guardrail de identidad del producto, no falta de tiempo (D-004) | — |

## Señales de éxito

<a id="m-001"></a>

### M-001 — El registro se completa sin abandono ni confusión

- **Pregunta:** ¿el formulario de 5 campos es de verdad rápido, o la gente lo empieza y no lo termina?
- **Señal (qué observaríamos si funciona):** de cada 10 profesionales que abren el formulario, al menos 7
  lo terminan y reciben la confirmación por correo.
- **Método y umbral:** sin instrumentación todavía — se resuelve cuando exista analítica básica de
  formulario (fuera de alcance técnico de esta misión). Mientras tanto, revisión cualitativa de Patricio
  sobre los primeros registros reales.
- **Guardrail:** ningún profesional que complete el formulario queda sin perfil visible por un error del
  sistema — si el correo de confirmación falla, el perfil igual existe (F-003).

<a id="m-002"></a>

### M-002 — Los profesionales sí completan su perfil después de registrarse

- **Pregunta:** ¿separar registro de perfil completo (D-003) hace que la gente nunca vuelva a agregar fotos
  y precio, o funciona como pensado?
- **Señal:** de los profesionales activos, más de la mitad tiene al menos una foto subida a los 7 días de
  registrarse.
- **Método y umbral:** conteo directo en la base una vez exista tráfico real; sin fecha objetivo todavía.
- **Guardrail:** ningún profesional queda invisible o penalizado en el buscador por no haber completado
  esta parte — CL-001 y CL-002 son la garantía de esto, no solo la intención.

<a id="m-003"></a>

### M-003 — Editar categoría, comuna, nombre o contacto no genera dudas ni errores

- **Pregunta:** editar categoría/comuna es un cambio más "grande" (afecta dónde y bajo qué oficio aparece
  don Héctor) que editar una foto — ¿eso genera dudas o errores, o para quien edita se siente igual de
  simple?
- **Señal:** ningún reporte de un profesional que no entendió que su perfil siguió activo mientras editaba,
  ni de un perfil que quedó con datos a medio cambiar.
- **Método y umbral:** revisión cualitativa de Patricio en los primeros meses — sin volumen todavía para
  medir esto con un número.
- **Guardrail:** ningún perfil desaparece del buscador por el solo hecho de estar editándose.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — La autenticación del profesional es sin contraseña, con enlace mágico por correo

- **Estado:** aceptada. **Fecha:** 2026-08-22.
- **Sustento:** [C-004](./investigacion.md#c-004) — la evidencia no apunta a un solo ganador (ver Tensión),
  la decisión final la tomó Patricio con el cuadro completo, no algo que investigación cerrara sola.
- **Tensión:** los dos exponentes reales que se revisaron no hacen lo mismo entre sí. Mercado Libre (E-011
  de investigación) — el propio benchmark de confianza LATAM de este proyecto — usa contraseña como método
  principal, no algo sin contraseña; pero maneja plata (Mercado Pago), otra escala de riesgo que la de un
  perfil público de Datealo. WhatsApp (E-012) — la app que don Héctor ya usa a diario para su negocio —
  prueba a escala masiva que número de teléfono + código funciona sin contraseña en exactamente este
  público, pero exige contratar Twilio (único proveedor de WhatsApp en Supabase Auth) — costo de
  infraestructura real, no hipotético. El enlace mágico por correo no tiene un precedente de escala tan
  directo como ninguno de los dos — solo datos de un vendedor de autenticación (E-008) — pero no exige
  contratar nada nuevo, reusa el Resend que misión 02 ya configuró.
- **Alternativas descartadas:** email/password (como Mercado Libre) — un profesional no técnico gestionando
  su perfil entre trabajos (E-006) es justo el usuario que más abandona creando y recordando una
  contraseña; se prioriza esa fricción sobre replicar el patrón de Mercado Libre, que resuelve un problema
  de seguridad (proteger plata) que Datealo no tiene. OTP por SMS/WhatsApp (como WhatsApp mismo) — el
  precedente más parecido al público de Datealo de los tres, descartado igual por el costo real de
  contratar Twilio antes de tener un solo profesional registrado, no por dudas sobre si funcionaría — queda
  como el candidato más fuerte para reabrir esta decisión, no descartado por mérito.
- **Decisión y consecuencia:** el profesional entra con su email; Supabase Auth le manda un enlace mágico
  vía el mismo SMTP custom (Resend) que misión 02 ya configuró. No hay campo de contraseña en ningún
  formulario de esta misión. El riesgo de deliverability se mitiga con la guía oficial de Resend para
  Supabase Auth (E-009): dominio propio para el envío (ya pendiente como TQ-001 de misión 02), un
  subdominio dedicado para los correos de auth, tracking de links/apertura desactivado (corrompe el enlace
  de un solo uso), y DMARC configurado. Es trabajo de configuración sobre lo que misión 02 ya dejó
  pendiente, no una decisión ni infraestructura nueva — se documenta como requisito de esta decisión, el
  detalle técnico exacto lo resuelve `ingenieria.md`.
- **Reapertura:** si Datealo contrata Twilio por otra razón de negocio, OTP por WhatsApp pasa a ser el
  candidato más fuerte para reemplazar esta decisión — es el precedente de escala más directo de los tres.
  También si, ya con la mitigación de E-009 aplicada, los primeros registros reales siguen mostrando que el
  correo no llega o se demora.

<a id="d-002"></a>

### D-002 — El perfil nace activo (`activa = true`) al registrarse, sin revisión previa de nadie

- **Estado:** propuesta. **Fecha:** 2026-08-22.
- **Sustento:** [C-002](./investigacion.md#c-002).
- **Tensión:** partir sin ningún filtro humano arriesga que un perfil de mala calidad (o falso) quede
  visible antes de que nadie lo note — pero exigir que Patricio revise cada registro a mano antes de
  publicarlo agrega fricción real contra un riesgo que, con cero profesionales registrados todavía, es
  hipotético.
- **Alternativas descartadas:** activación manual por Patricio antes de publicar (mismo patrón que
  categorías/comunas) — es el mecanismo más seguro, pero resuelve un problema que Datealo no tiene todavía
  (volumen que filtrar) a costa de un problema que sí tiene (necesita que exista oferta, ya).
  Verificación automatizada tipo TaskRabbit — infraestructura que Datealo no tiene y que el volumen no
  justifica (C-002).
- **Decisión y consecuencia:** el campo `activa` de la tabla de profesionales nace en `true`. El profesional
  no ve ningún estado de "pendiente" ni "en revisión" — su perfil está publicado apenas se guarda el
  registro. El mecanismo para pasar a `false` (o a un default `false`) ya existe sin cambio de modelo, si
  esta decisión se revierte.
- **Reapertura:** cuando el volumen de registros haga que un perfil problemático sea un riesgo real y no
  solo teórico (ver M-002 y la pregunta abierta [Q-001](#q-001)) — no hay una fecha ni un número definido
  todavía para ese punto, es explícitamente una decisión a revisar más adelante.

<a id="d-003"></a>

### D-003 — Registrarse y completar el perfil son dos momentos distintos, no un solo formulario largo

- **Estado:** propuesta. **Fecha:** 2026-08-22.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002).
- **Tensión:** un formulario único (email + nombre + categoría + comuna + contacto + fotos + precio) da
  perfiles más completos desde el día uno, pero cada campo extra en el camino de "quiero registrarme" es
  una oportunidad de que don Héctor lo abandone antes de terminar — más aún si no tiene fotos buenas a mano
  en ese momento.
- **Alternativas descartadas:** un solo formulario que pida todo de una — TaskRabbit y su fricción de
  entrada (E-005 de investigación) es el ejemplo de lo que se quiere evitar, aunque ahí la fricción sea de
  otro tipo (background check), el principio de "cada campo extra es abandono potencial" es el mismo.
- **Decisión y consecuencia:** F-001 (registro) solo pide los 5 campos mínimos para ser encontrable; F-002
  (fotos, precio) es una pantalla separada, editable cuando sea, no un paso obligatorio del registro.
- **Reapertura:** si M-002 muestra que casi nadie vuelve a completar su perfil después de registrarse,
  vale la pena reconsiderar si algún campo de F-002 debería ser obligatorio en F-001.

<a id="d-004"></a>

### D-004 — Datealo nunca gestiona ni cobra comisión por el pago del servicio; el precio ("desde $X") es solo información

- **Estado:** aceptada. **Fecha:** 2026-08-22.
- **Sustento:** guardrail ya vigente en `CLAUDE.md` ("pago obligatorio para contactar" nunca se
  implementa); instrucción directa de Patricio al revisar esta misión.
- **Tensión:** cobrar comisión por transacción (TaskRabbit) o por lead (Thumbtack) es el modelo de negocio
  más común del rubro, y renunciar a él deja afuera una fuente de ingreso obvia. Pero intermediar el pago
  exige que Datealo maneje disputas, reembolsos y cumplimiento tributario — carga operativa real que no
  tiene sentido antes de tener un solo profesional con tracción, y agrega fricción justo en el paso que
  Datealo más protege: contactar directo, sin intermediación.
- **Alternativas descartadas:** comisión por transacción (modelo TaskRabbit) — exige que el pago pase por
  Datealo, contradice el guardrail de "sin intermediación" de `CLAUDE.md`. Cobro por lead (modelo
  Thumbtack) — el profesional paga por cada contacto que recibe, se lo concrete o no; le agrega un costo a
  algo que hoy es gratis para todos los lados del marketplace.
- **Decisión y consecuencia:** el precio (F-002, "desde $X" — ver [C-006](./investigacion.md#c-006) para
  por qué no es un rango) es un número que el profesional escribe — nunca un monto que Datealo procesa,
  retiene o cobra. No hay ningún flujo de pago, cotización formal ni reserva en esta misión ni en el
  roadmap actual. Features futuras que ayuden al profesional a cobrar (ej. generar una boleta, un link de
  pago externo) son herramientas para él, nunca algo que pase por una cuenta de Datealo
  ni genere comisión.
- **Reapertura:** ninguna prevista — es un guardrail de identidad del producto (la principal diferencia con
  otras plataformas del rubro, según Patricio), no una restricción temporal de este MVP.

## Preguntas

Ninguna bloquea el registro básico — D-001 a D-003 alcanzan para F-001/F-002/F-003. Q-001 es sobre cuándo
reabrir D-002, no sobre si construirla así ahora.

| ID    | La duda                                                                  | Estado   | Respuesta, o quién la resuelve |
| ----- | --------------------------------------------------------------------------- | -------- | ----------------------------------- |
| Q-001 | ¿Bajo qué condición concreta (número de registros, un incidente real) conviene pasar D-002 de automático a activación manual? | abierta | Patricio, revisando los primeros registros reales — sin fecha límite, no bloquea esta misión |

<a id="q-001"></a>

### Q-001 — ¿Cuándo conviene pasar de activación automática a manual?

- **La duda, con un ejemplo:** si aparece un perfil claramente falso o de mala fe (spam, no un electricista
  real) antes de tener ningún profesional real registrado, ¿eso ya alcanza para pasar a activación manual,
  o se espera a un patrón repetido?
- **Afecta a:** [D-002](#d-002).
- **Cómo se resolverá:** revisión de Patricio sobre los primeros registros reales, no una regla numérica
  definida de antemano — no hay datos todavía para fijar un umbral con sentido.
- **¿Bloquea algo?:** no. D-002 queda vigente mientras esta pregunta sigue abierta.
