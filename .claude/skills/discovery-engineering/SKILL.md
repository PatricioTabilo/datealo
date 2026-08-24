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
- el impacto en RLS está resuelto explícitamente: qué policy se crea o cambia, o por qué ninguna
- cada dato de usuario nombra **dónde se verifica la pertenencia en el servidor**, no solo su policy
- el diseño respeta las decisiones del skill `arquitectura`, o nombra cuál contradice y por qué
- la migración de datos existentes tiene estrategia concreta o está explícitamente fuera del alcance
- los escenarios críticos tienen criterio de prueba antes de considerar el feature listo
- el diseño está cortado en slices (ver [Slicing](#slicing-del-diseño-a-tareas-atómicas)) y el plan de
  construcción vive en la sección homónima de `ingenieria.md`

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
- ¿El diseño de datos soporta los casos límite de `producto.md`, empezando por "no hay resultados"?
- ¿Qué pasa si Supabase responde lento o falla? ¿La pantalla degrada con gracia?
- ¿Qué policy RLS toca este cambio?
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
