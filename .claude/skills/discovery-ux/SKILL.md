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
- los flujos críticos pasaron una evaluación heurística y sus hallazgos bloqueantes están resueltos

**Evaluar antes de cerrar:** proponer y juzgar son actos distintos, y hacerlos en la misma pasada produce
ceguera — el flujo recién escrito parece bueno porque uno acaba de convencerse a sí mismo. Antes de marcar
`en revisión`, contrastar los flujos críticos contra heurísticas de usabilidad usando los skills instalados
en `.claude/skills/`: `ui-ux-pro-max` y `web-design-guidelines` para el juicio, `frontend-design` para la
propuesta visual, `ux-writing` para el texto de cada estado (labels, errores, empty states, CTAs).

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

## Relación entre `experiencia.md` y `producto.md`

Un hallazgo de experiencia puede cambiar una decisión de producto. Cuando eso ocurre, el cambio se registra
primero en `producto.md` (fuente de verdad del problema) y luego se actualiza `experiencia.md`. Los
documentos no deben contradecirse en silencio.

```
✅ "El flujo de 5 pasos detectado en experiencia cambió la decisión D-002 en producto"
❌ "Experiencia define un flujo de 3 pasos y producto dice que hay 5" (contradicción silenciosa)
```
