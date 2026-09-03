# Misión: layout general (navbar, footer, TOS) — Investigación

**Estado:** activo

**Última actualización:** 2026-09-02

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento se acumula: la evidencia y las conclusiones no se borran cuando el alcance cambia, porque
explican por qué el producto es como es. Lo que sí se actualiza es el ideal, que resume la dirección que
la investigación sostiene hoy.

Gate de salida — la investigación sostiene un producto.md cuando:
- el problema tiene situación y consecuencia concretas, no una categoría abstracta
- al menos una conclusión con confianza alta o media respalda la dirección
- el ideal describe capacidades observables, no intenciones
-->

## El problema aparece cuando alguien sale de la landing

**Situación:** Datealo está en pre-lanzamiento. La landing (`/`) tiene un hero trabajado, un nav con
estructura completa y un footer con marca — es la única pantalla que recibió ese nivel de diseño. Las
pantallas donde ocurre el resto del flujo core (`/buscar`, `/profesionales/[id]`) usan el layout
`default`, que hoy es un `<slot />` pelado: sin header, sin footer, sin ningún elemento de marca.

**Acción o necesidad:** alguien busca "gasfiter en Ñuñoa" desde el hero y llega a `/buscar`, o abre
directo un link de perfil que le compartieron por WhatsApp (una vecina le pasa el perfil de un gasfiter),
sin haber visto la landing antes.

**Respuesta actual:** ve una pantalla funcional pero sin identidad — sin logo, sin manera visible de
volver al inicio o de seguir buscando, sin footer con el contacto de Datealo. `/buscar` tiene su propia
barra de filtros, implementada aparte, sin relación visual con nada del resto de la app. Un intento de
agregar header y footer generales se implementó, se revisó visualmente y no convenció — se descartó sin
mergear.

**Consecuencia:** justo en las pantallas donde se decide si contactar a un profesional desconocido — el
momento de mayor fricción de confianza del flujo core — Datealo se ve menos terminado que en la landing.
Para un producto cuya única palanca de confianza hoy es "se ve real y cuidado" (sin volumen de reseñas ni
verificación todavía), esa caída de pulido pesa más que en un producto con reputación ya construida.

## Preguntas que la investigación debe resolver

- ¿El header y el footer generales deben ser idénticos en toda página fuera de la landing, o varían según
  qué tan "adentro" del flujo está la pantalla?
- ¿La landing sigue con su propio `LandingNavbar`/`LandingFooter`, separados del header/footer general, o
  se unifican en los mismos componentes reusados también ahí?
- ¿Cómo se resuelve la búsqueda en mobile, donde no hay espacio para los mismos campos que en desktop?
- ¿Vale la pena un bottom nav mobile, dado que las guías de UX lo recomiendan para apps donde buscar es la
  acción principal?
- ¿Qué necesita Datealo para tener una política de privacidad y términos y condiciones mínimos, dado que
  ya recolecta datos personales reales (email de profesional, contacto de reseñas)?

## Evidencia

<!--
Un hecho verificable con fuente y límite. Prioriza observación directa, entrevistas y comportamiento
comprobado. Los benchmarks de otros productos también son evidencia: qué hacen, qué trade-off eligieron y
qué no aplica a Datealo.

Datealo no tiene datos de uso propios todavía. Cuando la única evidencia disponible sea un benchmark o
una entrevista, la columna "límite" es lo que impide que se lea como dato duro.
-->

