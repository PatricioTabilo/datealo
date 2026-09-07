# Misión 13: Tamaño de fuente — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-09-06

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para flujos, estados, contenido e interacción. No redefine reglas de producto: si el
diseño descubre una regla nueva o invalida una, abre o actualiza una decisión en producto.md.

Núcleo obligatorio: vistas, mapa de estados, flujos críticos y estados por superficie. Las secciones bajo
demanda (modelo mental, jerarquía de información, validación) se agregan solo cuando una decisión las
necesita.

Gate de salida — experiencia.md está lista para ingenieria.md cuando:
- cada flujo crítico tiene secuencia, variantes, recuperación y criterio de término
- cada estado tiene contenido concreto (texto real, información visible, acción disponible)
- cada vista lista sus modos, y el mapa de estados cubre todas las transiciones entre ellos
- cada modo tiene su indicador permanente de estado, y cada flujo tiene todas sus salidas documentadas
- los casos límite de producto.md tienen flujo o estado mapeado
- cada flujo crítico está mockeado en móvil (390px), y en desktop si también vive ahí
- ninguna pantalla queda descrita como "similar a X" sin especificar qué cambia
-->

## Decisión de experiencia: subir el texto sin romper ni la jerarquía ni el layout de tres vistas existentes

Esta misión no crea ninguna vista, modo ni flujo nuevo — sube el tamaño de texto (D-001) en tres vistas
que ya existen (resultados de búsqueda, perfil público, perfil de gestión), y corrige el tamaño real del
CTA de contacto y la regla de color (D-002). Por eso el foco de este documento no es diseñar un camino
nuevo: es verificar, con mockups de las tres vistas en 390px y contenido realista (incluido el caso
límite CL-001, un nombre y una comuna largos), que el texto más grande no rompe el truncado, no hace que
la card crezca de forma rara y que la jerarquía entre texto principal y secundario se sigue notando solo
con peso y color — la pregunta abierta en `producto.md` ([Q-001](./producto.md#q-001)).

Los tres mockups (`design-mockups/resultados-busqueda.html`,
`design-mockups/perfil-publico.html`, `design-mockups/perfil-gestion.html`) muestran que sí se sostiene:
en las tres vistas el nombre en negrita se distingue de la comuna/metadata en gris incluso después de
subir ambos un escalón. No encontré un caso donde la jerarquía se pierda con el tamaño nuevo — ver
"Jerarquía de información" más abajo para el detalle.

- **Funcionalidades cubiertas:** F-001.
- **Pendiente bloqueante:** ninguno. Q-001 sigue formalmente abierta en `producto.md` (se resuelve ahí
  con el PR ya implementado, no con este mockup estático), pero no bloquea pasar a `ingenieria.md`.

## Vistas

<!--
El listado de pantallas que define la experiencia — el mapa que se entrega antes de los flujos. Una línea
por vista, sin tabla, con sus modos anidados debajo. Una vista es un destino: se llega a ella. Un modo es
un estado de esa vista que cambia qué se puede hacer y qué se ve — se anida, nunca se lista como vista
hermana.

El porqué de cada vista, su trade-off o su justificación no van aquí: viven en su flujo (UXF) o en una
decisión (UX-xxx). Regla de formato para todo el documento: las tablas se reservan para índices de celdas
cortas; lo que lleva justificación extensa va en secciones con header + bullets, nunca en una celda.
-->

Las tres vistas ya existen (misiones 05, 06/10 y 04/11) y esta misión no les agrega ni les quita modos —
solo cambia el tamaño de su texto. Se listan igual, por trazabilidad con F-001, con su nombre real en vez
de un ID nuevo.

- **V-001 — Resultados de búsqueda** (buscador + lista de cards) · móvil / desktop · resuelve F-001 ·
  sin modos nuevos — ver el mapa de estados completo en la misión 06/10
- **V-002 — Perfil público de profesional** · móvil / desktop · resuelve F-001 · sin modos nuevos — ver
  la misión 05/11
- **V-003 — Perfil de gestión (privado)** · móvil · resuelve F-001 · sin modos nuevos — ver la misión 04

## Mapa de estados

<!--
Vistas y flujos son listas, y una lista no muestra un camino. Esta tabla conecta los modos: qué acción
lleva de uno a otro y qué pasa con el trabajo del usuario en cada salto. Cada fila que falte es una
pregunta que ingeniería resuelve inventando.
-->

Sin modos nuevos, no hay transiciones nuevas que mapear: la navegación entre V-001, V-002 y V-003 es
exactamente la que ya documentaron sus misiones de origen. Esta tabla queda vacía a propósito — llenarla
con filas que no cambian sería inventar contenido para completar el molde, no información nueva.

## Sin flujo crítico nuevo

Esta misión no agrega un `UXF-xxx`: no hay una secuencia de pasos, salidas ni recuperación que
documentar, porque F-001 no cambia qué hace el usuario ni qué responde Datealo, solo qué tan grande se ve
el texto que ya existía. La navegación de entrada y salida de V-001, V-002 y V-003 (cómo se llega, cómo se
vuelve, qué pasa si el usuario se va a WhatsApp y vuelve) sigue siendo la que documentaron las misiones
04, 05, 06, 10 y 11 — forzar un `UXF-001` acá sería completar el molde con una secuencia que no cambió.

La verificación real de esta misión (si el texto más grande sigue leyéndose con la jerarquía correcta, y
si el caso límite CL-001 de nombre y comuna largos sigue truncando bien) vive en "Jerarquía de
información" más abajo, con evidencia visual en los mockups.

## Estados por superficie

<!--
El contenido es concreto: texto real, no "mensaje apropiado". El estado vacío de un marketplace
pre-lanzamiento no es un detalle: para muchas búsquedas será el estado principal durante meses.
-->

Solo se documenta el estado que esta misión toca (con datos, texto en el tamaño nuevo) y el caso límite
CL-001. Los estados vacío/carga/error de estas tres vistas no cambian de contenido y ya están
documentados en sus misiones de origen — repetirlos acá sería duplicar texto que se desactualiza en un
solo lado sin que nadie lo note.

| Vista · estado                          | Qué se muestra (texto real, tamaño nuevo)                                                                                    | Acción disponible          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| V-001 · con resultados                   | Contador "N resultados" en 14px (antes 12px, `buscar/index.vue`), nombre en 16px bold ("María Fernanda Rojas Ilabaca", truncado con `…`), comuna/rating/precio en 14px ("San José de Maipo", "★ 4,8 · 23 reseñas", "Desde $25.000"), "En Datealo desde…" sin cambio (11px) | Tocar la card → va al perfil |
| V-001 · CL-001 (nombre y comuna largos)  | El nombre trunca antes que con el tamaño viejo (menos caracteres caben en 16px) pero sigue en una sola línea con `…`; la comuna hace lo mismo en su propia línea; la card no crece de ancho, solo puede crecer unos px de alto | Igual que el estado normal    |
| V-001 · selector de categoría/comuna abierto | Lista de opciones sin cambio (14px, ya cumplía el piso bajo el título de 16px), botón "Buscar" pasa de 15px (`text-[0.9375rem]`, ni un token de la escala) a 16px real | Elegir una opción → confirma y busca |
| V-002 · perfil con datos                 | Descripción y precio en 16px, categoría·comuna sin cambio (ya estaba en 14px), "En Datealo desde…" sin cambio (12px), CTA "Escribir por WhatsApp" en 16px real (antes rendía 14px pese a `size="lg"`) | Tocar el CTA → WhatsApp/llamar |
| V-002 · con reseñas                      | Título "Reseñas" sube de 14px a 16px (mismo criterio que "Descripción"/"Precio" del perfil de gestión); nombre de quien reseña y comentario suben de 14px a 16px; fecha relativa y badge "verificado" sin cambio (11px) | Tocar "Escribir una reseña" → abre el formulario (fuera de alcance, ver producto.md) |
| V-003 · perfil de gestión con datos      | "Descripción" y "Precio" (labels y valores) en 16px, "Editar" en 14px (antes 12px)                                              | Tocar "Editar" → modo edición |
| V-003 · error de validación              | "No se pudo guardar, toca para reintentar" (texto real de `perfil.vue`) y errores equivalentes de `ProfessionalAvatar`/`ProfessionalPhotos`/`ProfessionalCatalogRow`/`ProfessionalDataRow` pasan de 12px a 14px — un error bloquea guardar, no es texto de una sola lectura | Tocar el error → reintenta guardar |
| V-003 · cargando / error de carga        | "Cargando tu perfil…" y el mensaje de `loadError` pasan de 14px a 16px — no mockeado aparte: mismo patrón ya probado en el mensaje de comunas vecinas (único texto de la pantalla, sin título arriba) | ninguna, o recargar según el error |
| V-002 · invitación a reseñar             | El `cardHeading` de la mini-card ("¿Cómo te fue con...?") pasa de 14px a 16px, mismo criterio que "Reseñas" — no mockeado aparte, mismo patrón que el encabezado "Reseñas" ya validado | Tocar el botón → abre el formulario (fuera de alcance) |

## Mockups

<!--
Los mockups viven en design-mockups/ como HTML (ver el skill discovery-ux y docs/design/README.md).
Exploran o materializan una decisión; no son fuente de verdad de reglas de producto.
-->

| Mockup                 | Cubre                                     | Estado    | Ruta                                             |
| ------------------------ | -------------------------------------------- | ----------- | ---------------------------------------------------- |
| Resultados de búsqueda | V-001, F-001, CL-001, selector abierto     | validado  | `./design-mockups/resultados-busqueda.html`      |
| Perfil público         | V-002, F-001, reseñas                      | validado  | `./design-mockups/perfil-publico.html`           |
| Perfil de gestión      | V-003, F-001, error de validación          | validado  | `./design-mockups/perfil-gestion.html`           |

## Cobertura

<!-- Detecta huecos antes de construir. Una funcionalidad sin pantalla nueva igual tiene estados. -->

| Funcionalidad | Flujo               | Estados cubiertos                                  | Estado   |
| --------------- | ---------------------- | ----------------------------------------------------- | ---------- |
| F-001         | sin flujo nuevo (ver arriba) | V-001 con resultados + CL-001 + selector abierto, V-002 con datos + reseñas, V-003 con datos + error de validación | validado |

## Secciones bajo demanda

<!--
Agregar solo cuando una decisión las necesite, con estos títulos:

- "Modelo mental y lenguaje": cuando un concepto de producto pueda confundirse en la interfaz.
- "Jerarquía de información": cuando una superficie densa exija decidir qué se ve primero (una card de
  resultado con foto, rating, distancia, precio y disponibilidad es exactamente ese caso).
- "Validación (UXV-xxx)": cuando una incertidumbre de diseño necesite prueba con usuarios.
- "Accesibilidad y adaptación": cuando el contexto de uso cambie el flujo o la representación.
-->

## Jerarquía de información

La duda de fondo de esta misión (Q-001 en `producto.md`) es de jerarquía: la diferencia en px entre
principal y secundario no cambia (2px antes, 12 vs 14; 2px después, 14 vs 16), pero proporcionalmente es
más chica (14% antes, 12,5% después) — ¿alcanza para que la diferencia se siga notando de un vistazo, o
hace falta que peso/color compensen esa diferencia relativa más chica?

Los tres mockups (ver "Mockups" arriba) muestran que no compiten, en las tres vistas, por el mismo motivo:
la jerarquía nunca dependió solo del tamaño — depende del peso (`font-bold` en el principal, peso normal
en el secundario) y del color (`text-datealo-text` oscuro contra `text-datealo-muted` gris). Esos dos ejes
no cambian con esta misión, así que la separación visual se mantiene:

- **V-001, card de resultados:** el nombre (16px, bold, oscuro) se lee primero; comuna, rating y precio
  (14px, peso normal o bold puntual, mezcla de gris y oscuro) quedan claramente detrás incluso con el
  nombre largo de CL-001 truncado.
- **V-002, perfil público:** el precio en bold se distingue de la descripción en peso normal aunque ambos
  compartan 16px — el peso hace el trabajo que antes hacía parcialmente el tamaño.
- **V-003, perfil de gestión:** "Descripción"/"Precio" como labels en semibold quedan por encima de su
  valor en peso normal, igual que antes de subir el tamaño.

**Conclusión de esta misión:** con la evidencia de los tres mockups, subir el tamaño (D-001) alcanza sin
tocar peso ni color — no encontré un caso donde la jerarquía se pierda. Esto no cierra
[Q-001](./producto.md#q-001) de forma definitiva: esa pregunta se resuelve, según quedó escrito en
`producto.md`, con el dueño de producto revisando el PR ya implementado (Nuxt UI real, no la aproximación
de Tailwind puro del mockup) — pero le da a esa revisión una expectativa clara de qué debería ver.

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — La jerarquía se sostiene solo con peso y color; no hace falta rediseñarla para D-001

- **Estado:** aceptada — aprobado por Patricio el 2026-09-06. **Fecha:** 2026-09-06.
- **Sustento:** F-001, evidencia de los tres mockups (ver "Jerarquía de información").
- **Alternativas descartadas:**
  - Bajar el peso o aclarar el color del texto secundario para separarlo más del principal ahora que
    ambos son más grandes — descartada: los mockups no muestran pérdida de jerarquía, cambiar peso/color
    sin evidencia de que haga falta sería resolver un problema que no apareció.
  - Aumentar el contraste de tamaño entre principal y secundario más allá de D-001 (ej. principal en
    18px) para asegurar la separación — descartada: `producto.md` (D-001) ya evaluó y descartó ir más
    allá del piso de accesibilidad sin evidencia que lo pida; repetir esa discusión acá sería reabrir una
    decisión ya tomada sin un hallazgo nuevo.
- **Decisión y consecuencia:** F-001 se implementa solo cambiando tamaño (clases Tailwind) en las tres
  vistas, sin tocar `font-weight` ni color. Si al implementarlo con Nuxt UI real (no la aproximación del
  mockup) la jerarquía sí se siente débil, eso reabre esta UX-001, no se parcha en silencio.
- **Impacto en producto:** ninguno — no cambia ni agrega ninguna `D-xxx`/`F-xxx` de `producto.md`.

## Preguntas

<!--
Todas viven en esta tabla ordenada por ID, abiertas y cerradas juntas. Ningún ID se borra ni se reutiliza.
Estado: abierta | resuelta AAAA-MM-DD | disuelta AAAA-MM-DD. Solo las abiertas llevan bloque de detalle.
-->

No hay ninguna pregunta abierta que bloquee el paso a `ingenieria.md`. La única incertidumbre real de esta
misión (si la jerarquía se sostiene) quedó evaluada en "Jerarquía de información" y en
[UX-001](#ux-001); lo que queda pendiente (Q-001 de `producto.md`) ya está registrado ahí, con su propio
método y sin fecha límite, y no es una pregunta de experiencia.
