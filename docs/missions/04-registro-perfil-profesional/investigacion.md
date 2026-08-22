# Misión: registro y perfil de profesional — Investigación

**Estado:** activo

**Última actualización:** 2026-08-20

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando don Héctor no tiene dónde mostrarse

**Situación:** don Héctor es electricista en Ñuñoa. Sus clientes de siempre lo recomiendan al vecino, pero
fuera de ese círculo no tiene ninguna presencia — no tiene página, no aparece si alguien busca
"electricista Ñuñoa" en Google, y su única prueba de que hace buen trabajo son fotos sueltas que manda por
WhatsApp cuando alguien pregunta.

**Acción o necesidad:** quiere que la gente que no lo conoce lo pueda encontrar y confiar en él sin tener
que pedirle referencias a un tercero primero.

**Respuesta actual:** publica en el grupo de WhatsApp del edificio cuando alguien pregunta, y a veces en
Facebook Marketplace — ninguno de los dos le arma una presencia permanente, cada publicación se pierde en
el feed en un par de días.

**Consecuencia:** pierde clientes frente a cualquiera que sí tenga algo permanente donde lo encuentren,
aunque haga peor trabajo — la landing de Datealo ya nombra esto directo: "tus clientes te buscan, pero no
te encuentran" ([E-001](#e-001)).

## Preguntas que la investigación debe resolver

