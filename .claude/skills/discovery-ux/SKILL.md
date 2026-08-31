---
name: discovery-ux
description: Diseña la experiencia de features nuevas en Datealo — vistas y sus modos, flujos, estados y mockups. Se usa al iterar `experiencia.md` de una misión, al definir el flujo o los estados de un feature, al mapear cómo se entra y se sale de una pantalla ("no veo el camino completo", "¿cómo llego a esta pantalla?", "¿cómo salgo de esto?"), y al pedir ver una pantalla ("muéstrame cómo se vería", "hazme un mockup", "¿cómo debería verse esto?", "¿cuántos pasos tiene este flujo?").
---

# Discovery de experiencia en Datealo

Este skill aplica cuando el foco es `experiencia.md`: vistas, flujos, estados, contenido e interacción.
Para el problema y el alcance, ver `discovery-product`. Para arquitectura y contratos, ver
`discovery-engineering`.

Nuxt UI v4 (sobre Reka UI, Tailwind v4) es la base para todo elemento interactivo. La investigación de UX
define el comportamiento esperado; el componente concreto de Nuxt UI se decide en implementación.

A diferencia de DaisyUI (solo CSS), Nuxt UI trae componentes con comportamiento real resuelto —
`USelectMenu`/`UInputMenu` para selectores con búsqueda, `UCarousel` para galerías con swipe, `UModal` con
focus trap. Eso corre el límite de lo que cuenta como "algo que la librería no tiene": ya no es un selector
de zona ni una galería de trabajos, es algo sin behavior estándar — un mapa interactivo, un editor de
disponibilidad tipo calendario visual. Ahí experiencia no elige librería ni componente: **especifica la
interacción** —qué se hace, cómo se manipula, qué responde—, y esa mecánica se funda en research,
heurísticas y la `investigacion.md` de la misión, no pidiéndole al dueño de producto que adivine la mejor
forma. Al dueño se le llevan trade-offs de producto; la interacción se investiga. La decisión build-vs-buy
es de ingeniería, contra esa especificación (ver YAGNI en `CLAUDE.md`).

El design system son los tokens de datealo mapeados a Nuxt UI (A-004 en el skill `arquitectura`): fondo
claro `#FAFAFA`, primario índigo `#423ED0`, secundario turquesa `#3ECBD7`, texto `#1F2937`, radio generoso
(`--ui-radius: 0.5rem`), Plus Jakarta Sans para títulos y DM Sans para cuerpo. La fuente de verdad son
`app/assets/css/main.css` (tokens crudos) y `app/app.config.ts` (mapeo semántico). Cualquier propuesta
visual parte de ahí.

## La landing ya hizo promesas públicas

Datealo todavía no tiene producto, pero sí tiene una landing publicada que promete cuatro cosas concretas:
**profesionales verificados**, **reseñas de vecinos reales**, **los más cerca de ti** y **contacto directo
sin intermediarios**. Esas promesas están en `app/constants/landing.ts` y ya se le mostraron a gente que
dejó su correo.

Un flujo que las contradice no es una decisión de diseño, es una promesa rota:

```
❌ Un formulario "cuéntanos qué necesitas" que envía la solicitud a varios profesionales
   y espera respuestas. (La landing prometió contacto directo, sin intermediarios,
   sin formularios.)

✅ El perfil tiene el botón de WhatsApp fijo abajo. Si el flujo necesita capturar qué necesita
   el cliente, ese texto pre-llena el mensaje de WhatsApp — no crea una bandeja intermedia.
```

Si una misión concluye que una promesa de la landing está equivocada, eso vuelve a `producto.md` como
decisión y la landing se corrige. No se resuelve en silencio en un flujo.

## Lo que existe se audita, no se hereda

La experiencia se diseña desde el `producto.md` aprobado —sus `F-xxx` y `D-xxx`—, no desde lo que la app ya
hace. Hoy lo construido es solo la landing, así que la trampa todavía es chica; crecerá rápido.

