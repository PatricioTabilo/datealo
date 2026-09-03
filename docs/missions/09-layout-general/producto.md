# Misión: layout general (navbar, footer, TOS) — Producto

**Estado:** vigente — aprobado por Patricio el 2026-09-02

**Última actualización:** 2026-09-03

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento es la spec viva del resultado: qué construimos ahora y bajo qué reglas. El porqué vive en
investigacion.md — aquí solo se enlaza. Se reescribe cuando el alcance cambia; no acumula historia.

Gate de salida — producto.md está listo para experiencia.md cuando:
- cada funcionalidad tiene formato JTBD, reglas y al menos un caso límite con comportamiento definido
- cada funcionalidad enlaza una conclusión de investigacion.md y una señal de éxito
- cada funcionalidad declara a qué lado del marketplace sirve, y qué necesita del otro lado para funcionar
- no hay decisiones de producto delegadas a diseño o ingeniería
- las decisiones propuestas tienen fecha límite en el README
-->

## Qué construimos: una navegación que se adapta a dónde estás, consistente en toda la app

**Resultado:** al terminar esta entrega, cualquier persona que llegue a datealo.cl —por la landing o por
un link directo a `/buscar` o a un perfil público— ve una app con navegación consistente: un header que
cambia según qué tan adentro del flujo está (logo y buscador grande en la landing, flecha atrás y
resumen compacto en `/buscar`, solo flecha atrás en el perfil), footers con navegación real en la landing
y fuera de ella, y páginas simples de términos y privacidad a las que el footer puede apuntar.

**Recorte respecto del ideal:** [el ideal](./investigacion.md) cubre toda la navegación de la app; esta
entrega se limita a la navegación misma (header, footer, buscador compacto, sesión de profesional, TOS) y
deja fuera el contenido de las pantallas que esa navegación envuelve — el hero y copy de la landing, la
vista de resultados de búsqueda y la vista de detalle de perfil son misiones aparte (12, 10 y 11), porque
cada una tiene su propio problema de diseño independiente del layout que las envuelve.