- ¿Con qué método se autentica un profesional — email/password, magic link, OTP por teléfono? Mission 02
  dejó esto explícitamente abierto para esta misión (TQ-002, [E-003](#e-003)).
- ¿Bajo qué condición concreta conviene pasar de activación automática a que Patricio active cada perfil a
  mano? [C-002](#c-002) elige automático para el lanzamiento, a propósito reversible — no bloquea esta
  misión, pero conviene dejarlo señalado para no reabrir la conclusión desde cero cuando llegue el momento.

## Evidencia

| ID    | Tipo        | Fuente                                                | Hecho verificable | Límite de la evidencia |
| ----- | ----------- | ------------------------------------------------------ | ------------------ | ----------------------- |
| E-001 | código      | `app/constants/landing.ts`, `LandingForProfessionals.vue` | La landing ya promete al profesional: perfil público con fotos, reseñas, contacto directo de clientes de su zona, registro "gratis, menos de 1 minuto" | Es copy de marketing para captar la lista de espera, no una decisión de producto — compromete expectativa, no diseño |
| E-002 | decisión interna | [D-002 de misión 03](../03-taxonomia-categorias-y-comunas/producto.md#d-002) | El campo `activa` que controla qué categorías/comunas se ofrecen es booleano y lo cambia Patricio a mano, sin panel de administración | Es evidencia de que el mecanismo (`activa`, cambiable a mano) ya existe y es reusable — no dice qué valor por default le conviene a un perfil de profesional, que es una decisión distinta con otro contexto (D-002 activa comunas para definir dónde opera Datealo, no para filtrar personas) |
| E-003 | decisión interna | [TQ-002 de misión 02](../02-base-de-datos-y-auth/ingenieria.md) | El método de autenticación del profesional (email/password, magic link, OTP) quedó explícitamente sin resolver, delegado a esta misión | No es evidencia de qué elegir, es la confirmación de que esta misión tiene que decidirlo |
| E-004 | benchmark   | [Thumbtack — requisitos para pros](https://www.everlance.com/gig-guides/thumbtack-requirements) | El registro pide email, zona de servicio y categorías de servicio; identidad y background check son opcionales y no bloquean el registro (Thumbtack los premia con una insignia visual en el perfil) | Thumbtack ya tiene volumen y un sistema de matching por lead pagado — su modelo de monetización no aplica a Datealo. El patrón "registro instantáneo, verificación opcional" sí es comparable; la insignia visual es un detalle de UI de Thumbtack, no una decisión de Datealo — no se importa solo por aparecer acá |
| E-005 | benchmark   | [TaskRabbit — requisitos para Tasker](https://support.taskrabbit.com/hc/en-us/articles/204411070-What-s-Required-to-Become-a-Tasker) | El registro exige background check obligatorio, una tarifa de USD 25, y toma alrededor de 4 días hábiles antes de poder trabajar | Es el extremo opuesto a Thumbtack: alta fricción de entrada a cambio de confianza pre-verificada. TaskRabbit opera con un volumen de aplicantes que puede permitirse filtrar así; Datealo con cero profesionales no |
| E-006 | producto (CLAUDE.md) | Sección "Tipos de usuario" de `CLAUDE.md` | El profesional "no es un usuario técnico y gestiona su perfil entre trabajos, también desde el celular" | Es una caracterización ya asumida por el proyecto, no dato de una entrevista real — confianza del hecho en sí es alta (es cómo se diseñó todo lo demás), pero no está validada con un profesional real todavía |

<a id="e-001"></a>

### E-001 — La landing ya le promete algo concreto al profesional

`LANDING_FOR_PROFESSIONALS` (`app/constants/landing.ts`) tiene el headline "¿Eres profesional y dependes
del boca a boca?", la solución "Crea tu perfil en datealo y deja que los clientes lleguen a ti", y tres
beneficios explícitos: perfil público con fotos de sus trabajos, reseñas que construyen su reputación, y
contacto directo de clientes de su zona. El CTA dice "Gratis · Menos de 1 minuto".

Esto permite afirmar que el registro tiene que sostener esa promesa (rápido, gratis, con fotos y reseñas
visibles), pero no demuestra que "menos de 1 minuto" sea alcanzable una vez que el formulario real pide
categoría, comuna, fotos y precio — es una promesa de marketing escrita antes de diseñar el flujo.

## Conclusiones

<a id="c-001"></a>

### C-001 — Completar el registro es autoservicio e instantáneo — quedar visible no

- **Sustento:** [E-001](#e-001), [E-004](#e-004), [E-005](#e-005).
- **Razonamiento:** Datealo está en cero — cero profesionales, cero reseñas. Cualquier fricción en el
  formulario mismo (como el background check obligatorio y los ~4 días de TaskRabbit) ataca lo único que
  el producto necesita más urgente hoy: que alguien intente registrarse. Thumbtack muestra el otro extremo:
  su formulario solo pide email, categorías y zona — nada que exija aprobación para poder enviarlo. Eso no
  significa que el resultado del registro sea quedar visible al toque — solo que llenar el formulario no
  debe depender de que nadie lo apruebe primero.
- **Implicación:** el formulario de registro no se bloquea esperando a Patricio — don Héctor lo completa
  entero sin que nadie intervenga. Lo que pasa después con la visibilidad de su perfil es otra pregunta,
  que resuelve [C-002](#c-002).
- **Confianza:** alta — está sostenido por la promesa ya publicada en la landing (E-001, "menos de 1
  minuto" para completar el registro) y por el filtro de arranque en frío del skill `discovery-product`.

<a id="c-002"></a>

### C-002 — El perfil queda activo automáticamente al registrarse, sin que Patricio intervenga — por ahora

- **Sustento:** [E-002](#e-002).
- **Razonamiento:** el mecanismo es el mismo campo `activa` que misión 03 ya construyó para categorías y
  comunas (D-002) — no hace falta inventar nada nuevo. Lo que cambia es el valor por default: una comuna
  nueva nace `activa = false` porque agregarla al catálogo no implica que Datealo ya opere ahí; un
  profesional que completa su propio registro sí es una señal directa de intención, así que acá el default
  es `activa = true`. Al lanzamiento, sin volumen de registros que filtrar, exigir que Patricio revise cada
  uno a mano antes de que aparezca es fricción sin un problema real detrás todavía.
- **Implicación:** al terminar el registro, el perfil de don Héctor ya es buscable — nadie lo revisa antes.
  Es una decisión explícitamente reversible: el campo `activa` ya existe y ya soporta cambiarse a mano
  (mismo mecanismo de categorías y comunas), así que pasar a activación manual más adelante no exige
  ningún cambio de modelo de datos, solo dejar de setear el default en `true`.
- **Confianza:** media — la decisión de partir automático es de producto, no una conclusión que la
  evidencia sostenga por sí sola (E-002 en todo caso apunta a lo manual); queda anotada acá porque define
  el ideal de esta investigación, y su condición de reapertura (cuándo pasar a manual) es de las Preguntas
  de arriba.

<a id="c-003"></a>

### C-003 — Los campos centrales del registro ya existen: categoría y comuna del catálogo de misión 03

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** la landing ya promete "perfil con fotos" y "clientes de tu zona" — zona y oficio son
  exactamente lo que misión 03 modeló como catálogo cerrado (`CategoriaSelect`, `ComunaSelect`), construido
  ahí en parte para que esta misión no tuviera que inventar su propia versión.
- **Implicación:** el registro no debe ofrecer un campo de texto libre para "oficio" ni "zona" — usa los
  mismos dos componentes que misión 03 ya construyó, sin reimplementar la lógica de selección.
- **Confianza:** alta — es una consecuencia directa y ya prevista de una decisión de producto vigente
  (D-004 de misión 03).

<a id="c-004"></a>

### C-004 — El método de autenticación debe minimizar pasos y fricción para un usuario no técnico en el celular

- **Sustento:** [E-003](#e-003), [E-006](#e-006).
- **Razonamiento:** un profesional no técnico, gestionando su perfil entre trabajos desde el celular
  (E-006), es exactamente el perfil de usuario que más sufre un flujo de contraseña (crearla, recordarla,
  recuperarla). El benchmark de TaskRabbit (E-005) muestra el costo de un registro con pasos extra: aunque
  ahí el paso extra es un background check y no una contraseña, el principio es el mismo — cada paso
  adicional es una oportunidad de abandono antes de tener un solo profesional registrado.
- **Implicación:** magic link u OTP son candidatos más fuertes que email/password para el método de
  autenticación (TQ-002), pero cuál de los dos exactos no se resuelve acá — es una decisión técnica que le
  corresponde a `producto.md`/`ingenieria.md` de esta misión, no a la investigación.
- **Confianza:** media — el razonamiento es sólido, pero no hay ninguna entrevista real con un profesional
  chileno que confirme que una contraseña es, en la práctica, la fricción que se asume que es.

## El ideal: cualquier profesional se registra y aparece en el buscador en el acto

### El resultado ideal se ve así

Don Héctor abre datealo.cl desde su celular un domingo en la tarde. Toca "Soy profesional", escribe su
email y recibe un enlace mágico — no tiene que inventar ni recordar ninguna contraseña. Elige "Electricidad"
de la lista de categorías (la misma que ya existe para búsqueda) y "Ñuñoa" de la lista de comunas. Sube tres
fotos de trabajos que ya tiene en el celular y escribe un rango de precio orientativo. Termina su registro
en menos de dos minutos, y su perfil queda activo de inmediato — nadie lo revisa antes: si alguien busca
"electricista" en Ñuñoa esa misma tarde, don Héctor ya aparece.

### Capacidades del ideal

| Capacidad                        | Acción habilitada                                  | Respuesta esperada                                       | Conclusión que la justifica |
| --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| Registro sin aprobación previa    | El profesional completa el formulario entero sin que nadie lo bloquee | El registro se guarda y publica en el mismo paso | [C-001](#c-001)              |
| Activación automática             | El perfil nace `activa = true`, sin que Patricio intervenga | El perfil es buscable apenas se completa el registro | [C-002](#c-002)              |
| Categoría y comuna del catálogo   | El profesional elige de una lista cerrada, no escribe texto libre | El perfil queda indexado exactamente igual que espera el buscador (misión 06) | [C-003](#c-003)              |
| Autenticación sin contraseña      | El profesional entra con un enlace o código, no una contraseña | Menos pasos entre "quiero registrarme" y "mi perfil existe" | [C-004](#c-004)              |

### El ideal no significa que cualquier perfil sea igual de confiable

- Que el perfil aparezca de inmediato no significa que Datealo ya lo verificó — es una decisión deliberada
  de partir sin ese filtro mientras no hay volumen que lo justifique, no una afirmación de que todo
  profesional registrado es confiable.
- Es una decisión hecha para revertirse fácil: el mismo campo `activa` que hoy nace en `true` puede pasar
  a nacer en `false` (activación manual) sin ningún cambio de modelo — ver la pregunta abierta sobre bajo
  qué condición conviene hacer ese cambio.
- El ideal no incluye un proceso de verificación automatizado (background check, validación de RUT) — eso
  es explícitamente lo que C-002 descarta para esta etapa del producto.

## Referencias

- [Thumbtack Pro Requirements (Everlance)](https://www.everlance.com/gig-guides/thumbtack-requirements):
  usado en E-004 para el patrón de registro instantáneo con verificación opcional.
- [What's Required to Become a Tasker (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/204411070-What-s-Required-to-Become-a-Tasker):
  usado en E-005 para el costo de un registro con aprobación obligatoria.
