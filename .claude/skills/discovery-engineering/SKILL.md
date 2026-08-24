---
name: discovery-engineering
description: Investigación y documentación de ingeniería para features nuevas en Datealo. Usar cuando iteres sobre `ingenieria.md` de una misión, definas la arquitectura de un feature, diseñes contratos entre capas, evalúes factibilidad técnica, audites el código existente contra las decisiones vigentes de producto ("¿lo que ya tenemos sirve?", "audita lo que hay hoy"), planifiques el reemplazo de algo ya construido ("cómo migramos sin romper"), cortes un diseño en tareas atómicas ("slicing", "generar issues desde ingenieria.md", "plan de construcción"), o preguntes "¿cómo estructuramos esto?" o "¿cómo partimos esto en tareas?".
---

# Discovery de ingeniería en Datealo

Este skill aplica cuando el foco es `ingenieria.md`: arquitectura, datos, contratos, RLS, migración y
pruebas. Para el problema y el alcance, ver `discovery-product`. Para flujos e interacción, ver
`discovery-ux`.

**Las decisiones de arquitectura vigentes viven en el skill `arquitectura`** — quién habla con la base de
datos, dónde vive la autorización, cómo se conecta a Postgres y con qué se construye la interfaz. Un
`ingenieria.md` las da por supuestas y las cita como sustento; no las re-decide. Leerlo antes de diseñar:
un diseño que las contradice sin nombrarlo produce slices que no se pueden mergear.

## Vocabulario e invariantes alineados con producto

Los diseños usan los términos decididos en las `D-xxx` de `producto.md` de la misión. El código puede usar
inglés técnico (`Professional`, `Review`), y en ese caso `ingenieria.md` registra el mapeo término ↔
entidad — así producto e ingeniería hablan de lo mismo aunque el schema hable en inglés.

```markdown
| Término de producto | Entidad/campo en código                    |
| ------------------- | ------------------------------------------ |
| profesional         | `professionals`                            |
| zona de atención    | `professionals.service_areas` (por definir)|
| reseña              | `reviews`                                  |
| verificado          | `professionals.status = 'active'`          |
```

Esta tabla es lenguaje ubicuo, aunque no se le llame así — usar el skill `domain-driven-design` para
mantenerlo consistente y para decidir qué se construye a medida (el ranking de búsqueda, las reglas de
verificación) versus qué se compra hecho (Supabase Auth, Resend): esa distinción entre dominio central y
subdominio genérico evita sobre-diseñar lo que ya resuelve un proveedor.

Invariante de diseño que viene de los guardrails de `CLAUDE.md`: el contacto sale directo hacia el
profesional. Un diseño que introduce una bandeja intermedia, una cola de solicitudes o un paso de pago
contradice una decisión vigente de producto y vuelve primero a `producto.md`.

## Flujo y handoffs

`ingenieria.md` cierra el discovery definiendo cómo se construye lo que producto y experiencia
especificaron.

```
investigacion.md → producto.md → experiencia.md → ingenieria.md
                        ↑                                ↑
                        └────────────────────────────────┘  loop de vuelta si algo es inviable
```