**Restricciones aceptadas:** solo web responsive (mobile 390px sigue siendo el caso principal, desktop es
un ajuste dedicado); sin bottom nav ([D-007](#d-007)); TOS y privacidad simples, redactados por Datealo sin
asesoría legal externa, cubriendo solo lo que la plataforma recolecta hoy.

## Funcionalidades

| ID    | Funcionalidad                                                | Lado    | Sustento                          | Éxito |
| ----- | --------------------------------------------------------------| ------- | ------------------------------------ | ----- |
| F-001 | Header con patrón de profundidad                               | ambos   | C-001, C-002, C-005, C-008, C-011, D-001, D-002, D-005 | M-001 |
| F-002 | Buscador compacto reutilizable (mobile expandible, desktop inline) | buscador | C-009, C-012, C-013, C-015, D-006 | M-001 |
| F-003 | Footer con navegación real, en la landing y fuera de ella       | ambos   | C-001, C-003, C-004, C-006, C-014, D-003, D-004 | M-001 |
| F-004 | Páginas simples de Términos y Privacidad                        | ambos   | E-010, E-018, D-004               | M-002 |

<a id="f-001"></a>

### F-001 — Header con patrón de profundidad

Cuando abro cualquier página de Datealo, en cualquier punto del flujo,
quiero ver solo la navegación que tiene sentido desde ahí,
para no perderme ni sentir que cada pantalla es un producto distinto.

**Lado del marketplace:** ambos — el buscador navega la mayor parte del flujo; un profesional revisa o
comparte su propio perfil, o vuelve con sesión activa. **Qué necesita del otro lado:** nada — es trabajo
de navegación, no depende de volumen de perfiles ni de reseñas.

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[C-005](./investigacion.md#c-005), [C-008](./investigacion.md#c-008), [C-011](./investigacion.md#c-011) y
[D-001](#d-001), [D-002](#d-002), [D-005](#d-005). **Éxito:** [M-001](#m-001).

**Reglas:**

- En la landing (`/`), Datealo muestra `LandingNavbar`: logo, un link a categorías (ancla a la sección),
  un link al lado profesional — "Publícate" si no hay sesión, "Mi perfil" si la hay — y el buscador grande
  vive en el hero, no en el nav.
- En `/buscar`, Datealo reemplaza el logo por un botón de volver (vuelve a la landing) y muestra el
  [buscador compacto](#f-002) en modo resumen — nunca ambos (logo y buscador completo) a la vez.
- En `/profesionales/[id]` y `/profesional/*`, Datealo muestra solo el botón de volver — a `/buscar`
  conservando los filtros elegidos, o a donde corresponda — sin logo, sin buscador.
- **Layout en desktop:** tres zonas — botón de volver (con ícono y el texto "Volver") a la izquierda, el
  buscador compacto centrado en medio (cuando la página lo tiene), y el acceso al lado profesional a la
  derecha. El buscador se centra respecto al ancho completo del header, no pegado al botón de volver.
- **Layout en mobile:** el botón de volver es solo el ícono, sin texto "Volver" — 390px no alcanza para
  dos íconos, texto y el buscador a la vez. El buscador ocupa el espacio restante.
- Si hay una sesión de profesional activa, el acceso al lado profesional se muestra como el avatar del
  profesional (a la derecha), que lleva a `/profesional/perfil` — ver [D-005](#d-005). Usa el mismo campo
  y el mismo fallback a iniciales que ya definió la misión 08 (`avatarPath`) — nada nuevo, mismo patrón
  que `SearchResultCard`. Si no hay sesión,
  fuera de la landing **no se muestra ningún acceso al lado profesional** — ni ícono ni texto — el CTA de
  registro ("Publícate") vive solo en la landing y en el footer ([F-003](#f-003)); no se repite en cada
  header para no competir con el buscador en mobile, donde el espacio es la restricción real.
- Mientras no se resuelve si hay sesión activa, el header muestra el estado sin sesión — nunca parpadea de
  un estado a otro ni deja el espacio vacío.
- El header se muestra en todo estado de la página que envuelve (cargando, tardando, sin resultados, no
  encontrado) — no solo en el estado con datos.

**Ejemplo verificable:** dado que alguien abre `/profesionales/casa-del-gasfiter-nunoa` directo desde un
link de WhatsApp, cuando la página carga, entonces ve solo el ícono de volver arriba a la izquierda — sin
logo, sin buscador, sin nada a la derecha — que lo devuelve a `/buscar` con los filtros que hubiera
elegido antes, o vacíos si no venía de ahí. Dado que quien abre ese mismo link es un profesional con
sesión activa, ve además su avatar arriba a la derecha.

**No incluye:** un menú de cuenta completo (nombre, cerrar sesión, configuración) — el avatar es un solo
link directo a "Mi perfil", sin desplegable, para esta misión. Tampoco incluye el footer — ver
[F-003](#f-003). Tampoco incluye ningún estado de sesión del lado buscador — ese lado no tiene cuentas hoy
(ver "Tipos de usuario" en `CLAUDE.md`).

**Experiencia:** —. **Ingeniería:** —.

<a id="f-002"></a>

### F-002 — Buscador compacto reutilizable (mobile expandible, desktop inline)

Cuando busco un profesional desde cualquier pantalla y cualquier dispositivo,
quiero un buscador que se sienta cómodo para ese tamaño de pantalla,
para no pelear con campos apretados en mobile ni ver un componente desaprovechando espacio en desktop.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** los mismos profesionales que ya
existen en la comuna buscada — no depende de volumen adicional.

**Sustento:** [C-009](./investigacion.md#c-009), [C-012](./investigacion.md#c-012),
[C-013](./investigacion.md#c-013), [C-015](./investigacion.md#c-015), [C-016](./investigacion.md#c-016),
[D-006](#d-006) y [D-008](#d-008). **Éxito:** [M-001](#m-001).

**Reglas:**

- En mobile, el buscador se muestra como un botón/resumen compacto de ancho completo — nunca los campos
  de categoría y comuna editables directamente en la fila. Al tocarlo, abre una hoja a pantalla completa
  con esos campos, uno expandido a la vez (acordeón: el campo activo se expande, el otro queda colapsado
  debajo, tocable para expandirse en su turno) y un botón "Buscar" fijo abajo, habilitado solo cuando hay
  categoría **y** comuna elegidas — `/api/search` (misión 06) exige ambas (`comuna_required` si falta);
  buscar con solo categoría no es una capacidad que exista hoy, y esta misión no cambia esa regla de
  negocio ([C-016](./investigacion.md#c-016)).
- En desktop, el buscador se muestra inline, compacto, siempre visible en el header. Al hacer click en un
  campo, se abre un panel flotante debajo (no a pantalla completa) con el mismo contenido que en mobile —
  el resto de la página queda visible atrás.
- En desktop, el buscador tiene dos densidades — ver [D-008](#d-008): **completa**, con el nombre del
  campo ("Categoría"/"Comuna") sobre su valor, para el navbar de la landing tras hacer scroll ([F-001](#f-001));
  y **chica**, solo el valor elegido, sin el nombre del campo encima, para el header general fijo
  (`/buscar`, perfil, `/profesional/*`) — ahí el buscador está siempre a la vista, así que no necesita
  ocupar el alto de la versión completa.
- Al expandirse el campo de categoría (mobile o desktop), Datealo muestra las 8 categorías como filas
  tocables — no hace falta distinguir "sugeridas" de "todas", son pocas.
- Al expandirse el campo de comuna, Datealo muestra un buscador de texto más una lista corta de comunas
  frecuentes (las que más profesionales activos tienen hoy) como sugerencia — la lista completa de comunas
  es más larga que las categorías. Sin geolocalización: Datealo no pide permiso de ubicación en ningún
  punto de esta misión — es una funcionalidad nueva que no existe hoy en el código
  ([E-020](./investigacion.md#e-020)) y no fue pedida.
- Datealo nunca muestra una sección de "búsquedas recientes" — el lado buscador no tiene cuentas, y esta
  misión no agrega ese historial vía almacenamiento del navegador tampoco ([C-013](./investigacion.md#c-013)).
- En `/buscar`, este componente **reemplaza** la barra de filtros que existe hoy como parte de la página
  ([E-002](./investigacion.md#e-002)) — no conviven los dos.
- Datealo nunca muestra el buscador completo (editable) y su resumen compacto a la vez en la misma
  pantalla.

**Ejemplo verificable:** dado que alguien entra a `/buscar?categoria=gasfiteria&comuna=nunoa` desde un
celular de 390px, cuando la página carga, entonces ve un resumen compacto ("Gasfitería en Ñuñoa") en vez
de los selectores de categoría y comuna editables sueltos como hoy. Dado que toca ese resumen y luego el
campo de categoría, entonces ve las 8 categorías como filas tocables, sin ninguna sección de "búsquedas
recientes".

**No incluye:** cambiar las reglas de negocio del buscador (categorías, comunas vecinas, orden de
resultados) — esta funcionalidad es solo de presentación del control de búsqueda. Tampoco incluye
persistir ni sugerir búsquedas anteriores de la persona.

**Experiencia:** —. **Ingeniería:** —.

<a id="f-003"></a>

### F-003 — Footer con navegación real, en la landing y fuera de ella

Cuando estoy en cualquier página de datealo —la landing o cualquier otra— y quiero explorar otra
categoría o entender cómo sumarme como profesional,
quiero encontrar esos links en el footer,
para no depender de volver manualmente al inicio o de adivinar la URL.

**Lado del marketplace:** ambos — el buscador explora categorías, un profesional encuentra el camino para
crear su perfil. **Qué necesita del otro lado:** nada adicional — las categorías y el flujo de registro de
profesional ya existen.

**Sustento:** [C-001](./investigacion.md#c-001), [C-003](./investigacion.md#c-003),
[C-004](./investigacion.md#c-004), [C-006](./investigacion.md#c-006), [C-014](./investigacion.md#c-014) y
[D-003](#d-003), [D-004](#d-004). **Éxito:** [M-001](#m-001).

**Reglas:**

- Tanto `LandingFooter` (en `/`) como el footer general (en el resto de la app) muestran el mismo diseño
  visual y el mismo contenido en cinco grupos — son componentes separados por arquitectura
  ([D-002](#d-002)), no por diseño, y ninguno se queda solo con marca y copyright:
  - **Marca:** logo + tagline (como ya tiene `LandingFooter` hoy).
  - **Buscador:** un link genérico "Buscar profesionales" a `/buscar` — sin listar las 8 categorías una
    por una ([C-014](./investigacion.md#c-014)).
  - **Profesional:** "Publícate en Datealo" (a `/profesional/registro`), o "Mi perfil" si hay sesión
    activa — mismo criterio que el header ([D-005](#d-005)).
  - **Contacto:** email y ciudad, como texto — no son links.
  - **Legal:** Términos y Condiciones, Política de Privacidad — ver [F-004](#f-004).
- En mobile, los cinco grupos se apilan en una sola columna, sin acordeón — el footer es chico a
  propósito (~5 links reales), agregar interactividad para eso es complejidad sin beneficio
  ([C-014](./investigacion.md#c-014)).
- En desktop, los grupos se muestran en fila.
- Datealo nunca agrega a ningún footer secciones fuera de alcance de esta misión (blog, login de
  comprador, redes sociales que no existen) — ver [D-004](#d-004).

**Ejemplo verificable:** dado cualquier página de la app, landing incluida, cuando alguien llega al final
de la página, entonces ve un footer con un link a "Buscar profesionales", un link a "Publícate en
Datealo" (o "Mi perfil" con sesión), el contacto de Datealo como texto, y links a Términos y Privacidad —
apilados en mobile, en fila en desktop.

**No incluye:** rediseñar el flujo de registro de profesional en sí — solo enlazarlo desde el footer.
Tampoco incluye un link por cada categoría — ver [C-014](./investigacion.md#c-014).

**Experiencia:** —. **Ingeniería:** —.

<a id="f-004"></a>

### F-004 — Páginas simples de Términos y Privacidad

A diferencia de F-001 a F-003, esta funcionalidad no nace de un trabajo que alguien busca hacer — casi
nadie abre un TOS por curiosidad. Nace de una obligación: Datealo ya recolecta datos personales reales
(email de profesional, datos de perfil — [E-018](./investigacion.md#e-018)), y la Ley 21.719 exige poder
explicar qué se recolecta y cómo ejercer derechos sobre esos datos, sin importar el tamaño de la empresa
([E-010](./investigacion.md#e-010)). Forzarla al formato JTBD de las otras tres sería fingir una demanda
de usuario que no existe — el antipatrón que el propio skill `discovery-product` nombra como "apuesta sin
validar" en la dirección opuesta: acá la funcionalidad es real y necesaria, pero su origen es cumplimiento,
no un job descubierto.

**Lado del marketplace:** ambos — cualquiera que use la plataforma, comprador o profesional, puede
consultarlas; quien más las necesita es un profesional decidiendo si crear su perfil. **Qué necesita del
otro lado:** nada.

**Sustento:** [E-010](./investigacion.md#e-010), [E-018](./investigacion.md#e-018) y [D-004](#d-004).
**Éxito:** [M-002](#m-002).

**Reglas:**

- Datealo publica una página de Política de Privacidad con el copy ya aprobado en
  [`contenido/politica-privacidad.md`](./contenido/politica-privacidad.md): quién es responsable, qué
  datos recolecta hoy (revisado contra el schema real — email de profesional, datos del perfil, token
  anónimo de reseña, sin datos del lado buscador), para qué los usa, con quién los comparte (Supabase,
  Resend, como infraestructura) y cómo pedir acceso, corrección o eliminación.
- Datealo publica una página de Términos y Condiciones con el copy ya aprobado en
  [`contenido/terminos-y-condiciones.md`](./contenido/terminos-y-condiciones.md): qué es Datealo, qué no
  garantiza, reglas básicas de uso, de quién es el contenido que sube un profesional, y cuándo se puede
  dar de baja un perfil.
- Ambas páginas se redactan en español simple, sin plantilla genérica en inglés traducida — describen lo
  que Datealo hace hoy, no una versión aspiracional con features que no existen.
- Datealo nunca linkea a una página de este tipo que no existe — los links del footer solo aparecen una
  vez que las páginas están publicadas.

**Ejemplo verificable:** dado que alguien toca "Privacidad" en el footer, cuando la página carga, entonces
ve el texto de [`contenido/politica-privacidad.md`](./contenido/politica-privacidad.md) — sin mencionar
datos que Datealo no recolecta.

**No incluye:** un flujo de gestión de consentimiento (banners de cookies, opt-in granular) — Datealo no
usa cookies de tracking de terceros hoy; si eso cambia, se revisita.

**Experiencia:** —. **Ingeniería:** —.

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta                                                          | Comportamiento esperado                                                                 | Funcionalidades |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| CL-001 | Un perfil no encontrado o un estado de carga lenta en `/profesionales/[id]`  | La flecha atrás se muestra igual alrededor del estado, no solo cuando el perfil carga con datos. | F-001            |
| CL-002 | Una búsqueda sin resultados (`SearchEmptyState`) en `/buscar`                | El resumen compacto del buscador se mantiene visible y tocable para ajustar la búsqueda; no depende de que existan resultados. | F-001, F-002     |
| CL-003 | La sesión de un profesional expira o no se resuelve todavía en el momento en que el header se pinta | Mientras se resuelve, el header muestra el estado sin sesión — nunca parpadea de "Mi perfil" a registro ni deja el espacio vacío. | F-001 |

## Fuera de alcance

| Capacidad o caso                                                                 | Estado      | Razón del recorte                                                                                                   | Condición para reconsiderar                                                    |
| ----------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Bottom nav mobile                                                                    | descartada  | Sin secciones reales (favoritos, viajes, mensajes) que lo justifiquen ([D-007](#d-007)).                             | Evidencia de que aparecen secciones reales que un bottom nav resolvería mejor que el header. |
| Secciones adicionales del benchmark (blog, login/registro de comprador, comparar/favoritos) | descartada  | Violan los guardrails de producto vigentes.                                                                          | Ninguna prevista sin un cambio explícito de los guardrails de producto en `CLAUDE.md`. |
| Vista de resultados de búsqueda (cards, grid, mobile/desktop)                        | movida      | Es un problema de diseño propio, independiente del header que la envuelve.                                          | Se investiga en la misión 10.                                                       |
| Vista de detalle de perfil (galería, ficha de contacto, mobile/desktop)              | movida      | Mismo criterio — problema de diseño propio.                                                                          | Se investiga en la misión 11.                                                       |
| Hero y copy de la landing                                                            | movida      | Es un problema de mensaje/contenido, no de navegación.                                                               | Se investiga en la misión 12.                                                       |
| Flujo de gestión de consentimiento de cookies                                        | postergada  | Datealo no usa cookies de tracking de terceros hoy.                                                                  | Si se agrega analítica o tracking de terceros.                                     |
| "Búsquedas recientes" en el buscador                                                 | descartada  | El lado buscador no tiene cuentas; el dueño de producto decidió no resolverlo con almacenamiento del navegador tampoco ([C-013](./investigacion.md#c-013)). | Evidencia de que el buscador sin historial genera fricción real. |
| Geolocalización ("Cerca de ti") en la sugerencia de comuna                            | descartada  | No existe en el código hoy y nadie la pidió — se copió de la referencia de Airbnb sin auditarla; comunas frecuentes cubre el mismo objetivo sin pedir un permiso nuevo ([C-015](./investigacion.md#c-015)). | Pedido explícito del dueño de producto de agregarla. |

## Señales de éxito

<a id="m-001"></a>

### M-001 — La app se siente como un solo producto, con una navegación que se adapta a dónde estás

- **Pregunta:** ¿la navegación de `/buscar` y el perfil público se siente parte del mismo producto que la
  landing, sin sentirse repetitiva o sobrecargada?
- **Señal:** en una revisión visual cualitativa, el dueño de producto confirma que cada pantalla muestra
  solo la navegación que tiene sentido desde ahí (logo+nav en landing, flecha+resumen en `/buscar`, solo
  flecha en perfil), y que ninguna se siente "pelada" ni "amontonada".
- **Método y umbral:** revisión manual en Chrome a 390px y a 1440px+, antes de cerrar el PR de cada
  funcionalidad — Datealo está en etapa "Empatía" (pre-tráfico), donde una señal cualitativa es lo
  esperado ([C-007](./investigacion.md#c-007)).
- **Cuando exista tráfico:** reemplazar por tasa de rebote de aterrizajes directos a `/buscar` o a un
  perfil (sin pasar por `/`) — si la navegación funciona, ese rebote no debería ser mayor que el de quien
  sí pasó por la landing.
- **Guardrail:** el header/footer no debe empeorar el tiempo de carga percibido ni bloquear el render del
  contenido principal; el patrón de profundidad no debe generar confusión sobre cómo volver atrás.

<a id="m-002"></a>

### M-002 — Las páginas de Términos y Privacidad existen, son precisas, y están enlazadas

- **Pregunta:** ¿alguien que quiera revisar qué datos recolecta Datealo o bajo qué condiciones usa la
  plataforma puede hacerlo, con información correcta?
- **Señal:** no es una señal de percepción UX como M-001 — es una verificación de cumplimiento:
  `/privacidad` y `/terminos` existen, el footer las enlaza en toda página, y su contenido coincide con lo
  que el schema realmente recolecta hoy ([E-018](./investigacion.md#e-018)).
- **Método y umbral:** checklist manual antes de cerrar el PR — abrir cada link del footer, confirmar que
  carga, y releer el contenido contra el schema vigente al momento del PR (no contra E-018 si el schema ya
  cambió).
- **Guardrail:** ninguna página describe un dato que Datealo no recolecta, ni omite uno que sí recolecta.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — El header sigue un patrón de profundidad, no una estructura fija idéntica en toda página

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
  [C-005](./investigacion.md#c-005), [C-011](./investigacion.md#c-011).
- **Tensión:** consistencia y simplicidad de un solo diseño fijo vs. utilidad contextual real, respaldada
  por evidencia (el caso de Airbnb, la investigación de branding), de mostrar menos navegación mientras
  más adentro del flujo se está.
- **Alternativas descartadas:** un header idéntico en toda página (logo + nav + buscador siempre) — se
  descartó tras revisar el patrón de profundidad de Airbnb: mostrar logo y buscador completo en el perfil
  no aporta nada, porque ahí lo único que se necesita es volver atrás; variantes de header por superficie
  inventadas sin evidencia (ej. un botón "volver a resultados" distinto en cada superficie) — se
  mantienen descartadas, esto es distinto: es un solo patrón (profundidad), no variantes ad-hoc.
- **Decisión y consecuencia:** el header cambia según la profundidad de la pantalla — ver reglas de
  [F-001](#f-001). Habilita cerrar el problema original de "sin manera de volver a buscar" en el perfil de
  forma más simple que mantener un buscador visible en todas partes.
- **Revisión (2026-09-01):** la propuesta original de esta decisión (previa a definir el patrón de
  profundidad) era un solo componente idéntico en toda página, sin variantes de ningún tipo. Se actualizó
  tras revisar capturas de Airbnb que el dueño de producto aportó — la investigación mostró que "sin
  variantes" era demasiado rígido una vez que apareció evidencia real de un patrón mejor.
- **Reapertura:** si el patrón de profundidad genera confusión real sobre cómo volver atrás.

<a id="d-002"></a>

### D-002 — La landing mantiene su propio header, separado del header general de la app; el footer usa el mismo diseño en ambos

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-006](./investigacion.md#c-006).
- **Tensión:** reducir duplicación de componentes vs. la landing tiene necesidades propias en el header
  (buscador grande en el hero, nav con anclas a secciones propias) que el footer no tiene.
- **Alternativas descartadas:** unificar header y footer en un solo componente con variantes por prop para
  landing y resto — se descarta porque el intento anterior (issue #105/PR #106) reusó el footer de la
  landing sin cambios y no convenció; mantener el footer con diseño distinto en cada superficie (versión
  original de esta decisión) — se descarta en la revisión de abajo.
- **Decisión y consecuencia:** el **header** es `LandingNavbar` en la landing y `AppHeader` en el resto —
  dos componentes con diseño propio, porque resuelven contextos distintos (hero vs. sin hero). El
  **footer** es `LandingFooter` y `AppFooter` como componentes separados (por arquitectura — cada uno vive
  en su propio layout), pero comparten el mismo diseño visual: los colores distintivos de Datealo (índigo
  primario de fondo, turquesa como acento), la misma estructura de cinco grupos de
  [F-003](#f-003). Verse igual, no distinto, es lo que refuerza que es un solo producto.
- **Revisión (2026-09-02):** la versión original de esta decisión pedía que ambos footers tuvieran "su
  propio diseño", igual que el header — razonable cuando el footer de la landing era pobre (solo marca y
  contacto) y la preocupación era no repetir esa pobreza sin adaptarla. Una evaluación heurística de
  `experiencia.md` (agente sin memoria de esta conversación) encontró que el mockup de footer construido
  no tenía dos diseños distintos, y que forzarlos a verse diferentes ya no tiene el mismo sustento: ambos
  footers comparten hoy el mismo contenido rico (cinco grupos reales), así que el riesgo original ya no
  aplica. El dueño de producto confirmó que prefiere que se vean iguales, con los colores de Datealo.
- **Reapertura:** si el header y el footer alguna vez necesitan la misma variación de contexto que hoy
  separa al header (landing vs. resto), evaluar de nuevo.

<a id="d-003"></a>

### D-003 — Las referencias de benchmark se adoptan solo para pulido visual y estructura de header/footer; sus secciones y funcionalidades adicionales quedan fuera de alcance

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-003](./investigacion.md#c-003), [C-004](./investigacion.md#c-004).
- **Tensión:** la "robustez" que pidió el dueño de producto vs. los guardrails de no agregar pasos al
  flujo core ni features/contenido antes de tener tracción.
- **Alternativas descartadas:** adoptar el patrón completo de cualquiera de los tres benchmarks (blog,
  carreras, prensa, apps, login/registro de comprador, comparar/favoritos) — se descarta por violar los
  guardrails de producto vigentes en `CLAUDE.md`.
- **Decisión y consecuencia:** el alcance se limita a jerarquía visual, espaciado y consistencia del
  header y footer — no a nuevas secciones de contenido.
- **Reapertura:** si tras el lanzamiento hay evidencia de que falta una sección específica.

<a id="d-004"></a>

### D-004 — El contenido de cada footer se organiza en cuatro columnas: lado buscador, lado profesional, contacto y legal — la legal apunta a las páginas simples que esta misión construye

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-004](./investigacion.md#c-004), [C-006](./investigacion.md#c-006),
  [E-010](./investigacion.md#e-010), [E-018](./investigacion.md#e-018).
- **Tensión:** el footer de referencia (benchmark) incluye legal, pero Datealo no tenía páginas de destino
  — dueño de producto decidió que esta misión sí construye Términos y Privacidad simples, en vez de omitir
  la columna.
- **Alternativas descartadas:** omitir la columna legal hasta una misión aparte — se descarta porque el
  dueño de producto prefirió resolverlo ahora, ya que el footer se está construyendo de todas formas;
  copiar plantillas legales genéricas sin adaptarlas — se descarta, ver [F-004](#f-004).
- **Decisión y consecuencia:** cada footer muestra cuatro columnas de contenido de navegación — buscador,
  profesional, contacto y legal — más el bloque de marca (logo + tagline), que no cuenta como columna de
  navegación sino como identidad del footer; son cinco grupos en total, ver reglas de [F-003](#f-003) y
  [F-004](#f-004) para el detalle de Términos y Privacidad.
- **Reapertura:** —.

<a id="d-005"></a>

### D-005 — El header general muestra el avatar del profesional (link a "Mi perfil") cuando hay sesión activa; sin sesión, no muestra ningún acceso al lado profesional fuera de la landing

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-008](./investigacion.md#c-008).
- **Tensión:** mostrar siempre el mismo CTA de registro a alguien que ya tiene perfil es lo más simple de
  implementar, pero le habla mal justo al lado más caro de conseguir y retener — y en mobile, agregar un
  ícono/texto de registro en `/buscar` y el perfil compite por espacio con la flecha y el buscador
  ([UXF-002](./experiencia.md#uxf-002)).
- **Alternativas descartadas:** un link de texto "Mi perfil"/"Publícate" en vez de avatar (versión
  original de esta decisión) — se descarta porque el dueño de producto prefirió un ícono; mostrar
  "Publícate" también fuera de la landing (en `/buscar` y el perfil) cuando no hay sesión — se descarta
  porque en mobile no cabe junto al botón de volver y el buscador sin apretar la fila, y el CTA ya vive en
  la landing y en el footer; un menú de cuenta completo — se descarta por ahora, un solo link (el avatar)
  alcanza.
- **Decisión y consecuencia:** F-001 agrega la verificación de sesión al header en toda página pública —
  hoy solo existía dentro de `/profesional/*` ([E-012](./investigacion.md#e-012)). Con sesión, el avatar
  (mismo campo y fallback a iniciales de la misión 08) reemplaza el hueco vacío a la derecha del header
  general. El costo real de esa consulta (latencia, servidor o cliente) queda para que ingeniería lo
  valide en `ingenieria.md`.
- **Reapertura:** si ingeniería determina que el costo es alto, se reabre para evaluar alternativas (ej.
  cachear el estado, resolverlo solo del lado del cliente).

<a id="d-006"></a>

### D-006 — El buscador es un patrón "expandible" en mobile (botón/resumen que abre una vista completa), no los mismos campos inline achicados

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-009](./investigacion.md#c-009).
- **Tensión:** reusar el mismo componente de campos en mobile y desktop (menos código) vs. la evidencia de
  que en mobile esos campos se sienten apretados y compiten con el teclado.
- **Alternativas descartadas:** mismos campos inline, solo más chicos — se descarta explícitamente por el
  dueño de producto tras ver la referencia de Airbnb; un modal flotante en vez de vista completa — no se
  descartó del todo, pero la referencia y la investigación apuntan a vista completa como el patrón más
  probado.
- **Decisión y consecuencia:** ver reglas de [F-002](#f-002). Exige diseñar dos presentaciones del mismo
  componente de datos (categoría + comuna), no una sola.
- **Reapertura:** —.

<a id="d-007"></a>

### D-007 — Datealo no implementa un bottom nav en esta misión

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-010](./investigacion.md#c-010).
- **Tensión:** las guías de UX mobile recomiendan bottom nav para apps donde buscar es la acción principal
  vs. Datealo no tiene suficientes destinos reales y distintos para llenarlo con sentido.
- **Alternativas descartadas:** un bottom nav con 3 ítems reales (Inicio, Buscar, Publícate/Mi perfil) —
  se evaluó y se descartó porque el buscador ya cumple la función de "explorar", dejando el bottom nav sin
  aportar algo que el header no resuelva ya.
- **Decisión y consecuencia:** la navegación completa vive en el header con el patrón de profundidad de
  [F-001](#f-001). No hay trabajo de bottom nav en esta misión.
- **Reapertura:** cuando aparezcan secciones reales (ej. favoritos, historial) que un bottom nav resolvería
  mejor que el header actual.

<a id="d-008"></a>

### D-008 — El buscador compacto de desktop tiene una variante chica sin el nombre del campo, para cuando vive fijo en el header general

- **Estado:** aceptada. **Fecha:** 2026-09-03.
- **Sustento:** [E-022](./investigacion.md#e-022), [E-023](./investigacion.md#e-023).
- **Tensión:** una sola presentación del buscador de desktop es menos código y más simple de mantener, vs.
  el header general (`/buscar`, perfil, `/profesional/*`) queda fijo en pantalla todo el tiempo — el
  dueño de producto lo sintió pesado, con dos filas de texto por campo (nombre + valor) ocupando alto de
  forma permanente, justo donde antes convivía con la barra de filtros vieja de `/buscar` que
  [F-002](#f-002) ya decía que había que sacar y nunca se ejecutó.
- **Alternativas descartadas:** achicar el buscador con scroll (el mismo componente cambia de tamaño según
  la posición de scroll) — se descartó porque no hay evidencia de que Airbnb lo haga en ningún header que
  no sea el hero de una landing sin sesión ([E-023](./investigacion.md#e-023)); una sola densidad chica en
  todos lados, incluida la landing tras scroll — se descartó porque el navbar de la landing es una entrada
  más prominente al producto (misión 08, [F-001](#f-001)) y no compite por espacio fijo todo el tiempo
  como el header general.
- **Decisión y consecuencia:** el mismo componente (`CompactSearchBar`) soporta dos densidades en desktop
  — completa (nombre del campo sobre el valor) y chica (solo el valor) — elegidas por dónde vive, no por
  scroll. El header general (`/buscar`, perfil, `/profesional/*`) usa la chica, fija, siempre visible. El
  navbar de la landing tras hacer scroll (misión 08, todavía sin construir) usa la completa. Mobile no
  tiene esta distinción — su resumen ya es de una sola línea.
- **Reapertura:** si al construir la misión 08 el navbar de la landing tras scroll se siente igual de
  apretado con la versión completa, evaluar la misma variante chica ahí también.

## Preguntas

No queda ninguna pregunta abierta que bloquee `experiencia.md`.

| ID    | La duda                                                                  | Estado             | Respuesta, o quién la resuelve                                                                 |
| ----- | --------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| Q-001 | ¿Qué links exactos lleva cada footer, más allá de "buscar" y "quiero ser profesional"? | resuelta 2026-09-02 | Contenido completo cerrado en [F-003](#f-003): marca, un link genérico "Buscar profesionales" (sin categorías individuales — [C-014](./investigacion.md#c-014)), "Publícate"/"Mi perfil", contacto como texto, y Términos/Privacidad. |
| Q-002 | ¿Las imágenes de referencia (Airbnb) cambian algo del alcance ya definido acá? | resuelta 2026-09-01 | Sí — el dueño de producto las compartió durante esta misma investigación y su contenido ya está incorporado (E-013, C-009 a C-012). |
