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
- ¿Un perfil recién creado, sin fotos ni reseñas, aparece visible en el buscador (misión 06) o queda oculto
  hasta tener algo que mostrar? Afecta directo el arranque en frío del lado profesional.
- ¿"Verificado" bloquea la visibilidad del perfil, o el perfil queda visible igual mientras se espera? Y
  cómo se muestra esa diferencia — es una decisión de `experiencia.md`, no de este documento.

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

### C-001 — El registro tiene que ser autoservicio e instantáneo, no un proceso con aprobación

- **Sustento:** [E-001](#e-001), [E-004](#e-004), [E-005](#e-005).
- **Razonamiento:** Datealo está en cero — cero profesionales, cero reseñas. Cualquier fricción que retrase
  o filtre el registro (como el background check obligatorio y los ~4 días de TaskRabbit) ataca
  directamente lo único que el producto necesita más urgente hoy: que exista oferta. El modelo de
  Thumbtack (registro inmediato, verificación opcional y posterior) es el comparable correcto, no el de
  TaskRabbit.
- **Implicación:** el formulario de registro no debe bloquearse esperando una verificación de nadie. Un
  perfil se crea y publica de inmediato; que después Patricio lo marque como verificado es un cambio de
  estado que se agrega encima, no una condición para existir.
- **Confianza:** alta — está sostenido por la promesa ya publicada en la landing (E-001) y por el filtro de
  arranque en frío del skill `discovery-product`, no solo por benchmark.

<a id="c-002"></a>

### C-002 — La verificación es un acto manual de Patricio, no una función de la plataforma, al lanzamiento

- **Sustento:** [E-002](#e-002), [E-005](#e-005).
- **Razonamiento:** misión 03 ya asumió esto para decidir qué comunas activar (D-002: Patricio recluta y
  verifica directo en Gran Santiago y Puerto Varas). Construir un flujo de verificación automatizado tipo
  TaskRabbit (background check por proveedor externo, documentos, aprobación) es infraestructura que
  Datealo no tiene y que el volumen de lanzamiento no justifica.
- **Implicación:** el estado "verificado" de un perfil es un campo que Patricio cambia a mano (mismo
  mecanismo que `activa` en categorías y comunas), no algo que el profesional dispara ni que un proceso
  automático resuelve. El formulario de registro no le pide al profesional nada que sirva para un
  background check (no pide RUT, no pide antecedentes).
- **Confianza:** alta — es continuación directa de una decisión ya tomada y aprobada en misión 03, no una
  hipótesis nueva.

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

## El ideal: cualquier profesional se registra y aparece visible en minutos, sin esperar a nadie

### El resultado ideal se ve así

Don Héctor abre datealo.cl desde su celular un domingo en la tarde. Toca "Soy profesional", escribe su
email y recibe un enlace mágico — no tiene que inventar ni recordar ninguna contraseña. Elige "Electricidad"
de la lista de categorías (la misma que ya existe para búsqueda) y "Ñuñoa" de la lista de comunas. Sube tres
fotos de trabajos que ya tiene en el celular y escribe un rango de precio orientativo. Su perfil queda
publicado de inmediato — todavía sin marcar como verificado, pero visible para cualquiera que busque
"electricista" en Ñuñoa. Unos días después, Patricio lo llama, confirma que es real y cambia ese estado a
mano, sin que don Héctor tenga que hacer nada más. Cómo se ve esa diferencia en el perfil (un texto, un
ícono, nada visible todavía) es una decisión de `experiencia.md`, no de esta investigación.

### Capacidades del ideal

| Capacidad                        | Acción habilitada                                  | Respuesta esperada                                       | Conclusión que la justifica |
| --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| Registro sin aprobación previa    | El profesional completa el formulario y publica solo | El perfil queda visible de inmediato, sin cola de espera    | [C-001](#c-001)              |
| Verificación posterior y manual   | Patricio confirma al profesional fuera de la app     | El campo `verificado` cambia a mano; el perfil no se oculta mientras tanto | [C-002](#c-002)              |
| Categoría y comuna del catálogo   | El profesional elige de una lista cerrada, no escribe texto libre | El perfil queda indexado exactamente igual que espera el buscador (misión 06) | [C-003](#c-003)              |
| Autenticación sin contraseña      | El profesional entra con un enlace o código, no una contraseña | Menos pasos entre "quiero registrarme" y "mi perfil existe" | [C-004](#c-004)              |

### El ideal no significa que cualquier perfil sea igual de confiable

- Un perfil sin verificar sigue siendo público — "sin verificar" no es lo mismo que "oculto".
  Quien busca decide con esa información a la vista, no Datealo por él.
- El ideal no incluye un proceso de verificación automatizado (background check, validación de RUT) — eso
  es explícitamente lo que C-002 descarta para esta etapa del producto.

## Referencias

- [Thumbtack Pro Requirements (Everlance)](https://www.everlance.com/gig-guides/thumbtack-requirements):
  usado en E-004 para el patrón de registro instantáneo con verificación opcional.
- [What's Required to Become a Tasker (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/204411070-What-s-Required-to-Become-a-Tasker):
  usado en E-005 para el costo de un registro con aprobación obligatoria.