Regla: cada pantalla, flujo o componente existente se **audita contra el producto vigente**, no se hereda.

- Si una pieza encarna algo que el producto cortó, se **descarta**: no se rediseña ni "se itera sobre lo
  actual". Nómbrala y cita la `D-xxx`/`F-xxx` que la deja fuera.
- Si una pieza sirve a una `F`/`D` vigente, puede **informar** el diseño — pero se justifica por el
  producto, nunca con "así funciona hoy".
- Reusar código existente es una decisión de **ingeniería**, no una restricción de experiencia: experiencia
  diseña lo correcto; ingeniería decide cómo se construye.

## Contexto real de uso

```
Buscador (cliente)  → celular, de pie en la cocina inundada, apurado, con una mano,
                      datos móviles, sin ganas de leer. A veces sin permiso de ubicación.
Profesional         → celular, entre trabajos o de noche, poca familiaridad con apps,
                      sube fotos desde la galería, escribe poco.
```

Toda propuesta de flujo se evalúa contra el usuario más limitado que la usará. Dos criterios operativos:

- **Móvil 390px es el caso principal, no una variante.** Un flujo que solo se entiende en desktop está
  incompleto.
- **El camino crítico del buscador se completa sin leer instrucciones.** Si llegar del inicio a un teléfono
  marcable exige más de tres toques o una explicación, el flujo necesita revisión antes de ingeniería.

## Flujo y handoffs

`experiencia.md` traduce las funcionalidades de producto en flujos que ingeniería puede implementar sin
adivinar.

```
investigacion.md → producto.md → experiencia.md → ingenieria.md
                        ↑               ↑
                        └───────────────┘  loop de vuelta si un flujo invalida una decisión
```

**Qué recibe:** las funcionalidades `F-xxx` de `producto.md` con su formato JTBD, reglas y casos límite
aprobados.

**Un documento a la vez:** `experiencia.md` se trabaja cuando el dueño de producto da el paso explícito
desde producto — no en paralelo a una revisión de `producto.md` "para mantenerlo alineado".

**Gate de salida — `experiencia.md` está lista para `ingenieria.md` cuando:**

- los flujos críticos tienen punto de partida, camino principal, estados intermedios, errores y recuperación
- cada estado tiene contenido concreto (texto real, acción disponible) — no "mensaje de error apropiado";
  ese texto sigue el skill `ux-writing` (claro, específico, sin relleno de guiones)