| ID    | Tipo        | Fuente                                              | Hecho verificable | Límite de la evidencia |
| ----- | ----------- | ---------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código      | `app/layouts/default.vue`                            | El layout que usan `/buscar`, `/profesionales/[id]` y `/profesional/*` es un `<slot />` sin header ni footer. | Dice qué falta, no qué se necesita en su lugar. |
| E-002 | código      | `app/pages/buscar/index.vue:41-54`                   | La barra de filtros (categoría + comuna) de `/buscar` es una implementación aparte, sin clases `lg:` propias y sin relación con ningún componente reusado en el resto de la app. | No mide impacto en usuarios reales; no hay tráfico todavía. |
| E-003 | código      | `app/components/landing/LandingFooter.vue`           | El footer actual solo tiene marca, contacto (`hola@datealo.cl`, Santiago) y copyright — sin links de navegación (categorías, cómo funciona, profesionales). | Fue diseñado para acompañar el hero de la landing, no como footer general — puede ser insuficiente incluso para su propósito actual. |
| E-004 | intento descartado | [issue #105](https://github.com/PatricioTabilo/datealo/issues/105) / [PR #106](https://github.com/PatricioTabilo/datealo/pull/106) (cerrados 2026-08-31) | Se implementó `AppHeader` (logo + link "Buscar") y se reusó el footer de la landing sin cambios en el layout `default`. Comentario de cierre: "se descarta esta implementación puntual; el header/footer general se retoma como parte de una misión de mejoras de UI/UX". | No queda registrado qué específicamente no convenció — visual, contenido, estructura — solo que el resultado no se aceptó. |
| E-005 | benchmark   | [listivo6.tangiblewp.com](https://listivo6.tangiblewp.com/) — referencia aportada por el dueño de producto | Theme de directorio de servicios: header con logo + nav a categorías/tipos de búsqueda + login/registro + contacto visible; footer de 4 columnas (contacto, links útiles, categorías, listados nuevos) + redes + copyright. | Theme genérico de WordPress para un modelo con anuncios pagos, cuentas de comprador y contenido editorial — escala y modelo de negocio distintos a los de Datealo (ver [C-003](#c-003)). |
| E-006 | código      | `app/components/landing/LandingNavbar.vue`           | El nav de la landing ya tiene logo, dos links ("Categorías", "Para profesionales" — anclas a secciones de la misma página) y un CTA "Buscar" a `/buscar`. | Los links son anclas de scroll dentro de `/` — no sirven tal cual fuera de la landing, donde esas secciones no existen. |
| E-007 | benchmark   | [doctoralia.cl](https://www.doctoralia.cl/) — directorio de profesionales de salud, referencia cercana en idioma y región | Header: logo, nav mínima, acceso diferenciado para el lado profesional ("¿Eres un especialista?"), login. Footer en columnas: legal (términos, privacidad, cookies), "para pacientes", "para profesionales", info corporativa. | Empresa multinacional madura (12 países), con líneas de negocio que Datealo no tiene — confirma el patrón de columnas, no el contenido exacto de cada una. |
| E-008 | benchmark   | [taskrabbit.com](https://www.taskrabbit.com/) — marketplace de tareas a domicilio, análogo directo de categoría | Header: logo, nav "Services", login, CTA "Become a Tasker". Footer en columnas: descubrimiento, empresa, legal, redes, app móvil. | Empresa a escala nacional en EE.UU., con piezas (carreras, prensa, blog, app) que no aplican a un producto pre-lanzamiento — mismo patrón de columnas que Doctoralia pese a ser un negocio muy distinto. |
| E-009 | código      | `app/pages/` (búsqueda completa del árbol de páginas)| No existe ninguna página de términos, privacidad ni FAQ en la app hoy. | Confirma que un footer con esos links no tiene destino todavía — no es evidencia de que no se necesite a futuro, solo de que hoy no hay dónde apuntarlos. |
| E-010 | legal       | búsqueda sobre Ley 21.719 (protección de datos personales, Chile, reemplazó a la Ley 19.628) | Aplica a cualquiera que trate datos personales, sin importar el tamaño de la empresa. Los documentos mínimos esperados: política de privacidad (qué datos, para qué, con quién se comparten, cómo ejercer derechos) y términos y condiciones (relación con el usuario, responsabilidad, propiedad intelectual sobre contenido de usuarios). Datealo ya recolecta datos reales hoy: email de profesional (magic link), datos de contacto atados a reseñas (misión 07). | No es asesoría legal — es investigación general para dimensionar el mínimo razonable, no un documento validado por un abogado. |
| E-011 | análisis (métricas) | skill `lean-analytics` aplicado a la señal de éxito de esta misión | Datealo está en la etapa "Empatía" (pre-tráfico) del framework — ahí la métrica esperada es cualitativa ("conversation notes"), no un error dejarla así. El framework sí espera que la señal tenga ya definido su reemplazo cuantitativo (ej. tasa de rebote en aterrizajes directos a `/buscar` o a un perfil) para cuando exista tráfico real. | Confirma que la etapa actual justifica lo cualitativo, no que la métrica elegida sea la mejor posible — solo que no es un error de esta fase. |
| E-012 | código      | `app/middleware/profesional.ts`, `server/api/auth/me.get.ts` | La única verificación de sesión que existe hoy es el middleware `profesional`, que llama a `/api/auth/me` por navegación, y solo corre en las páginas de `/profesional/*`. No hay ningún chequeo de sesión ni estado reactivo en páginas públicas (`/`, `/buscar`, `/profesionales/[id]`). | Confirma que mostrar "Mi perfil" en un header visible en páginas públicas exige agregar una verificación de sesión donde hoy no existe ninguna — no es solo un cambio de copy o layout. |
| E-013 | benchmark   | capturas de la app de Airbnb aportadas por el dueño de producto — [`design-mockups/referencias-airbnb/`](./design-mockups/referencias-airbnb/) | En la pantalla de inicio ([`mobile-home-sin-logo-bottom-nav.png`](./design-mockups/referencias-airbnb/mobile-home-sin-logo-bottom-nav.png)), el buscador ocupa su propia fila completa, sin compartirla con logo ni perfil — esos viven en el bottom nav. En resultados ([`mobile-resultados-comparte-fila.png`](./design-mockups/referencias-airbnb/mobile-resultados-comparte-fila.png), [`mobile-resultados-flecha-y-pill.png`](./design-mockups/referencias-airbnb/mobile-resultados-flecha-y-pill.png)), la fila superior comparte flecha atrás + un resumen compacto de la búsqueda + ícono de filtros — no hay buscador editable ni logo. En el detalle de una propiedad ([`mobile-detalle-solo-flecha.png`](./design-mockups/referencias-airbnb/mobile-detalle-solo-flecha.png)), solo aparece flecha atrás. | Es la app de Airbnb (usuario con sesión, con bottom nav) — Datealo no tiene bottom nav ni cuentas del lado buscador, así que el patrón se adapta, no se copia literal (ver [C-010](#c-010), [C-011](#c-011)). |
| E-014 | benchmark + investigación | búsqueda sobre patrones de búsqueda mobile y sticky headers | En mobile, el espacio de pantalla es limitado y el teclado ocupa gran parte de la vista — el patrón recomendado es "expandable": un botón/resumen compacto por defecto, que expande a una vista completa (o pantalla completa) al tocarlo, en vez de los mismos campos editables que en desktop. Un sticky header recomienda máximo ~50px de alto y evitar duplicar controles de búsqueda entre header y body. | Son guías generales de la industria, no medidas en el contexto específico de Datealo — sirven para descartar el patrón "mismos campos, más chicos", no para fijar píxeles exactos. |
| E-015 | investigación | búsqueda sobre zona de alcance del pulgar y navegación mobile | El tercio inferior de la pantalla es la zona más alcanzable con una mano; la navegación superior (headers, hamburger arriba a la derecha) es la más difícil de alcanzar. Se recomienda bottom nav (3-5 ítems) para navegación primaria en apps donde esa navegación es central, dejando el hamburger para lo secundario (cuenta, legal, cerrar sesión). | Es una guía general — no dice qué pasa cuando, como Datealo, no hay 3-5 destinos reales que llenen un bottom nav con sentido (ver [C-010](#c-010)). |
| E-016 | investigación | búsqueda sobre branding/logo en apps nuevas vs. establecidas | La práctica general es no repetir el logo en cada pantalla (el usuario ya sabe en qué app está); en páginas profundas el logo se vuelve "decorativo", la flecha atrás es la prioridad funcional. Para una marca nueva o desconocida, lo que construye confianza es la consistencia del lenguaje visual (colores, tipografía, estilo) en todas las superficies — no el logo repetido — con el logo reservado para pantallas clave (la de entrada). | Guía general de branding en apps, no un estudio específico de marketplaces de servicios pre-lanzamiento en Chile. |
| E-017 | benchmark   | capturas de la app de Airbnb aportadas por el dueño de producto — [`mobile-buscador-desplegado-sugerencias.png`](./design-mockups/referencias-airbnb/mobile-buscador-desplegado-sugerencias.png), [`desktop-buscador-colapsado.png`](./design-mockups/referencias-airbnb/desktop-buscador-colapsado.png), [`desktop-buscador-desplegado-sugerencias.png`](./design-mockups/referencias-airbnb/desktop-buscador-desplegado-sugerencias.png) | Al tocar/hacer click en el buscador, Airbnb muestra el mismo contenido en ambos tamaños — "Búsquedas recientes" y "Destinaciones sugeridas" (ej. "Cerca", con ícono de ubicación) — pero en un contenedor distinto: en mobile es una hoja a pantalla completa; en desktop es un panel flotante debajo del buscador compacto del header, con el resto de la página visible atrás. | Airbnb tiene 3 campos (dónde, cuándo, quién) y cuentas de usuario (por eso "búsquedas recientes"); Datealo tiene 2 campos (categoría, comuna) y sin cuentas del lado buscador — el contenido de "recientes" no aplica igual (ver [C-013](#c-013)). |
| E-018 | código      | `server/db/schema/professionals.ts`, `reviews.ts`, `professional-contact-events.ts`, `professional-contact-tokens.ts` | Enumeración completa de datos personales que Datealo guarda hoy: de un profesional — email, nombre a mostrar, categoría, comuna, contacto, descripción, precio referencial, fotos. De una reseña — un token anónimo por navegador, rating, comentario opcional, nombre opcional; nunca un email ni teléfono del reseñador. El lado buscador no guarda nada identificable. No hay analítica ni tracking de terceros (`nuxt.config.ts` no tiene Google Analytics, Sentry ni similares); Supabase y Resend son los únicos proveedores externos que tocan estos datos. | Es el estado del código hoy — si el schema cambia en una misión futura, esta enumeración queda desactualizada y la Política de Privacidad debe revisarse. |
| E-019 | investigación | búsqueda sobre diseño de footer, mobile vs. desktop | En desktop, 4-6 columnas es el máximo recomendado — Datealo ya está en 4. En mobile, la práctica estándar es apilar todo en una sola columna, o usar acordeón cuando hay muchos links (algunos footers de referencia manejan 50-75). | Guía general — no dice qué hacer cuando, como Datealo, el footer es intencionalmente chico (~5 links reales); esa lectura es propia (ver [C-014](#c-014)). |
| E-020 | código      | búsqueda de `geolocation`/`getCurrentPosition` en todo `app/` y `server/` | No existe ningún uso de la API de geolocalización del navegador en el código hoy — cero resultados. | Confirma que "Cerca de ti" (tomado literal de la referencia de Airbnb, [E-017](#e-017)) describía una funcionalidad nueva que nadie pidió, colada por copiar el detalle visual de la referencia sin auditarlo — el dueño de producto lo detectó y pidió sacarlo (ver [C-015](#c-015)). |
| E-021 | código      | `server/api/search.get.ts`, `app/pages/buscar/index.vue` (misión 06, ya construido) | `/api/search` exige `categoria` **y** `comuna` — responde `400 comuna_required` si falta la comuna. `/buscar` refleja lo mismo: sin comuna elegida muestra el estado "Elige tu comuna" y nunca dispara la búsqueda (`ready` en `useSearchResults` requiere ambos valores). El fallback "vecina" que sí existe busca en comunas cercanas **a la comuna elegida**, no reemplaza el requisito de elegir una. | Al escribir esta misión se documentó un camino "buscar solo con categoría" que ninguna parte del código soportaba — se detectó auditando el código antes de armar `ingenieria.md` (ver [C-016](#c-016)). |

## Conclusiones

<a id="c-001"></a>

### C-001 — El layout general necesita header y footer propios, no una reutilización directa del de la landing

- **Sustento:** [E-001](#e-001), [E-003](#e-003), [E-004](#e-004).
- **Razonamiento:** el footer de la landing se diseñó para acompañar su propio hero (marca + contacto),
  no para orientar navegación en el resto de la app; reusarlo tal cual fue parte del intento que no
  convenció.
- **Implicación:** el header/footer general necesita su propio diseño — puede compartir el lenguaje
  visual de la landing, pero no necesariamente su mismo contenido.
- **Confianza:** media, porque el "no convenció" del intento anterior no quedó desglosado; esta lectura es
  la hipótesis más razonable, no un hecho confirmado por el dueño de producto.

<a id="c-002"></a>

### C-002 — La brecha de pulido entre la landing y el resto de la app pesa más de lo que parece, porque golpea el tramo de mayor fricción de confianza del flujo core

- **Sustento:** [E-001](#e-001), [E-002](#e-002).
- **Razonamiento:** `/buscar` y `/profesionales/[id]` son las pantallas donde alguien decide si confía lo
  suficiente en un desconocido para contactarlo. Llegar ahí desde un link compartido, sin haber visto la
  landing, amplifica el efecto.
- **Implicación:** la prioridad de esta misión no es "verse más bonito" en abstracto — es cerrar la brecha
  de navegación y marca específicamente en esas dos superficies.
- **Confianza:** alta — se sostiene en la identidad de producto y el flujo core ya definidos en
  `CLAUDE.md`, no depende de datos de uso que todavía no existen.

<a id="c-003"></a>

### C-003 — El benchmark aportado sirve como referencia de estructura y jerarquía visual, no de alcance funcional

- **Sustento:** [E-005](#e-005).
- **Razonamiento:** Datealo no tiene ni necesita anuncios pagos, cuentas de comprador ni contenido
  editorial en esta fase (ver guardrails de producto en `CLAUDE.md`); replicar esas secciones agregaría
  pasos ajenos al flujo buscar → perfil → contactar.
- **Implicación:** `producto.md` debe acotar explícitamente qué partes de la referencia entran (visual del
  header/footer) y cuáles quedan fuera de alcance (blog, login/registro, comparar/favoritos).
- **Confianza:** alta.

<a id="c-004"></a>

### C-004 — Todo footer de marketplace revisado se organiza en los mismos tres pilares: lado buscador, lado profesional, y contacto/legal — sin importar cuán distinto sea el negocio

- **Sustento:** [E-005](#e-005), [E-007](#e-007), [E-008](#e-008).
- **Razonamiento:** listivo6 (theme genérico), Doctoralia (salud, multinacional) y TaskRabbit (tareas a
  domicilio, EE.UU.) no comparten escala ni modelo de negocio, pero los tres arman su footer con la misma
  lógica: una columna que sirve a quien busca, una que sirve a quien ofrece el servicio, y una de
  contacto/legal.
- **Implicación:** el footer de Datealo — general y de landing — debería cubrir esos tres pilares. La
  columna legal necesita páginas reales de destino primero (ver [E-009](#e-009), [E-010](#e-010)).
- **Confianza:** media — la convergencia entre tres referencias es una señal más fuerte que un solo
  benchmark, pero sigue siendo evidencia externa, no validada con usuarios de Datealo.

<a id="c-005"></a>

### C-005 — El header de la landing ya resuelve la estructura correcta (lado buscador + lado profesional + CTA); al header general le falta adaptar esa misma estructura, no inventar una nueva

- **Sustento:** [E-006](#e-006), [E-007](#e-007), [E-008](#e-008).
- **Razonamiento:** `LandingNavbar` ya tiene los tres elementos que muestran los tres benchmarks (acceso a
  categorías, acceso al lado profesional, CTA de búsqueda) — el problema no es que la landing eligió mal,
  es que esos links son anclas de scroll que no existen fuera de `/`.
- **Implicación:** el header general necesita la misma estructura con destinos reales, no un diseño nuevo
  desde cero.
- **Confianza:** alta.

<a id="c-006"></a>

### C-006 — El footer de la landing está tan sub-construido como el que falta en el resto de la app

- **Sustento:** [E-003](#e-003), [E-005](#e-005), [E-007](#e-007), [E-008](#e-008).
- **Razonamiento:** `LandingFooter.vue` (marca + contacto + copyright) le falta exactamente lo mismo que
  al footer general: navegación hacia el lado buscador y hacia el lado profesional.
- **Implicación:** esta misión revisa el contenido de `LandingFooter.vue` además de crear el footer
  general — no como el mismo componente ([D-002](./producto.md#d-002)), sino cada uno resolviendo los
  mismos tres pilares de [C-004](#c-004) con sus propios links.
- **Confianza:** alta.

<a id="c-007"></a>

### C-007 — La señal cualitativa de esta misión es correcta para la etapa actual, pero le falta su reemplazo cuantitativo definido para cuando exista tráfico

- **Sustento:** [E-011](#e-011).
- **Razonamiento:** el framework de métricas lean ubica a Datealo en la etapa "Empatía" — ahí la métrica
  esperada es cualitativa, no un error de esta misión.
- **Implicación:** `producto.md` anota qué métrica cuantitativa la reemplaza cuando exista tráfico real,
  sin instrumentarla todavía.
- **Confianza:** alta.

<a id="c-008"></a>

### C-008 — Un profesional con sesión activa debería ver un acceso directo a "Mi perfil" en el header, en vez del CTA de registro — pero eso agrega una verificación de sesión que hoy no existe fuera de `/profesional/*`

- **Sustento:** [E-012](#e-012).
- **Razonamiento:** mostrarle "Quiero ser profesional" a alguien que ya creó su perfil es, en el mejor
  caso, ruido, y en el peor, una señal de que Datealo no lo reconoce — mala experiencia justo para el lado
  difícil del marketplace, el más caro de conseguir y retener.
- **Implicación:** el "para quién" del header no es solo buscador vs. profesional-sin-cuenta — también es
  profesional-con-cuenta. Introduce una consulta de sesión en páginas que hoy no la tienen, factibilidad
  que ingeniería valida en `ingenieria.md`.
- **Confianza:** alta en la necesidad de producto; media en el costo de implementación, no medido acá.

<a id="c-009"></a>

### C-009 — El buscador no puede ser el mismo componente inline en mobile y en desktop; en mobile necesita un patrón expandible, no los mismos campos achicados

- **Sustento:** [E-013](#e-013), [E-014](#e-014).
- **Razonamiento:** en mobile el teclado ocupa gran parte de la pantalla y se escribe con el pulgar —
  achicar los mismos inputs no resuelve el problema de espacio, lo empeora. El patrón que confirma tanto
  la investigación general como el caso real de Airbnb es: un botón/resumen compacto que, al tocarlo,
  abre una vista dedicada con los campos grandes.
- **Implicación:** el buscador de Datealo necesita dos comportamientos según el ancho de pantalla — mismo
  componente de datos (categoría + comuna), presentación distinta.
- **Confianza:** alta — converge investigación general con un caso real, y fue confirmado explícitamente
  por el dueño de producto.

<a id="c-010"></a>

### C-010 — Un bottom nav no aplica a Datealo hoy — no hay suficientes secciones reales que lo justifiquen

- **Sustento:** [E-013](#e-013), [E-015](#e-015).
- **Razonamiento:** la investigación de zona de alcance recomienda bottom nav para navegación primaria en
  apps mobile-first — pero esa recomendación asume varios destinos reales y distintos (en Airbnb: Explora,
  Favoritos, Viajes, Mensajes, Perfil). Datealo hoy solo tiene, como mucho, tres destinos reales (Inicio,
  Buscar, Publícate/Mi perfil), y el buscador ya cubre la función de "explorar". Un bottom nav con
  contenido inventado (favoritos, mensajes) violaría el guardrail de no agregar complejidad antes de
  tener tracción.
- **Implicación:** se descarta explícitamente, no se posterga sin razón — la condición de reapertura es
  concreta: que aparezcan secciones reales que lo justifiquen.
- **Confianza:** alta — decisión explícita del dueño de producto, con razón registrada.

<a id="c-011"></a>

### C-011 — El header debe seguir un patrón de profundidad: mientras más adentro del flujo está la pantalla, menos elementos de navegación superior y más foco en volver atrás

- **Sustento:** [E-013](#e-013), [E-016](#e-016).
- **Razonamiento:** en el caso real de Airbnb, ni el logo ni el buscador editable aparecen en toda
  pantalla — el logo se reemplaza por una flecha atrás en resultados y detalle, y el buscador se reemplaza
  primero por su resumen compacto (resultados) y después desaparece del todo (detalle), porque ya no hace
  falta volver a buscar desde ahí, solo volver a donde se estaba. La investigación de branding confirma
  que para una marca nueva, lo que construye confianza es la consistencia visual entre pantallas, no el
  logo repetido en cada una — el logo se reserva para la pantalla de entrada.
- **Implicación:** el header de Datealo varía según profundidad — landing (logo + nav + buscador grande
  en el hero), `/buscar` (flecha atrás + resumen compacto de la búsqueda), perfil (solo flecha atrás) —
  sin que esto contradiga la intención original de "un componente, sin variantes ad-hoc" ([D-001](./producto.md#d-001)):
  es un patrón deliberado y respaldado por evidencia, no una variante inventada por conveniencia.
- **Confianza:** alta — patrón consistente en un caso real bien documentado, más la guía de branding.

<a id="c-012"></a>

### C-012 — `/buscar` no necesita su propia barra de filtros separada; el buscador del header (o su resumen compacto) cumple esa función

- **Sustento:** [E-002](#e-002), [E-013](#e-013), [E-014](#e-014).
- **Razonamiento:** si el header ya muestra un buscador o su resumen compacto en toda página fuera de la
  landing, mantener además la barra de filtros propia de `/buscar` duplica el control de búsqueda en
  header y body a la vez — justo lo que las guías de sticky header recomiendan evitar. El caso de Airbnb
  no muestra dos buscadores en la misma pantalla.
- **Implicación:** la barra de filtros ad-hoc de `/buscar` ([E-002](#e-002)) se retira; su función la
  cumple el mismo componente de buscador que usa el header en el resto de la app.
- **Confianza:** alta — confirmado explícitamente por el dueño de producto sobre el caso de Airbnb.

<a id="c-013"></a>

### C-013 — El buscador necesita un panel de sugerencias al tocar cada campo — categoría completa, comuna con sugerencias — pero sin "búsquedas recientes", porque el lado buscador no tiene cuentas

- **Sustento:** [E-017](#e-017).
- **Razonamiento:** Airbnb muestra el mismo contenido de sugerencias en mobile (hoja completa) y desktop
  (panel flotante) al tocar un campo — no son selects nativos vacíos, ayudan a decidir. Con solo 8
  categorías, mostrarlas todas como filas tocables no necesita distinguir "sugeridas" de "todas". La
  comuna sí se beneficia de sugerencias porque la lista es más larga. "Búsquedas recientes" depende de
  que exista una cuenta o un historial persistente — el lado buscador de Datealo no tiene sesión (ver
  "Tipos de usuario" en `CLAUDE.md`), y el dueño de producto decidió explícitamente no agregarlo vía
  almacenamiento del navegador tampoco.
- **Implicación:** el buscador compacto ([F-002](./producto.md#f-002)) necesita, al tocar cada campo, un
  panel con contenido — categorías completas y sugerencias de comuna — pero no una sección de historial.
  Qué sugerencia concreta usar para comuna se corrigió después — ver [C-015](#c-015).
- **Confianza:** alta — confirmado directamente por el dueño de producto sobre ambas decisiones (sumar
  sugerencias, no sumar recientes).

<a id="c-014"></a>

### C-014 — El footer de Datealo es intencionalmente chico (~5 links reales), así que en mobile alcanza con apilar las columnas — no hace falta acordeón, y las categorías no van una por una

- **Sustento:** [E-019](#e-019), [C-004](#c-004), [C-013](#c-013).
- **Razonamiento:** la recomendación de acordeón en mobile aplica a footers con muchos links (algunas
  referencias manejan 50-75) — el de Datealo, con cuatro columnas de contenido real (buscador,
  profesional, contacto, legal) tiene apenas ~5 links en total. Agregar interactividad (acordeón) para
  tan poco contenido es complejidad sin beneficio — el mismo criterio YAGNI que ya aplica al resto del
  código. Listar las 8 categorías una por una en el footer sería relleno: el buscador compacto
  ([F-002](./producto.md#f-002)) ya deja elegir categoría en un paso, y con la oferta todavía chica en
  varias comunas, enumerar categorías sin contexto de disponibilidad no ayuda a decidir.
- **Implicación:** el footer se arma con: marca (logo + tagline), un link genérico a "Buscar
  profesionales" (no una lista de categorías), un link al lado profesional ("Publícate"/"Mi perfil"),
  contacto como texto (no links), y Términos/Privacidad. En mobile, todo apilado en una sola columna sin
  acordeón; en desktop, en fila.
- **Confianza:** alta — confirmado directamente por el dueño de producto.

<a id="c-015"></a>

### C-015 — La sugerencia de comuna del buscador se apoya en datos que Datealo ya tiene (comunas con más profesionales), no en geolocalización

- **Sustento:** [E-020](#e-020).
- **Razonamiento:** "Cerca de ti" con geolocalización se copió literal de la referencia de Airbnb
  ([E-017](#e-017)) al diseñar el panel de sugerencias, sin auditarlo como una funcionalidad nueva — no
  existe ningún uso de la API de geolocalización en el código hoy, y nadie la pidió. El dueño de producto
  lo detectó al revisar el mockup. Una lista de comunas frecuentes (las que ya tienen más profesionales
  activos) entrega un resultado parecido — ayuda a decidir sin escribir — sin pedir un permiso del
  navegador ni depender de que el usuario lo conceda.
- **Implicación:** [F-002](./producto.md#f-002) reemplaza la sugerencia "Cerca de ti" por comunas
  frecuentes. Ningún flujo de esta misión pide permiso de ubicación.
- **Confianza:** alta — confirmado directamente por el dueño de producto, y respaldado por el estado real
  del código ([E-020](#e-020)).

<a id="c-016"></a>

### C-016 — "Buscar solo con categoría" no es una capacidad que exista hoy; el botón "Buscar" del buscador compacto se habilita solo con categoría y comuna elegidas

- **Sustento:** [E-021](#e-021).
- **Razonamiento:** al diseñar `experiencia.md` se documentó un camino donde el botón "Buscar" se
  habilitaba apenas había categoría elegida, navegando a `/buscar` sin comuna. Auditando el código real de
  la misión 06 (ya construido, no algo que esta misión vaya a tocar — F-002 dice explícitamente que no
  cambia reglas de negocio del buscador) se encontró que `/api/search` exige ambos parámetros y `/buscar`
  nunca busca sin comuna elegida. El camino documentado describía una funcionalidad que ninguna capa del
  código soporta.
- **Implicación:** [F-002](./producto.md#f-002) corrige la regla — el botón "Buscar" se habilita solo con
  categoría **y** comuna. Extender `/api/search` para aceptar solo categoría sería agregar alcance nuevo al
  buscador (qué comuna(s) mostrar sin que el usuario elija ninguna), una decisión de producto que esta
  misión de layout no toma.
- **Confianza:** alta — verificado leyendo el código fuente de ambos archivos.

## El ideal: la app se siente como un solo producto terminado, con una navegación que se adapta a dónde estás, no una landing con páginas sueltas atrás

<!--
El ideal es el producto de la investigación: la dirección que la evidencia sostiene, sin restricciones de
implementación. El recorte a la primera entrega no vive aquí — vive en producto.md como decisión de
alcance. Esta sección sí se reescribe cuando nueva evidencia cambia la dirección.
-->

### El resultado ideal se ve así

Una vecina de Ñuñoa recibe por WhatsApp el link del perfil de un gasfiter — nunca ha visto datealo.cl
antes. Abre el link desde su celular: la página carga con una flecha simple arriba a la izquierda —no un
logo, no un buscador— porque no hace falta más que volver a donde estaba. Al bajar, encuentra un footer
con navegación real: categorías para seguir buscando, un link para el profesional que quiera sumarse, el
contacto de Datealo. Se siente un producto real, con una base, no una página huérfana.

Si en cambio llega primero a la landing desde su celular, ve el logo y el buscador en su propia fila,
grande y claro; al tocarlo, se abre una vista dedicada con categoría y comuna, sin pelear con el teclado
en una fila angosta. Si busca y llega a resultados, la fila de arriba cambia: flecha atrás y un resumen
de lo que está buscando, tocable para ajustarlo — ya no hace falta el buscador completo ni el logo, hace
falta volver o refinar.

### Capacidades del ideal

| Capacidad                       | Acción habilitada                                                    | Respuesta esperada                                                                          | Conclusión que la justifica |
| -------------------------------- | ---------------------------------------------------------------------| --------------------------------------------------------------------------------------------- | ---------------------------- |
| Header con profundidad           | cualquier página de la app                                           | landing: logo + nav + buscador grande. `/buscar`: flecha atrás + resumen compacto de búsqueda. Perfil: solo flecha atrás. | [C-002](#c-002), [C-005](#c-005), [C-011](#c-011) |
| Buscador adaptado a mobile/desktop | cualquiera que busque desde cualquier pantalla                     | mobile: botón/resumen compacto que expande a vista completa. Desktop: inline compacto, siempre visible. Al tocar cada campo, un panel con las categorías completas o comunas frecuentes — sin búsquedas recientes, sin geolocalización. | [C-009](#c-009), [C-012](#c-012), [C-013](#c-013), [C-015](#c-015) |
| Footer con navegación real, en la landing y fuera de ella | cualquier página de la app, landing incluida | footer que cubre los tres pilares: lado buscador (categorías), lado profesional (registro), contacto/legal | [C-001](#c-001), [C-004](#c-004), [C-006](#c-006) |
| Sesión de profesional reconocida en el header | un profesional con sesión activa                              | "Mi perfil" en vez del CTA de registro | [C-008](#c-008) |
| Sin bottom nav                   | —                                                                     | navegación vive en el header, con el patrón de profundidad — no en una barra inferior sin suficientes destinos reales | [C-010](#c-010) |

### El ideal no significa clonar el catálogo de funcionalidades de la referencia

- No significa agregar blog, login/registro de comprador ni comparar/favoritos — esas piezas no tienen
  lugar en el modelo de Datealo hoy (ver guardrails de producto en `CLAUDE.md`).
- No significa un bottom nav "porque Airbnb lo tiene" — Datealo no tiene los destinos reales que lo
  justifican ([C-010](#c-010)).
- No significa agregar la columna legal del footer sin antes tener las páginas de términos y privacidad
  ([E-009](#e-009)) — esta misión sí construye una versión simple de esas páginas para poder enlazarlas.
- No significa "búsquedas recientes" en el buscador — Airbnb lo puede mostrar porque tiene cuentas; el
  lado buscador de Datealo no, y el dueño de producto decidió no resolverlo con almacenamiento del
  navegador tampoco ([C-013](#c-013)).
- No significa pedir permiso de ubicación — "Cerca de ti" con geolocalización se copió de la referencia
  sin ser una funcionalidad real de Datealo; la sugerencia de comuna se resuelve con datos que ya existen
  (comunas con más profesionales), no con una API nueva ([C-015](#c-015)).

## Referencias

<!-- Fuentes primarias citadas por las evidencias. El enlace no sustituye el hecho y el límite en E-xxx. -->

- [issue #105](https://github.com/PatricioTabilo/datealo/issues/105) / [PR #106](https://github.com/PatricioTabilo/datealo/pull/106): usados en E-004.
- [`design-mockups/referencias-airbnb/`](./design-mockups/referencias-airbnb/): capturas de la app de
  Airbnb aportadas por el dueño de producto, usadas en E-013 y E-017 — referencia directa para
  `experiencia.md` sobre cómo mostrar el patrón de profundidad y el panel de sugerencias del buscador.
- [listivo6.tangiblewp.com](https://listivo6.tangiblewp.com/): usado en E-005.
- [doctoralia.cl](https://www.doctoralia.cl/): usado en E-007.
- [taskrabbit.com](https://www.taskrabbit.com/): usado en E-008.
- [¿Cómo hago los términos y condiciones para cumplir con la ley de protección de datos de Chile?](https://www.beckerabogados.cl/blog/como-hago-los-terminos-y-condiciones-para-cumplir-con-la-ley-de-proteccion-de-datos-personales-de-chile/): usado en E-010.
- [Ley 21.719 Chile: guía para empresas 2026](https://www.yourdevs.cl/blog/ley-21719-proteccion-datos-chile): usado en E-010.
- [Designing A Better Back Button UX — Smashing Magazine](https://www.smashingmagazine.com/2022/08/back-button-ux-design/): usado en E-016.
- [What is Branding in UX Design? — IxDF](https://ixdf.org/literature/topics/branding-in-ux-design): usado en E-016.
- [Mastering the Thumb Zone](https://parachutedesign.ca/blog/thumb-zone-ux/): usado en E-015.