**Qué recibe:** los flujos y estados de `experiencia.md` con sus casos límite y condiciones de error
resueltos. **Excepción — misión técnica:** cuando no hay cambio de producto observable y la decisión ya
está tomada como `A-xxx` del skill `arquitectura`, `ingenieria.md` se escribe solo, sin los otros tres
documentos, citando el `A-xxx` donde el template pide un `F-xxx`. Ver
[tipos de misión](../../../docs/missions/README.md#tipos-de-misión).

**Un documento a la vez:** `ingenieria.md` se trabaja cuando el dueño de producto da el paso explícito — no
en paralelo a una revisión de producto o experiencia "para mantenerlo alineado". Diseñar sobre definiciones
en revisión se paga dos veces.

**Gate de salida — `ingenieria.md` está lista para construir cuando:**

- los contratos entre capas están definidos (qué entra, qué sale, qué invariantes se mantienen)
- el modelo de datos soporta los casos límite de `producto.md` sin workarounds
- el impacto en RLS está resuelto explícitamente: qué policy se crea o cambia, o por qué ninguna, y pasó el
  checklist del skill `seguridad-datos` — "hay una policy" no es lo mismo que "esa policy es la que
  protege", y confundirlo es exactamente el tipo de hallazgo que ese skill existe para atrapar antes de
  construir, no en producción
- cada dato de usuario nombra **dónde se verifica la pertenencia en el servidor**, no solo su policy
- el diseño respeta las decisiones del skill `arquitectura`, o nombra cuál contradice y por qué
- la migración de datos existentes tiene estrategia concreta o está explícitamente fuera del alcance
- los escenarios críticos tienen criterio de prueba antes de considerar el feature listo
- el diseño está cortado en slices (ver [Slicing](#slicing-del-diseño-a-tareas-atómicas)) y el plan de
  construcción vive en la sección homónima de `ingenieria.md`
- el diseño pasó una auditoría en un contexto separado (ver "Evaluar antes de cerrar, en un contexto
  separado" más abajo) y sus hallazgos bloqueantes están resueltos

**Evaluar antes de cerrar, en un contexto separado:** mismo problema que en `discovery-ux` — la
conversación que diseñó `ingenieria.md` ya se convenció a sí misma de por qué cada capa, cada contrato y
cada policy tienen sentido; juzgar el propio diseño en la misma pasada no encuentra lo que ese diseño no vio.

- **La auditoría corre en un agente sin memoria de haber escrito el diseño** — recibe `ingenieria.md`
  terminado, `producto.md`, `experiencia.md` y el código existente, nunca el razonamiento de cómo se llegó
  ahí. Un fork no sirve: hereda la conversación completa, incluida la justificación de cada decisión. Un
  agente nuevo (`Agent` con un `subagent_type` que no sea `fork`, o una sesión distinta) sí aísla el sesgo.
- **Cada skill se invoca de verdad**, con la tool `Skill`, uno por uno — `clean-architecture` para la
  Dependency Rule y el acoplamiento entre capas, `domain-driven-design` para el lenguaje ubicuo y el criterio
  build-vs-buy, `supabase-postgres-best-practices` para schema/RLS/índices/migraciones. Un hallazgo que no
  cita qué dijo el skill invocado es una aplicación de memoria, no una auditoría — no cuenta para el gate.
- **La auditoría cuestiona el diseño, no solo lo confirma.** Verificar que cada contrato esté "bien escrito"
  es más fácil que objetar si la capa está en el lugar correcto o si dos entidades deberían compartir una
  regla que hoy están duplicando (o al revés). Antes de cerrar, la auditoría tiene que intentar tumbar al
  menos una decisión ya tomada (una `T-xxx`, un límite de capa, una policy RLS) citando por qué — si ninguna
  sobrevive el intento, recién ahí se confirma el diseño; si nunca se intenta, la auditoría fue cosmética.

**Loop de vuelta:** si ingeniería descubre que algo es inviable, el cambio entra primero en `producto.md`
como recorte de alcance con trade-off explícito, luego se actualiza `experiencia.md`, y por último
`ingenieria.md`.

**Aprobación:** Claude propone y marca `en revisión`; `vigente` lo otorga solo el dueño de producto.

## Auditoría sin lealtad al código existente

`ingenieria.md` empieza auditando lo que ya existe —schema, endpoints, composables, políticas RLS— porque
diseñar sin ese mapa produce decisiones que ya estaban resueltas o ya estaban rotas. Pero la auditoría es
insumo, no ancla: cuánto código ya existe no es un criterio para elegir un diseño. Cada opción —mantener,
extender o reemplazar— se compara contra las decisiones vigentes de `producto.md` y `experiencia.md` por
sus méritos, no por el costo de rehacerla.

Si lo existente contradice una decisión vigente, `ingenieria.md` lo nombra como contradicción, no como
ajuste menor.

```
❌ Títere de lo existente: "El composable de búsqueda ya filtra por categoría;
   le agregamos el orden por distancia sin tocar el resto."
   (sigue trayendo todos los perfiles al cliente para filtrar en memoria — no escala
   ni sirve para el ranking que pide D-004)

✅ Crítico: "El filtro actual ocurre en el cliente sobre una lista completa. D-004 exige
   ordenar por distancia contra la ubicación del usuario, que es una consulta geográfica
   del servidor. Son dos diseños distintos, no un filtro más — el orden se mueve a la
   query, conservando el composable como consumidor."
```

Esto corta en ambas direcciones: tan títere es defender el código actual sin cuestionarlo como proponer un
rediseño completo cuando un ajuste acotado ya cumple el contrato. La pregunta no es "¿cambiamos todo?" sino
"¿lo existente cumple la decisión vigente, sí o no?".

## Qué se ve concreto en Datealo

`ingenieria.md` debe describir contratos y datos al nivel en que se puede implementar sin reuniones de
aclaración. Si el diseño no especifica qué entra, qué sale y qué invariantes se mantienen, está incompleto.

```
❌ Abstracto: "El endpoint de búsqueda devolverá los profesionales relevantes para el usuario"

✅ Concreto: "GET /api/search recibe { category: string, lat?: number, lng?: number,
   comuna?: string, cursor?: string } y devuelve { results: SearchResult[], nextCursor: string | null }.
   SearchResult = { id, displayName, category, comuna, distanceKm: number | null,
   rating: number | null, reviewCount: number, isVerified: boolean, photoUrl: string | null }.
   Sin lat/lng ni comuna → 400 { error: 'location_required' }. distanceKm es null cuando
   se buscó por comuna y no por coordenadas — el orden entonces es por rating, no por distancia."
```

```
❌ "Se agregará una tabla para guardar las zonas de atención"

✅ "Nueva tabla professional_service_areas: professional_id (FK), comuna_code TEXT,
   PRIMARY KEY (professional_id, comuna_code). Un profesional sin ninguna fila no aparece
   en resultados por comuna. RLS: lectura pública, escritura solo del dueño del perfil."
```

## Principio central: la lógica pura vive fuera de la infraestructura

Para features con reglas o cálculos propios (ranking de resultados, cálculo de distancia, agregación de
rating, reglas de verificación), la lógica se escribe como **funciones puras** y la infraestructura
—Drizzle, `event`, Supabase, reactividad de Vue— la envuelve.

El motivo es práctico: la lógica pura se prueba con una llamada y un `expect`, sin base de datos ni
servidor. La misma regla escrita dentro de un handler de Nitro solo se puede probar levantando todo.

```ts
// ✅ La regla vive en una función pura, testeable sin infraestructura
// server/utils/ranking.ts
export function rankResults(candidates: Candidate[], origin: Coords | null): Candidate[] {
  /* orden por distancia, con rating como desempate */
}

// server/api/search.get.ts — solo I/O y orquestación
export default defineEventHandler(async (event) => {
  const query = getValidatedQuery(event, searchQuerySchema.parse)
  const candidates = await findCandidates(query)
  return rankResults(candidates, query.coords)
})

// ❌ La regla enterrada en el handler: para probar el orden hay que levantar Nitro y la DB
export default defineEventHandler(async (event) => {
  const rows = await db.select()/* ... */
  return rows.sort((a, b) => /* 30 líneas de reglas de ranking */)
})
```

Cuando la lógica además puede **cambiar de forma** (un motor de ranking que se va a reemplazar, un
proveedor de geocoding que puede cambiar), el contrato se define con una interfaz y la implementación se
inyecta. Su valor real no es elegancia: es que vuelve cortable la sustitución (ver
[Cortar un reemplazo de código vivo](./references/slicing.md#cortar-un-reemplazo-de-código-vivo)).

No aplicar a CRUD simple ni a features de presentación — la abstracción tiene costo real y no hay
beneficio si la lógica no cambia de forma.

Este principio es un caso particular de la Dependency Rule del skill `clean-architecture`: la lógica de
negocio nunca importa Drizzle, `event` ni la reactividad de Vue — son detalles que la envuelven, no al
revés. Usarlo para revisar el diseño antes de que llegue a slicing: lógica de negocio metida en un
handler, un modelo de Drizzle que se filtra como si fuera la entidad de dominio, o un "Use Case" de mil
líneas son exactamente el tipo de hallazgo que hoy solo aparece en code review — el objetivo es que
`ingenieria.md` los prevenga antes de que se escriba una línea de código.

## Cada capa expone su interfaz, nunca su implementación

Cuando la misma regla aplica a dos o más entidades (el mismo modo de selección para categoría y comuna, el
mismo manejo de error para dos catálogos), la pregunta no es "¿comparten código?" sino "¿es la misma regla,
o dos reglas que hoy se ven parecidas?". Confundir esas dos cosas produce el error contrario: duplicar una
regla real (hay que sincronizarla a mano cada vez que cambia) o unificar una similitud superficial (la
abstracción compartida termina llena de parámetros y condicionales para servir a consumidores que en
realidad necesitaban cosas distintas).

**Cuando es la misma regla:** una implementación genérica que no sabe a qué entidad sirve, y un wrapper
delgado por entidad que solo fija su dato propio — nunca reimplementa la regla. El consumidor final solo ve
la interfaz del wrapper, nunca la implementación genérica de abajo. Ejemplo real de Datealo:
[T-003 de misión 03](../../../docs/missions/03-taxonomia-categorias-y-comunas/ingenieria.md#t-003):
`CatalogSelect` implementa los 6 modos de UXF-001 una sola vez, sin saber si sirve categoría o comuna;
`CategoriaSelect`/`ComunaSelect` son wrappers que solo fijan su composable y su placeholder. Quien usa
`<CategoriaSelect modelValue="...">` no necesita saber que `CatalogSelect` existe — ese es el punto: la
interfaz pública es un solo prop, la implementación (fetch, filtrado, apertura de la lista) queda escondida
y puede cambiar sin que ningún consumidor se entere.

```vue
<!-- ✅ El consumidor conoce la interfaz, nunca la implementación -->
<CategoriaSelect v-model="categoria" />
<!-- CategoriaSelect por dentro le pasa items/pending/error a CatalogSelect —
     nadie fuera de CategoriaSelect sabe que CatalogSelect existe -->

<!-- ❌ La implementación se filtra hacia el consumidor -->
<CatalogSelect v-model="categoria" :items="categorias" :pending="pending" :error="error" />
<!-- cada pantalla que usa el selector ahora tiene que saber cómo se trae el catálogo,
     y un cambio a cómo se cachea o filtra rompe cada lugar que lo usa -->
```

**Por qué importa (Information Hiding, Parnas):** un módulo esconde una decisión de diseño que
probablemente va a cambiar — cómo se cachea el catálogo, cómo se filtra la lista al escribir. La interfaz
tiene que ser más estable que esa decisión. Si el consumidor conoce la implementación (pasa `items`,
`pending`, `error` a mano en vez de usar el wrapper), un cambio a la implementación obliga a tocar cada
consumidor — eso es *content coupling*, el tipo de acoplamiento más caro de deshacer. Pasar solo lo que la
interfaz define (*data coupling*) es lo que se busca en cada capa — mismo criterio que ISP y Boundaries del
skill `clean-architecture`, aplicado a componentes y composables, no solo a capas de arquitectura.

**Cuándo NO aplica — la duplicación es más barata que la abstracción equivocada:** dos cosas que se ven
parecidas no siempre son la misma regla. El propio T-003 dejó la capa de queries
(`server/utils/categorias.ts`/`comunas.ts`) **sin unificar a propósito**: los nombres de columna
(`categorias.slug` vs `comunas.codigo`) son distintos y TypeScript necesita esa forma explícita para tipar
bien — forzar una función genérica ahí cambia una diferencia real por un parámetro sin tipo. La pregunta
antes de extraer: si esta regla cambia, ¿cambia para las dos entidades a la vez, por el mismo motivo? Si la
respuesta es no, son dos reglas parecidas, no una — la duplicación es correcta.

## RLS no es un paso posterior, y tampoco es la autorización

Toda tabla con datos de usuario nace con su política. `ingenieria.md` resuelve, para cada cambio de schema:
qué policy se crea o cambia, o por qué ninguna hace falta. La fuente de verdad es `server/db/sql/rls.sql`.

El caso típico de Datealo tiene dos lados asimétricos y conviene escribirlo explícito: el perfil de un
profesional es **de lectura pública** (es el producto) y **de escritura solo del dueño**. Una reseña la
escribe el cliente y la lee todo el mundo. Confundir esos dos ejes es cómo se filtra un teléfono que el
profesional no quería público.

**La policy sola no protege.** Por A-002 del skill `arquitectura`, la conexión de Drizzle entra como rol
dueño y se salta RLS: la autorización real vive en el código de `server/api/`. Por eso el diseño no está
completo cuando nombra la policy — tiene que nombrar además **en qué endpoint se verifica la pertenencia**.
Un `ingenieria.md` que solo dice "RLS: lectura pública, escritura del dueño" describe una defensa que no
corre.

Antes de escribir o cambiar cualquier tabla, policy, índice o migración, usar el skill
`supabase-postgres-best-practices` — cubre desde ahí mismo cosas que hoy solo se atrapan en review: tipos
de dato mal elegidos, falta de índice en una FK, RLS sin índice de soporte (la policy funciona pero cada
query la paga en el plan), o una migración sin estrategia para las filas existentes.

## Preguntas para evaluar la factibilidad en discovery

- ¿La lógica de negocio está separada de Drizzle, del handler y de la reactividad?
- ¿Los contratos de datos entre capas están definidos antes de la implementación?
- ¿Un consumidor necesita conocer la implementación de otra capa para usarla, o le basta su interfaz?
- Si dos entidades comparten una regla, ¿es la misma regla o dos que hoy solo se ven parecidas?
- ¿El diseño de datos soporta los casos límite de `producto.md`, empezando por "no hay resultados"?
- ¿Qué pasa si Supabase responde lento o falla? ¿La pantalla degrada con gracia?
- ¿Qué policy RLS toca este cambio, y esa policy es respaldo o es la barrera real para la conexión que la
  evalúa? (ver el skill `seguridad-datos` si hay dudas)
- ¿La consulta escala más allá de una comuna, o asume que caben todos los perfiles en memoria?
- ¿Hay decisiones de arquitectura que podrían invalidar el alcance de la entrega?
- ¿El diseño encaja con las decisiones vigentes de producto y experiencia, o solo se adapta lo mínimo para
  no rehacerlo?

## Slicing: del diseño a tareas atómicas

El último paso del discovery de ingeniería convierte el diseño en un plan de construcción: una lista
ordenada de slices donde cada slice es un cambio funcional atómico — un Issue, un PR (el flujo de
`CLAUDE.md`). El plan vive en la sección "Plan de construcción" de `ingenieria.md`.

Cortar recién cuando el gate de salida se cumple y ninguna pregunta bloqueante sigue abierta: slicing sobre
decisiones abiertas produce issues que mueren.

**Si el diseño cambia después de cortar en slices — una auditoría de seguridad, un hallazgo tardío, una
corrección de `ingenieria.md`—, el plan de construcción se revisa contra el diseño actualizado antes de
darlo por vigente de nuevo.** Corregir "Modelo de datos" o "Impacto en RLS" y no tocar "Plan de
construcción" dos secciones más abajo dice, en la práctica, que el corte de esas dos filas era correcto —
aunque ya no lo sea. Concreto: si el diseño ahora exige un `revoke`, una policy nueva, o un límite de
tamaño en un bucket, el criterio de aceptación del slice que crea esa tabla o ese bucket tiene que probar
exactamente eso — no solo el camino feliz que tenía antes del cambio.

**El método completo vive en [`references/slicing.md`](./references/slicing.md)** — cómo encontrar los
slices desde las costuras del diseño, qué eje de corte usar según dónde está la incertidumbre, cómo cortar
el reemplazo de código que ya está en producción, qué hace atómico a un slice, y cómo ordenarlos por
riesgo. Leerlo al armar el plan de construcción o al generar issues desde `ingenieria.md`.

Al crear las tarjetas (issues) desde el plan, la validación de
[trazabilidad](./references/slicing.md#validar-antes-de-crear-la-tarjeta) corre siempre, sin que se pida
aparte: cada tarjeta se abre solo si su sustento (`D-xxx`, `TC-xxx`) existe, sigue vigente y queda copiado
en el cuerpo del issue.

## Relación con `producto.md` y `experiencia.md`

Una limitación técnica puede influir en el recorte, pero no debe presentarse como necesidad de producto. Si
ingeniería descubre que algo es inviable, el cambio se registra primero en `producto.md` como decisión de
alcance con su trade-off, y luego se actualiza `ingenieria.md`.

Para patrones de Nuxt y Nitro, ver `.claude/skills/nuxt/`. Para schemas y queries, ver
`.claude/skills/drizzle-orm/`. Para extraer composables y componentes al implementar, ver el skill
`vue-composition`. Para el diseño de contratos y separación lógica/infraestructura, ver `clean-architecture`
y `domain-driven-design`. Para schema, RLS, índices y migraciones, ver `supabase-postgres-best-practices`.
