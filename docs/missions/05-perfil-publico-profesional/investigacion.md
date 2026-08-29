# Misión: perfil público de profesional — Investigación

**Estado:** activo

**Última actualización:** 2026-08-28

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando la señora Carmen tiene que elegir entre tres desconocidos

**Situación:** a la señora Carmen se le quema el tablero eléctrico un sábado en la noche. Busca
"electricista" en Ñuñoa en Datealo y le aparecen tres perfiles — Héctor, Marcelo y Jorge — mismo oficio,
misma comuna, y ninguno con una sola reseña todavía, porque Datealo recién lanzó y misión 07 (reseñas) ni
siquiera existe todavía.

**Acción o necesidad:** decidir a cuál de los tres llamar, sabiendo que va a dejarlo entrar a su casa esa
misma noche, sin que nadie de su círculo lo conozca.

**Respuesta actual:** hoy pregunta en el grupo de WhatsApp del edificio o mira Facebook Marketplace — ahí
al menos alguien responde con un nombre y un "a mí me fue bien con él", aunque sea de un vecino que no
conoce en persona ([E-008](#e-008)).

**Consecuencia:** si elige mal, no es una reseña de tres estrellas — es un desconocido dentro de su casa de
noche, o alguien malo tocando cableado eléctrico. Si no logra decidirse a tiempo, cierra la pestaña y
vuelve al grupo de WhatsApp, y Datealo pierde el contacto antes de que exista.

## Preguntas que la investigación debe resolver

- ¿Qué información del perfil mueve de verdad a elegir a un profesional sobre otro cuando ninguno tiene
  reseñas todavía? Afecta qué se muestra y en qué orden en el perfil.
- ¿Cómo se ve un perfil sin ninguna foto, descripción ni reseña sin que parezca abandonado o falso? No es
  un caso raro — es el estado de todos los perfiles el día del lanzamiento ([C-004](#c-004)).
- ¿Qué evento exacto cuenta como "contacto" para que misión 07 pueda atarle una reseña más adelante — el
  click en el botón de WhatsApp/teléfono, o algo más? Sin esta respuesta misión 07 no tiene de qué agarrarse
  (ver [README](./README.md)).

## Evidencia

| ID    | Tipo                  | Fuente                                                                                          | Hecho verificable | Límite de la evidencia |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código                | `app/constants/landing.ts` (`hero.subheadline`, `solution.benefits`, `forProfessionals.benefits`) | La landing promete al buscador "profesionales verificados", "reseñas de vecinos reales" y "contacto directo... sin intermediarios"; y al profesional, "perfil público con fotos de tus trabajos" y "reseñas que construyen tu reputación" | Es copy de marketing pre-lanzamiento, no una spec cerrada — la parte de "verificación" ya choca con una decisión de producto ya tomada (ver [E-009](#e-009)) |
| E-002 | código                | `server/db/schema/professionals.ts`                                                              | El perfil ya guarda `displayName`, `categoriaSlug`, `comunaCodigo`, `contact`, `description`, `priceFrom`, `photoPaths` y `active` — no existe ninguna columna de reseña, verificación ni registro de contacto | Dice qué datos existen hoy, no cómo deberían presentarse — el perfil público (esta misión) es la primera vez que alguien lee estos datos, todavía no se diseñó su presentación |
| E-003 | benchmark              | [Cómo funciona el perfil de un anfitrión en Airbnb (Guesty)](https://www.guesty.com/blog/setting-up-profile-airbnb-how-does-it-work/), [Airbnb Host Rating System (Selah Collective)](https://selahcollective.studio/resources/airbnb-host-rating-system) | Las señales de confianza del perfil de un host son verificación de identidad, reseñas, tasa y tiempo de respuesta a mensajes, y el badge "Superhost" (exige 90%+ de tasa de respuesta) | Airbnb tiene millones de reseñas acumuladas y verificación de identidad formal (documento de identidad) — no aplica directo a un lanzamiento con cero reseñas y sin ningún mecanismo de identidad |
| E-004 | benchmark              | [¿Cómo se verifica la autenticidad de un especialista? (Doctoralia)](https://pro.doctoralia.cl/preguntas-frecuentes/verificacion-perfiles) | Doctoralia verifica cada perfil cruzando la información contra el colegio profesional oficial correspondiente (ej. colegio médico), combinando sistema automatizado y revisión humana | Existe porque hay un registro oficial único y centralizado que cubre el 100% de la categoría (medicina) — no hay un equivalente así para peluquería, mudanzas o limpieza en Chile; sí existe uno parcial para electricidad/gas (ver [E-006](#e-006)) |
| E-005 | benchmark              | [Elite Status Overview (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/46260436549915-Elite-Status-Overview), [How Do I Know Which Tasker Is Best (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/46260459709723-How-Do-I-Know-Which-Tasker-Is-Best-for-My-Task) | El badge "Elite" y el conteo de tareas completadas por categoría solo existen para taskers con volumen (top 35% de su rubro, o 4.9★ sostenido); en el perfil también se ven fotos que el tasker eligió compartir de trabajos previos | Describe el perfil de un tasker con historial — no dice qué le muestra TaskRabbit a un tasker nuevo el primer día, que es exactamente el estado de todo profesional en Datealo al lanzamiento |
| E-006 | benchmark              | [Cómo Mercado Libre calcula tu reputación (WooSync)](https://www.woosync.io/blog/infografia-como-mercado-libre-calcula-tu-reputacion/) | El "termómetro" de reputación (rojo a verde) recién empieza a calcularse después de que el vendedor completa al menos 10 ventas | No dice qué ve un comprador de un vendedor con 0 a 9 ventas — pero confirma que ni un marketplace maduro y con volumen finge una reputación antes de tener datos reales, el mismo principio que Datealo necesita el día uno |
| E-007 | benchmark (foro de usuarios) | [Booking something with no reviews and new host (comunidad Airbnb)](https://community.withairbnb.com/t5/Ask-about-your-listing/Booking-something-with-no-reviews-and-new-host/td-p/2050845) | Ante un anfitrión sin reseñas, la respuesta que la comunidad ofrece es mandarle un mensaje directo antes de reservar, para evaluar qué tan rápido y bien responde | Son opiniones de usuarios en un foro, no datos agregados de comportamiento — pero confirma que "escribir para tantear" es un sustituto real de la reseña cuando esta no existe |
| E-008 | benchmark local        | [Buscador de instaladores eléctricos y de gas SEC (ChileAtiende)](https://www.chileatiende.gob.cl/fichas/67276-buscador-de-instaladores-electricos-y-de-gas-autorizados-por-la-sec) | La Superintendencia de Electricidad y Combustibles (SEC) mantiene un buscador público y oficial de instaladores eléctricos y de gas certificados en Chile | Es un registro real, pero cubre solo dos de las categorías del catálogo de Datealo (electricidad, gas) — no existe un equivalente para el resto de los oficios; hoy Datealo no lo consulta ni lo cruza contra ningún perfil |
| E-009 | decisión interna       | [D-002 de misión 04](../04-registro-perfil-profesional/producto.md#d-002)                        | El perfil de un profesional en Datealo nace `active = true` sin que nadie lo revise — no hay verificación automatizada ni manual al lanzamiento | Es una decisión de producto ya tomada, no evidencia externa — fija una restricción real para esta misión: el perfil público tiene que funcionar bien incluso cuando nadie lo revisó nunca |

<a id="e-008"></a>

### E-008 — El único registro oficial que Chile ya tiene es parcial

La SEC certifica instaladores eléctricos y de gas por ley — es un dato verificable, público y gratuito, no
un proceso que Datealo tendría que inventar ni operar. Pero solo cubre 2 de las categorías del catálogo de
Datealo (misión 03 tiene más: peluquería, limpieza, mudanzas, etc.), así que no sirve como mecanismo de
verificación general para todo el catálogo.

Esto permite afirmar que existe un camino concreto y de bajo costo para una verificación real futura,
acotada a electricidad y gas, pero no demuestra que valga la pena construirla antes de tener volumen, ni
resuelve nada para el resto de las categorías.

## Conclusiones

<a id="c-001"></a>

### C-001 — Sin reseñas ni verificación, la confianza tiene que salir de lo único que sí es real hoy: lo que el propio profesional sube

- **Sustento:** [E-003](#e-003), [E-005](#e-005), [E-006](#e-006), [E-009](#e-009).
- **Razonamiento:** cada benchmark maduro (Airbnb, TaskRabbit, Mercado Libre) pone las reseñas primero
  cuando existen, pero ninguno inventa reputación cuando no hay datos — Mercado Libre literalmente no
  calcula el termómetro antes de 10 ventas. Datealo día uno está en esa misma zona con cada profesional del
  catálogo, porque misión 07 (reseñas) todavía no existe. Tampoco puede prometerse una tasa de respuesta
  como Airbnb, porque las conversaciones pasan por WhatsApp, fuera del control de Datealo. Lo único
  verificable sin depender de reseñas es lo que el profesional mismo cargó (fotos, descripción, precio) y
  cuánto tiempo lleva su perfil activo.
- **Implicación:** el perfil público de esta misión no debe simular reseñas, "vistas" ni ningún número que
  no ocurrió de verdad — la confianza que ofrece hoy es completitud del perfil (fotos reales, descripción,
  precio) y nada que finja actividad inexistente.
- **Confianza:** media, porque no hay comportamiento propio medido todavía (Datealo no tiene usuarios) —
  se apoya en el patrón consistente de tres benchmarks distintos, no en un solo caso.

<a id="c-002"></a>

### C-002 — El mensaje de contacto directo es el sustituto real de la reseña mientras esta no existe

- **Sustento:** [E-007](#e-007), brief de esta misión (ver [README](./README.md): "acá vive el evento de
  contacto").
- **Razonamiento:** si ni Mercado Libre ni Airbnb logran ofrecer reputación completa a un vendedor u host
  nuevo, y la gente igual transacciona con ellos, es porque existe una vía de evaluación de bajo costo: el
  mensaje directo. Datealo ya construye esto por diseño — contacto directo sin intermediarios (D-004 de
  misión 04) —, así que el "tanteo" que en Airbnb es un paso extra opcional, en Datealo ya es el flujo
  principal.
- **Implicación:** el botón de contacto no es solo el cierre del perfil, es también la herramienta que
  reemplaza a la reseña mientras esta no existe — tiene que ser fácil de encontrar y usar como "primer
  contacto para tantear", no solo como "ya decidí, ahora contacto". Y como ese click es el evento del que
  depende misión 07, tiene que quedar registrado de forma confiable, no ser solo un `<a href="https://wa.me/...">`.
- **Confianza:** media — es una inferencia razonada sobre comportamiento reportado en un foro, no un dato
  medido de Datealo.

<a id="c-003"></a>

### C-003 — El "verificado" que la landing promete hoy no tiene ningún mecanismo real detrás

- **Sustento:** [E-001](#e-001), [E-004](#e-004), [E-008](#e-008), [E-009](#e-009).
- **Razonamiento:** Doctoralia puede verificar porque existe un registro central único que cubre el 100% de
  su categoría (colegio médico). Chile tiene un equivalente parcial (SEC) solo para electricidad y gas — el
  resto del catálogo de Datealo (peluquería, limpieza, mudanzas) no tiene ningún registro oficial que
  cruzar. Mostrar un badge de "verificado" sin un mecanismo real detrás (manual o cruzado contra un
  registro como la SEC) transfiere a Datealo la responsabilidad de un mal servicio que en realidad nunca
  verificó — exactamente el riesgo que ya motivó D-002 de misión 04 (nace sin revisión de nadie).
- **Implicación:** un badge de "verificado" queda fuera de esta misión — la palabra se reserva para cuando
  exista un mecanismo real detrás, aunque sea parcial (electricidad y gas primero, vía SEC, sería el camino
  más barato si se retoma). El copy actual de la landing (E-001) queda como una inconsistencia a resolver
  fuera de esta misión, no algo que esta misión deba construir para dejar de ser falso.
- **Confianza:** alta — no depende de comportamiento de usuario, es una restricción lógica (no existe el
  registro que la verificación general necesitaría) confirmada por E-008 y por la decisión ya tomada en
  misión 04.

<a id="c-004"></a>

### C-004 — El perfil tiene que verse completo y con intención incluso sin ninguna foto ni reseña, porque el día del lanzamiento eso es todos los perfiles, no un caso raro

- **Sustento:** [E-006](#e-006), [E-009](#e-009).
- **Razonamiento:** en un marketplace maduro, "sin reseñas" es la minoría marginal — un vendedor nuevo entre
  millones. En Datealo el día del lanzamiento es el 100% de los perfiles, porque misión 07 (reseñas) ni
  siquiera existe todavía y el perfil nace sin fotos ni descripción salvo que el profesional las suba
  (misión 04, F-002). Diseñar el perfil público asumiendo que "para cuando alguien lo vea ya va a tener
  fotos y reseñas" es diseñar para un estado que no va a existir por meses.
- **Implicación:** el estado vacío (sin fotos, sin descripción, sin precio, sin reseñas) no es un caso
  límite de esta misión — es el caso principal a resolver primero, y tiene que transmitir seriedad (nombre,
  categoría, comuna, contacto) sin sentirse abandonado ni falso.
- **Confianza:** alta — es una inferencia directa del estado real y conocido del producto (cero
  profesionales, cero reseñas hoy), no depende de un benchmark externo.

## El ideal: cualquier persona que necesita un profesional puede elegir con confianza entre desconocidos, sin depender de una reseña que todavía no existe

### El resultado ideal se ve así

La señora Carmen entra al perfil de Marcelo, electricista de Ñuñoa. Ve su nombre, su categoría, tres fotos
de tableros que ha instalado, una frase corta ("Electricista hace 8 años, atiendo Ñuñoa y Providencia"),
"Desde $15.000" y un botón grande de WhatsApp. Marcelo no tiene ninguna reseña todavía, pero el perfil no
se siente vacío ni sospechoso — se ve como el perfil de alguien real que trabaja en esto. Carmen le escribe
directo desde el perfil, sin llenar ningún formulario ni pasar por Datealo. Ese click queda registrado como
el primer contacto real de Marcelo, y semanas después, cuando exista misión 07, es lo que le va a permitir
a Carmen dejarle una reseña de verdad. Si en cambio Carmen abre el perfil de Jorge, que ya lleva meses
activo y acumuló reseñas de otros vecinos de Ñuñoa, Datealo se las muestra con la misma honestidad: ninguna
inventada, ninguna oculta, y ningún número de "vistas" o "contactos" que Marcelo no tiene todavía y que solo
serviría para hacerlo lucir peor sin decir nada real sobre su trabajo.

### Capacidades del ideal

| Capacidad                             | Acción habilitada                                                        | Respuesta esperada                                                                                  | Conclusión que la justifica |
| -------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------- |
| Ver el perfil completo                 | El buscador abre el perfil de un profesional desde el buscador (misión 06)   | Ve fotos, descripción, precio, categoría, comuna y contacto, incluso si algunos campos están vacíos  | [C-004](#c-004)              |
| Contactar directo desde el perfil      | El buscador toca el botón de WhatsApp o teléfono                            | Se abre la conversación directa con el profesional, sin pasar por ningún formulario de Datealo       | [C-002](#c-002)              |
| Registrar que el contacto ocurrió      | Cuando el buscador toca el botón de contacto                                | Datealo guarda que ese contacto ocurrió, en qué perfil y cuándo — es la base de la reseña de misión 07 | [C-002](#c-002)              |
| Ver reseñas acumuladas cuando existen  | El buscador abre un perfil con reseñas ya dejadas (misión 07)               | Ve las reseñas reales, sin ninguna inventada ni oculta                                                | [C-001](#c-001)              |

### El ideal no significa que Datealo verifique o mida algo que todavía no puede medir de verdad

- No significa que todo perfil tenga fotos o reseñas — la mayoría, sobre todo al lanzamiento, no las va a
  tener, y el ideal ya lo asume (C-004).
- No significa que Datealo verifique al profesional — el "verificado" no existe en este ideal; ver a qué
  costo se deja fuera y bajo qué condición se reconsidera (C-003).
- No significa que Datealo sepa si el contacto se convirtió en un trabajo real — solo que el buscador tocó
  el botón; lo que pasó después (se hizo el trabajo, quedó bien) lo resuelve misión 07, no esta.

## Referencias

- [Cómo funciona el perfil de un anfitrión en Airbnb (Guesty)](https://www.guesty.com/blog/setting-up-profile-airbnb-how-does-it-work/)
  y [Airbnb Host Rating System (Selah Collective)](https://selahcollective.studio/resources/airbnb-host-rating-system):
  usados en E-003 para las señales de confianza del perfil de un host con historial.
- [¿Cómo se verifica la autenticidad de un especialista? (Doctoralia)](https://pro.doctoralia.cl/preguntas-frecuentes/verificacion-perfiles):
  usado en E-004 para el mecanismo real de verificación contra un registro oficial único.
- [Elite Status Overview (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/46260436549915-Elite-Status-Overview)
  y [How Do I Know Which Tasker Is Best (TaskRabbit Support)](https://support.taskrabbit.com/hc/en-us/articles/46260459709723-How-Do-I-Know-Which-Tasker-Is-Best-for-My-Task):
  usados en E-005 para qué señales de confianza dependen de volumen acumulado.
- [Cómo Mercado Libre calcula tu reputación (WooSync)](https://www.woosync.io/blog/infografia-como-mercado-libre-calcula-tu-reputacion/):
  usado en E-006 para confirmar que ni un marketplace maduro finge reputación antes de tener datos.
- [Booking something with no reviews and new host (comunidad Airbnb)](https://community.withairbnb.com/t5/Ask-about-your-listing/Booking-something-with-no-reviews-and-new-host/td-p/2050845):
  usado en E-007 para el mensaje directo como sustituto real de la reseña.
- [Buscador de instaladores eléctricos y de gas SEC (ChileAtiende)](https://www.chileatiende.gob.cl/fichas/67276-buscador-de-instaladores-electricos-y-de-gas-autorizados-por-la-sec):
  usado en E-008 para el único registro oficial chileno equivalente, y su cobertura parcial.
