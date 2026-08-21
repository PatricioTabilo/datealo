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
- Mientras un perfil está registrado pero todavía no lo activa Patricio, ¿qué ve el profesional? ¿Un
  mensaje de "en revisión", o nada distinto de un perfil activo hasta que le pregunte? Afecta directo si el
  profesional entiende que su registro sí funcionó.

## Evidencia

| ID    | Tipo        | Fuente                                                | Hecho verificable | Límite de la evidencia |
| ----- | ----------- | ------------------------------------------------------ | ------------------ | ----------------------- |
| E-001 | código      | `app/constants/landing.ts`, `LandingForProfessionals.vue` | La landing ya promete al profesional: perfil público con fotos, reseñas, contacto directo de clientes de su zona, registro "gratis, menos de 1 minuto" | Es copy de marketing para captar la lista de espera, no una decisión de producto — compromete expectativa, no diseño |
| E-002 | decisión interna | [D-002 de misión 03](../03-taxonomia-categorias-y-comunas/producto.md#d-002) | Al lanzamiento, Patricio recluta y verifica profesionales directamente en Gran Santiago y Puerto Varas — no hay panel de administración ni proceso automático | Es la decisión que ya se tomó para el catálogo de comunas, no una decisión propia de esta misión, pero fija el techo de qué automatización tiene sentido pedir acá |
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

### C-002 — La visibilidad del perfil usa el mismo mecanismo `activa` que categorías y comunas, no un estado "verificado" aparte

- **Sustento:** [E-002](#e-002), [E-005](#e-005).
- **Razonamiento:** misión 03 ya resolvió exactamente este problema para categorías y comunas — un campo
  `activa` que Patricio cambia a mano, sin panel de administración (D-002). Un profesional recién
  registrado no necesita un mecanismo nuevo ni un segundo estado ("publicado" más "verificado" por
  separado) — necesita el mismo interruptor que ya existe: mientras `activa` sea `false`, el perfil no
  aparece en el buscador. Patricio lo prende a mano cuando confirma al profesional, y ese acto de prender
  es, en sí mismo, la verificación — no hay dos pasos.
- **Implicación:** el registro no publica nada por sí solo. Un perfil recién completado por don Héctor
  existe en la base pero no aparece en ninguna búsqueda hasta que Patricio lo active. No hace falta
  construir un flujo de verificación automatizado (background check, documentos) — Datealo no tiene esa
  infraestructura y el volumen de lanzamiento no la justifica.
- **Confianza:** alta — reusa un mecanismo ya construido y aprobado en misión 03, no propone uno nuevo.

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

## El ideal: cualquier profesional completa su registro en minutos; aparecer en el buscador es un paso aparte que Patricio confirma a mano

### El resultado ideal se ve así

Don Héctor abre datealo.cl desde su celular un domingo en la tarde. Toca "Soy profesional", escribe su
email y recibe un enlace mágico — no tiene que inventar ni recordar ninguna contraseña. Elige "Electricidad"
de la lista de categorías (la misma que ya existe para búsqueda) y "Ñuñoa" de la lista de comunas. Sube tres
fotos de trabajos que ya tiene en el celular y escribe un rango de precio orientativo. Termina su registro
en menos de dos minutos — pero su perfil todavía no aparece si alguien busca "electricista" en Ñuñoa: existe
en la base con `activa = false`, igual que una comuna recién agregada al catálogo pero todavía apagada.
Unos días después, Patricio lo llama, confirma que es real y activa su perfil a mano. Recién ahí don Héctor
aparece en el buscador — activarlo es lo único que hace falta, no hay un segundo estado de "verificado" por
separado.

### Capacidades del ideal

| Capacidad                        | Acción habilitada                                  | Respuesta esperada                                       | Conclusión que la justifica |
| --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| Registro sin aprobación previa    | El profesional completa el formulario entero sin que nadie lo bloquee | El registro queda guardado, listo para que Patricio lo active | [C-001](#c-001)              |
| Activación manual, un solo estado | Patricio activa el perfil a mano, mismo mecanismo que `activa` en categorías y comunas | Mientras `activa` sea `false`, el perfil no aparece en ninguna búsqueda | [C-002](#c-002)              |
| Categoría y comuna del catálogo   | El profesional elige de una lista cerrada, no escribe texto libre | El perfil queda indexado exactamente igual que espera el buscador (misión 06) | [C-003](#c-003)              |
| Autenticación sin contraseña      | El profesional entra con un enlace o código, no una contraseña | Menos pasos entre "quiero registrarme" y "mi perfil existe" | [C-004](#c-004)              |

### El ideal no significa que el registro se convierta en un panel de administración

- No hay una cola de solicitudes que revisar en una pantalla — Patricio activa el perfil directo en la
  base, mismo mecanismo manual que ya usa para categorías y comunas (fuera de alcance de esta misión
  construir un panel).
- El ideal no incluye un proceso de verificación automatizado (background check, validación de RUT) — eso
  es explícitamente lo que C-002 descarta para esta etapa del producto.

## Referencias

- [Thumbtack Pro Requirements (Everlance)](https://www.everlance.com/gig-guides/thumbtack-requirements):
  usado en E-004 para el patrón de registro instantáneo con verificación opcional.
- [What's Required to Become a Tasker (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/204411070-What-s-Required-to-Become-a-Tasker):
  usado en E-005 para el costo de un registro con aprobación obligatoria.