- cada vista lista sus modos, y el mapa de estados cubre todas las transiciones entre ellos
- cada modo tiene su indicador permanente de estado, y cada flujo tiene todas sus salidas documentadas
- los casos límite de `producto.md` tienen flujo mapeado, empezando por "no hay resultados"
- cada flujo crítico está mockeado en móvil, y en desktop si también vive ahí
- no quedan pantallas descritas como "similar a X" sin especificar qué cambia
- cada `UXF-xxx` no trivial pasó por "Divergencia antes de converger" antes de fijar su enfoque
- los flujos críticos pasaron una evaluación heurística en un contexto separado (ver "Evaluar antes de
  cerrar, en un contexto separado" más abajo) y sus hallazgos bloqueantes están resueltos, y todo hallazgo
  de enfoque volvió a divergencia en vez de parcharse
- cada string de contenido (Estados por superficie, columnas "Información visible" de las secuencias,
  mockups) pasó el "Barrido de copy" contra `ux-writing` — la evaluación heurística general no lo reemplaza

**Evaluar antes de cerrar, en un contexto separado:** proponer y juzgar son actos distintos, y hacerlos en
la misma pasada produce ceguera — el flujo recién escrito parece bueno porque uno acaba de convencerse a sí
mismo de por qué cada decisión tiene sentido. Esa ceguera no se resuelve "prestando más atención": la
conversación que escribió el flujo ya tiene la narrativa de por qué está bien, y esa narrativa contamina
cualquier juicio hecho ahí mismo.

- **La evaluación corre en un agente sin memoria de haber escrito el documento** — recibe solo
  `experiencia.md` terminado, `producto.md`, los mockups, y la lista de skills a aplicar; nunca el
  razonamiento de cómo se llegó ahí. Un fork **no sirve para esto**: hereda toda la conversación, incluida
  la justificación de cada decisión, así que carga el mismo sesgo que se busca evitar. Un agente nuevo
  (`Agent` con un `subagent_type` que no sea `fork`, o una sesión distinta) sí aísla el sesgo.
- **Cada skill se invoca de verdad**, con la tool `Skill`, uno por uno — `ui-ux-pro-max` y
  `web-design-guidelines` para el juicio de usabilidad, `frontend-design` para la propuesta visual. Un
  hallazgo que no cita qué dijo el skill invocado es una aplicación de memoria, no una evaluación — no
  cuenta para el gate.
- **La evaluación cuestiona decisiones, no solo redacción.** Pulir un mensaje de error es más fácil que
  objetar por qué el flujo tiene tres pantallas en vez de una, y esa facilidad sesga hacia encontrar solo lo
  fácil. Antes de cerrar, la evaluación tiene que intentar tumbar al menos una decisión ya tomada (una
  `UX-xxx`, un modo, un orden de pasos) citando por qué — si ninguna sobrevive el intento, recién ahí se
  confirma el diseño; si nunca se intenta, la evaluación fue cosmética.

Todo hallazgo de esa evaluación se clasifica antes de resolverlo, porque las dos cosas se corrigen distinto:

- **De ejecución** — falta un estado, un touch target, un indicador de posición. Se corrige en el lugar.
- **De enfoque** — el problema está en cómo el flujo resuelve el JTBD, no en un detalle suyo. Ese hallazgo
  no se parcha: vuelve a "Divergencia antes de converger" y se regeneran enfoques. Parchar un enfoque roto
  produce un flujo que pasa la heurística puntual y sigue mal resuelto de fondo — el síntoma desaparece, la
  causa queda.

**Barrido de copy, texto por texto:** `ux-writing` no es una entrada más de la lista de arriba — es su
propio paso, y es bloqueante. La evaluación heurística general lee el flujo; el barrido de copy lee cada
string. Son cosas distintas y una no cubre a la otra — "el documento ya pasó por evaluación heurística" no
es lo mismo que "cada texto se leyó contra `ux-writing`", y tratarlas como intercambiables es cómo un texto
con un dato falso (una restricción que otra sección del mismo documento contradice, un campo que promete
algo que la pantalla no tiene) llega a `en revisión` sin que nadie lo note.

Antes de marcar el documento `en revisión`, recorrer uno por uno — no leer el documento buscando si "suena
bien" — cada string de "Estados por superficie", cada columna "Información visible" de las secuencias, y
cada frame de los mockups, contra los cuatro estándares de `ux-writing` (propósito, concisión,
conversacional, claridad). Dos preguntas puntuales que ese barrido tiene que hacerse en cada string, porque
son las que se saltan cuando se lee rápido:

- **¿Este texto afirma algo que otra parte del documento contradice?** — una restricción, un requisito, un
  comportamiento que el propio flujo dice que no aplica.
- **¿Este texto repite algo que ya es visible sin él?** — si la información está a la vista dos líneas más
  abajo, el texto no necesita listarla; solo necesita decir por qué importa.

Un hallazgo de este barrido se corrige igual que cualquier otro: si el texto miente o es redundante, es de
ejecución, se corrige en el lugar; si el problema es que el mensaje completo no cumple su propósito (el
usuario no entiende qué hacer con él), es de enfoque y se vuelve a escribir desde cero, no se le agregan
palabras encima.

**Loop de vuelta:** si al diseñar un flujo se descubre que una regla de producto no funciona, registrar la
contradicción en `producto.md` antes de simplificar el flujo aquí.

**Aprobación:** Claude propone y marca `en revisión`; `vigente` lo otorga solo el dueño de producto.

## Qué se ve concreto en Datealo

`experiencia.md` debe describir flujos al nivel de "el usuario toca X → Datealo muestra Y → si Z pasa,
muestra W". Si la descripción no permite saber qué aparece en pantalla, está incompleta.

```
❌ Abstracto: "El usuario puede buscar profesionales de forma simple con feedback apropiado"

✅ Concreto: "El buscador escribe 'gasfi' en el campo de búsqueda. A los 300ms aparecen
   sugerencias de categoría bajo el campo: 'Gasfitería' primero, con el número de
   profesionales en su comuna al lado. Toca una → navega a resultados. Mientras cargan,
   ve 4 skeletons con la forma de la card, no un spinner."
```

```
❌ "El estado vacío debe orientar al usuario"

✅ "Si no hay ningún gasfiter en Ñuñoa, ve: ícono de mapa, título 'Todavía no hay gasfiters
   en Ñuñoa', y debajo la lista de los 3 más cercanos de comunas vecinas con su distancia
   ('Providencia · a 2,4 km'). Botón secundario: 'Avísame cuando haya uno en mi comuna'."
```

El estado vacío merece esa atención porque, con la oferta actual, va a ser lo primero que vea mucha gente.
Un empty state que solo dice "sin resultados" convierte el arranque en frío en una salida del producto.

## Preguntas para evaluar un flujo en discovery

- ¿Qué información necesita el usuario para tomar la acción? ¿Está disponible en ese momento y lugar?
- ¿Cuántos toques tiene el camino crítico? ¿Cuál se puede eliminar?
- ¿Qué pasa si no hay resultados? ¿Y si hay uno solo?
- ¿Qué pasa si el usuario niega el permiso de ubicación?
- ¿El estado resultante es visible sin necesitar texto de confirmación?
- ¿El flujo es completable sin haber leído nada?
- ¿Qué hace el usuario si comete un error? ¿Puede deshacerlo?

## Divergencia antes de converger

"Lo que existe se audita, no se hereda" cubre el riesgo de anclarse en una pantalla ya construida. Hay un
segundo anclaje, más difícil de ver porque no deja rastro: quedarse pegado al primer enfoque que uno mismo
propuso hace diez minutos, en la misma sesión. La primera idea rara vez es la mejor, y evaluarla contra sí
misma no lo detecta — la investigación sobre fijación de diseño muestra que comprometerse temprano con un
concepto degrada la calidad de las ideas que siguen, porque se juzgan relativas a ese ancla y no desde el
problema. El Double Diamond resuelve esto separando una fase que diverge (explorar varios caminos) de una
que converge (elegir uno) — nunca mezclándolas en la misma pasada.

Antes de escribir la Secuencia principal de un `UXF-xxx` no trivial — cualquiera que no sea una extensión
directa de un patrón ya decidido en "Patrones de interacción que ya están decididos" — nombrar 2-3 enfoques
genuinamente distintos para resolver el mismo JTBD, no variantes de layout del mismo enfoque:

```
❌ "Enfoque A: lista de resultados. Enfoque B: la misma lista con otro orden de columnas."
   (es un layout, no un enfoque distinto)

✅ Para F-001 (ver un gasfiter disponible hoy, cerca):
   - Enfoque A: lista ordenada por distancia, filtro de categoría arriba.
   - Enfoque B: mapa como vista principal, lista como panel secundario.
   - Enfoque C: buscador conversacional ("¿qué necesitas?") que arma la lista al confirmar.
   Elegido: A — compite con el grupo de WhatsApp del vecino, no con Yelp, y es el que se completa
   sin leer nada. B pierde ese mismo criterio en 390px con pocos resultados; C agrega un paso al
   flujo core, que CLAUDE.md declara sagrado.
```

No hace falta documentar la exploración completa; lo que se conserva es el resultado. El enfoque elegido
baja al `UXF-xxx`, y los descartados con su porqué alimentan la `UX-xxx` correspondiente — "Alternativas
descartadas" ya es un campo del template; este paso solo asegura que lo que queda ahí es una generación
real hecha antes de decidir, no una lista escrita después para justificar lo que ya se dibujó.

## Estructura de `experiencia.md`

El esqueleto con todas las secciones y sus comentarios de uso vive en
[`docs/missions/template/experiencia.md`](../../../docs/missions/template/experiencia.md) — se copia de
ahí, no se reconstruye de memoria. Lo que sigue es el porqué de las secciones que se documentan mal si solo
se ve el esqueleto.

Regla de formato: las tablas se reservan para índices de celdas cortas (referencias, IDs, estados de una
palabra). Todo lo que lleve justificación extensa va en secciones con header + bullets —como las
`UX-xxx`—, nunca en una celda de tabla, que se desvirtúa en cuanto el texto crece.

### Vistas y modos

Una vista es un destino: se llega a ella. Un modo es un estado de esa vista que cambia qué se puede hacer y
qué se ve. Los modos se anidan bajo su vista, nunca al mismo nivel:

```
✅ - V-002 — Resultados de búsqueda · móvil + desktop · resuelve F-001, F-002 · flujos UXF-001
     - modo lista    — el default; cards ordenadas por distancia
     - modo mapa     — los mismos resultados como pines; la card del seleccionado abajo
     - modo sin ubicación — pide comuna a mano antes de poder ordenar por cercanía

❌ - V-005 — Vista de mapa (sobre los resultados de V-002, no una página aparte) · resuelve F-002
```

Ese paréntesis del ejemplo malo es la estructura peleando con el diseño: corrige el nivel equivocado, y el
mockup del modo termina huérfano porque nada dice de qué vista es un modo.

### Mapa de estados

Vistas y flujos son listas, y una lista no muestra un camino. La sección **Mapa de estados** conecta los
modos: qué acción lleva de uno a otro, y qué pasa con el trabajo del usuario en cada salto.

| Desde         | Acción                | Queda en      | Qué pasa con el trabajo              |
| ------------- | --------------------- | ------------- | ------------------------------------ |
| lista         | toca "Ver mapa"       | mapa          | los filtros y el orden se conservan  |
| mapa          | toca un pin           | mapa          | la card del pin sube desde abajo     |
| mapa          | toca la card          | perfil        | vuelve al mapa en la misma posición  |
| sin ubicación | elige comuna a mano   | lista         | la comuna queda guardada             |

Sin esta tabla el documento puede tener todas sus secciones completas y el dueño de producto igual decir
"no veo el camino completo". Cada fila que falte es una pregunta que ingeniería resuelve inventando.

### Qué documenta cada flujo crítico

- **Punto de partida**: datos, estado y contexto necesarios.
- **Camino principal**: pasos en orden con la acción y la respuesta del sistema.
- **Estados intermedios**: qué ve el usuario mientras espera. Skeleton con la forma del contenido si pasa
  de 300ms; nunca un spinner genérico.
- **Salidas**: todas las formas de irse, no solo terminar bien — volver, cerrar, navegar a otra parte,
  irse a WhatsApp. Por cada una, qué queda del trabajo. El caso de Datealo que más se olvida: el usuario
  se va a WhatsApp y vuelve; la pantalla tiene que estar donde la dejó.
- **Cómo sabe el usuario dónde está**: el elemento concreto y permanente en pantalla que se lo dice, por
  cada modo. Un modo sin indicador permanente es un modo en el que el usuario se pierde.
- **Errores y recuperación**: qué pasa cuando algo falla y cómo retoma.
- **Casos límite**: cero resultados, un solo resultado, perfil sin fotos, profesional sin reseñas.

## Mockups visuales

Un flujo escrito se lee bien y aun así no se sostiene en pantalla: el texto no muestra cuánta información
compite por el mismo espacio, ni si la acción principal queda por debajo del pliegue. En una card de
resultado con foto, nombre, oficio, rating, número de reseñas, distancia y disponibilidad, eso es
exactamente lo que se decide. El mockup convierte "cada estado tiene contenido concreto" de una promesa del
gate en algo verificable.

### Cuándo se hace un mockup

**Obligatorio** antes de marcar `experiencia.md` como `en revisión`:

- la pantalla principal de cada funcionalidad `F-xxx` con datos reales, no vacía;
- **un frame por cada modo de la vista** — si V-002 tiene lista, mapa y sin-ubicación, van los tres. Los
  modos son lo que hace visible el camino;
- todo estado de datos que el flujo declare y no se deduzca del anterior — vacío, carga, error, y el
  "solo un resultado" que en un marketplace nuevo es el caso frecuente;
- cualquier pantalla donde el usuario decide entre opciones con consecuencias.

**No corresponde** para: variantes de un layout ya mockeado, copy que se resuelve en el documento, o
pantallas que solo cambian de datos.

El mockup no reemplaza al documento. `experiencia.md` sigue siendo la fuente de verdad del flujo; el mockup
es la evidencia de que ese flujo cabe en una pantalla. Si se contradicen, gana el documento y el mockup se
corrige.

### Cadencia: el mockup itera, el documento se escribe una vez

Un archivo por vista, iterado en su lugar: modos y estados van como frames dentro del mismo archivo, y el
número de ronda vive en el rótulo del frame para poder conversarlo. Revisar un diseño no debería obligar a
abrir cinco pestañas.

El mockup itera libre —cuantas rondas necesite el visual— y en esas rondas `experiencia.md` no se toca.
Cuando el dueño de producto aprueba el visual, **una sola pasada** baja el estado final al documento, con
las `UX-xxx` redactadas en presente como si fueran la primera versión.

```
❌ Una UX-xxx con tres bullets "Refinamiento (fecha)" apilados, donde el cuerpo dice una
   cosa y el último refinamiento dice la contraria.

✅ Una sola redacción vigente. "Alternativas descartadas" conserva lo que se probó y se dejó
   —eso es una decisión y evita re-litigar—; el historial cronológico no.
```

### Cómo se hace

Los mockups van en `docs/missions/NN-slug/design-mockups/{pantalla}.html`. Cómo se escribe uno, el
esqueleto HTML y los frames están en [`docs/design/README.md`](../../../docs/design/README.md) — leerlo
antes del primero.

Tres cosas que el kit ya resuelve:

- **Los tokens de color, radio y tipografía salen de `docs/design/datealo-mockup-kit.css`**, que espeja
  `app/assets/css/main.css`. Un token escrito a mano en el mockup queda desactualizado sin que nadie lo
  note, y el mockup pasa a describir un producto que no existe.
- **Sin componentes de librería.** Un mockup estático no tiene Vue corriendo, así que no hay Nuxt UI de
  verdad — se arma con utilidades de Tailwind con overrides completos, coloreadas con las variables
  `--ui-*` del kit. Mismo resultado visual que el código real (`<UButton variant="link">` totalmente
  sobrescrito, ver misión 01). Si el mockup necesita algo sin behavior estándar (mapa, calendario visual),
  se especifica la interacción y se deja como nota para ingeniería, no se inventa con CSS.
- **El marco de dispositivo correcto**: `frame-mobile` (390px) siempre; `frame-desktop` además si la
  pantalla también vive ahí.

### Qué contiene un buen mockup

- **Contenido real del feature**, con vocabulario chileno y los términos decididos en `producto.md`. Nada
  de lorem ipsum ni "Profesional 1": "Marcela Fuentes · Peluquería a domicilio · Ñuñoa · 4,8 (23 reseñas)"
  revela los desbordes de texto que "Profesional 1" esconde. Al redactar labels, errores, empty states y
  CTAs, aplicar el skill `ux-writing` en el momento de escribirlos, no como revisión posterior.
- **Los modos y estados como frames rotulados** en el orden en que el usuario los recorre — así el archivo
  se lee como camino, no como galería.
- **Interacción con JS puro solo si el flujo se evalúa mejor moviéndolo** — abrir un bottom sheet, cambiar
  de tab. Un mockup no valida ni persiste nada.

## Patrones de interacción que ya están decididos

Estos son estándar del producto y no se re-discuten por flujo. Vienen de `CLAUDE.md` y de las referencias
del stack:

- **Feedback bajo 100ms.** Si la respuesta pasa de 300ms, skeleton con la forma del contenido, no spinner.
- **Resultados mientras se escribe**, con debounce de 300ms.
- **Touch targets de 44×44px mínimo.** Bottom sheets en móvil, dropdowns en desktop.
- **Transiciones de 200ms o menos.** Las acciones destructivas piden confirmación; nunca `alert()` nativo.
- **Optimistic UI** donde el resultado es predecible: se actualiza local y se revierte si falla.
- **Empty states que invitan**, con sugerencias de categorías o comunas cercanas.
- **Errores de campo enlazados por accesibilidad.** Todo error de validación inline lleva
  `aria-describedby` apuntando al mensaje de error, para que un lector de pantalla lo lea junto al campo —
  nunca solo color o posición visual como señal.
- **Toast en `bottom-right`, sin variar por dispositivo.** Una sola posición para toda la app, mobile y
  desktop — no hay una posición distinta por breakpoint (Nuxt UI no lo soporta de forma nativa, ver
  [issue #4370](https://github.com/nuxt/ui/issues/4370) sin resolver). `bottom-right` es el default real de
  `useToast()` de Nuxt UI, coincide con la convención de notificaciones de Windows, y con la esquina
  derecha en la que Windows y macOS igual convergen aunque difieran en arriba/abajo. La razón de fondo para
  elegir abajo y no arriba: casi toda acción que dispara un toast en Datealo ocurre abajo de la pantalla
  (un bottom sheet, el CTA de contacto fijo, un submit dentro del scroll) — el toast confirma cerca de
  donde el usuario ya estaba mirando, sin que el ojo salte lejos de la acción que lo causó. Duración: los
  5000ms por defecto de Nuxt UI, sin sobreescribir por flujo salvo una razón real (`duration: 0` para el
  caso puntual que necesite cierre manual). Cierre con botón + swipe-to-dismiss en mobile (nativos del
  componente), `aria-live="polite"`, y un `toaster.max` bajo (2-3) como resguardo barato si alguna vez se
  disparan varios a la vez — sin lógica de cola custom. En mobile, si hay una barra fija abajo (el CTA de
  contacto de un perfil, por ejemplo), el toast se desplaza por encima de ella con un offset de espaciado,
  nunca cambia de posición. Un toast es solo para confirmación no crítica y transitoria — un error
  bloqueante o cualquier información que el usuario no puede permitirse perder va inline, en un banner o en
  un modal, nunca en un toast.

## Relación entre `experiencia.md` y `producto.md`

Un hallazgo de experiencia puede cambiar una decisión de producto. Cuando eso ocurre, el cambio se registra
primero en `producto.md` (fuente de verdad del problema) y luego se actualiza `experiencia.md`. Los
documentos no deben contradecirse en silencio.

```
✅ "El flujo de 5 pasos detectado en experiencia cambió la decisión D-002 en producto"
❌ "Experiencia define un flujo de 3 pasos y producto dice que hay 5" (contradicción silenciosa)
```
