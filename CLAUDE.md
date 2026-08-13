# Datealo — Instrucciones para Claude Code

## Identidad del producto

Datealo es un buscador de profesionales y servicios para el hogar y la vida diaria. Conecta a personas
que necesitan resolver algo (gasfitería, electricidad, peluquería, mudanzas, limpieza) con profesionales
verificados de su zona.

**Mensaje core**: encuentra al profesional que necesitas, cerca de ti.

**Flujo core**: buscar → explorar resultados → ver perfil → contactar. Cada feature nueva debe reforzar
ese flujo, no romperlo.

**Estado actual**: pre-lanzamiento. Solo existe la landing con lista de espera — no hay usuarios reales
todavía. Esto tiene una consecuencia directa en cómo se decide: no hay datos de uso propios, así que toda
afirmación sobre "lo que hace el usuario" es hipótesis hasta que se declare como tal.

**Guardrails de producto** — nunca implementar:

- Subastas o bidding entre profesionales por un cliente.
- Pago obligatorio para contactar (en esta fase).
- Dashboards complejos antes de tener tracción.
- Copy agresivo o de urgencia artificial.
- Features que agreguen pasos al flujo buscar → perfil → contactar.

## Tipos de usuario

**Buscador (cliente)** — busca un servicio por categoría, ubicación o nombre; explora perfiles, lee
reseñas, ve trabajos anteriores; contacta por WhatsApp o teléfono; deja reseña después del servicio.
Llega con un problema concreto y a menudo urgente, desde el celular.

**Profesional** — crea y gestiona su perfil público (servicios, zona, fotos, precios orientativos);
recibe contactos; acumula reseñas y reputación. No es un usuario técnico y gestiona su perfil entre
trabajos, también desde el celular.

## Principios de experiencia

- Búsqueda directa: el usuario llega, busca y encuentra — sin fricción.
- Confianza primero: perfiles con reseñas, fotos de trabajos y verificación.
- Resultados relevantes: proximidad geográfica + calidad del profesional.
- Mobile-first: la mayoría de las búsquedas ocurren desde el celular.
- Simplicidad: pocas pantallas, flujo claro, cero confusión.
- Inclusivo en categorías: oficios del hogar, servicios personales, profesionales especializados — todo
  cabe si alguien lo busca.

## Stack técnico

- **Frontend**: Nuxt 4, Vue 3, TypeScript strict
- **Estilos**: Tailwind CSS v4, DaisyUI v5 (tema `datealo`), tipografías Plus Jakarta Sans + DM Sans
  — la migración a Nuxt UI v4 está decidida y pendiente (A-004 del skill `arquitectura`). Nuxt UI trae
  `@nuxt/fonts`, que auto-hospeda las tipografías en vez de cargarlas por `<link>` a Google Fonts — ojo con
  esto al tocar `nuxt.config.ts` o `app.head` una vez que la migración aterrice.
- **Iconos**: `@lucide/vue` (paquete renombrado desde `lucide-vue-next` en su v1, 2026-03)
- **Auth/DB**: Supabase (PostgreSQL + Auth + RLS)
- **ORM**: Drizzle
- **Estado**: Composition API + composables de Nuxt (`useState`)

## Estructura del proyecto

Estructura oficial de Nuxt 4, sin refactoring prematuro. **YAGNI**: no mover a `src/` ni crear aliases
custom hasta que haya fricción real.

```
app/
├── components/      # Componentes Vue
├── composables/     # Lógica de negocio (estado + acciones)
├── constants/       # Valores runtime (PROFESSIONAL_STATUS, CATEGORY_TYPE)
├── fixtures/        # Mock data (JSON)
├── layouts/         # Layouts de Nuxt
├── pages/           # Routing basado en archivos
├── types/           # Solo tipos TypeScript
└── utils/           # Funciones puras (formatters, helpers)

server/
├── api/             # Endpoints del servidor
├── db/              # Schema Drizzle + migraciones
│   └── sql/         # SQL crudo (políticas RLS)
└── utils/           # Utilidades del servidor

docs/missions/       # Discovery de features (ver "Flujo de trabajo")
docs/design/         # Kit de mockups
```

### Separación de responsabilidades

| Carpeta       | Contiene                                              | No contiene                          |
| ------------- | ----------------------------------------------------- | ------------------------------------ |
| `composables` | Estado, reglas de negocio, mutaciones, side effects   | Formateo, traducciones, lógica de UI |
| `utils`       | Funciones puras: formatters, labels, cálculos de UI   | Estado reactivo                      |
| `constants`   | Enums como objetos `as const`, config, valores fijos  | Tipos                                |
| `types`       | Tipos derivados de constantes, entidades              | Valores runtime                      |

```ts
// constants/professional.ts — valores runtime
export const PROFESSIONAL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING_VERIFICATION: 'pending_verification',
} as const

// types/professional.ts — tipos compile-time
import type { PROFESSIONAL_STATUS } from '~/constants/professional'
export type ProfessionalStatus = (typeof PROFESSIONAL_STATUS)[keyof typeof PROFESSIONAL_STATUS]
```

## Comandos de verificación

Antes de dar por terminado cualquier cambio de código:

```bash
npx nuxi typecheck      # Cero errores
npm run build           # Compila
```

**Verificación visual**: para cambios de UI, levantar `npm run dev` (puerto 3001) y probar en el browser
antes de dar el cambio por hecho. Móvil primero: 390px de ancho es el caso principal, no una variante.

## Principios de código

**YAGNI**: cada línea de código es deuda técnica. Antes de escribir código custom: (1) buscar si ya existe
en el proyecto, (2) evaluar si una librería establecida lo resuelve, (3) recién entonces escribir lo mínimo.
Esto **no aplica a la estructura de lo que sí se va a construir**: aislar un dominio, definir un contrato
entre capas o separar lógica pura de reactividad no son abstracciones especulativas, son la forma de que lo
pedido quede bien hecho. La pregunta no es "¿sería más simple sin esto?" sino "¿esto existe por algo que ya
nos pidieron?".

**TypeScript strict**: `type` sobre `interface` para modelos de dominio. `as const` para enums. Derivar
tipos de las constantes. Sin `any` — usar `unknown` + narrowing. Sin `@ts-ignore`.

**Composables**: `useState()` en vez de `ref()` para compatibilidad SSR. Un composable, un dominio. Return
como objeto plano de refs, agrupado (estado, computeds, acciones). Cleanup con `onUnmounted` para
intervals, listeners y subscriptions.

**Componentes**: siempre `<script setup lang="ts">`. `computed()` sobre métodos para estado derivado.
Presentacionales — la lógica vive en composables. Ver el skill `vue-composition` para umbrales, triggers
de extracción y patrones.

**Errores**: ningún `catch` vacío. Fallo de red → feedback visible. Fallo de servidor → mensaje legible.
Sin `console.log` de debug en el código que se mergea.

**Naming**: archivos en kebab-case, componentes en PascalCase, composables `useAlgo`, constantes en
SCREAMING_SNAKE_CASE, tipos en PascalCase, funciones en camelCase. Named exports sobre default exports.

**Comentarios**: solo para reglas de negocio no obvias. El naming claro es la documentación por defecto.

## Umbrales de salud de archivos

| Recurso                        | Verde     | Amarilla  | Roja      |
| ------------------------------ | --------- | --------- | --------- |
| Componente `.vue`              | ≤ 200 LOC | 200–400   | > 400 LOC |
| Composable `.ts`               | ≤ 150 LOC | 150–300   | > 300 LOC |
| Función/método                 | ≤ 30 LOC  | 30–60     | > 60 LOC  |
| Props por componente           | ≤ 5       | 6–8       | > 8       |
| Funciones en `<script setup>`  | ≤ 5       | 6–10      | > 10      |
| Miembros en el return          | ≤ 15      | —         | > 15      |
| Entidades por composable       | 1         | —         | > 1       |

Verde: editar. Amarilla: evaluar extracción si vas a agregar código. Roja: extraer **antes** de agregar
código — un archivo de 500 LOC con "solo 5 líneas más" sigue siendo un archivo en zona roja. La extracción
es parte de implementar, no un refactor extra.

## Seguridad RLS

Toda tabla con datos multi-usuario tiene su policy en `server/db/sql/rls.sql`, que es su fuente de verdad.
Pero la policy **no es lo que protege**: la conexión de Drizzle se salta RLS, así que la autorización real
vive en el código de `server/api/`. El detalle está en A-002 del skill `arquitectura`.

Cada cambio de schema debe evaluar si RLS necesita actualización antes de cerrar el issue:

- **Sí actualizar** cuando se crea una tabla con datos de usuario, cambia el ownership (`user_id`) o las
  relaciones usadas en policies (`EXISTS`/FKs), o se renombran tablas/columnas referenciadas.
- **No hace falta** cuando solo se agregan campos de negocio (`title`, `color`, `price`) sin tocar
  ownership ni seguridad.

## Flujo de trabajo: misión → issue atómico → PR

El discovery de una feature vive en `docs/missions/`. El tracking de ejecución vive en **GitHub Issues**.

**Una misión** documenta el discovery de una feature en cuatro documentos con fuentes de verdad separadas
(`investigacion.md` → `producto.md` → `experiencia.md` → `ingenieria.md`). Cómo se escribe cada uno está en
los skills `discovery-product`, `discovery-ux` y `discovery-engineering`. El registro de misiones y la
convención de carpetas están en [`docs/missions/README.md`](docs/missions/README.md).

**Una tarea = un Issue = un PR chico y revisable.** No una feature completa punta a punta — un cambio
funcional atómico. Los issues salen del "Plan de construcción" de `ingenieria.md`, ya cortado en slices.

- Si se pide algo sin issue asociado, crearlo primero (o preguntar si ya existe) antes de tocar código.
- Al terminar una tarea, abrir el PR y **detenerse ahí**. El checkpoint de revisión humana es el punto
  central del flujo, no un paso opcional.
- Labels en dos dimensiones, alineadas a la convención de commits:
  - `type: feat|fix|chore|refactor|docs`
  - `scope: app|server|db|ui|infra|docs`

La prosa de misiones, PRs, commits y READMEs sigue [`docs/project-narrative.md`](docs/project-narrative.md).

## Convención de commits

Conventional Commits en español: `<tipo>(<scope>): <descripción corta en imperativo>`.

Tipos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `perf`. Scopes: `app`, `server`, `db`,
`ui`, `infra`, `docs`.

Descripción en español, imperativo, sin punto final, sin mayúscula inicial. Cuerpo opcional (máx 3 líneas).
No hacer commits por iniciativa propia — solo cuando el usuario lo pida, y ahí ejecutar directo sin pedir
confirmación.

Antes de redactar: `git diff --stat HEAD` para revisar todos los archivos. Antes de `git add`: revisar
`git status` y separar cambios legítimos de basura (archivos no-config en la raíz, `.save`/`.bak`/`.tmp`) —
si hay basura, mostrar la lista al usuario.

## Skills

Skills propios del repo en `.claude/skills/`:

| Skill                     | Cuándo                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| `arquitectura`            | Endpoints, base de datos, RLS, secretos, despliegue, librería de UI |
| `discovery-product`       | Iterar `investigacion.md` o `producto.md` de una misión            |
| `discovery-ux`            | Iterar `experiencia.md`: vistas, flujos, estados, mockups          |
| `discovery-engineering`   | Iterar `ingenieria.md`: contratos, datos, slicing en issues        |
| `vue-composition`         | Extraer componentes o composables; auditoría de salud de archivos  |

Skills de terceros pre-instalados en `.agents/skills/` (ver `skills-lock.json`): `nuxt`, `vue`,
`drizzle-orm`, `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `marketing-psychology`,
`ai-seo`, `content-strategy`, `page-cro`. Están todos localmente — nunca sugerir instalarlos.

## Guardrails de trabajo

Ante duda entre investigar y preguntar, investiga primero (cuesta cero):

| Tipo de duda                                                            | Acción                                |
| ----------------------------------------------------------------------- | ------------------------------------- |
| Mejores prácticas, cómo lo resuelven otros productos, patrones técnicos | Investiga online y en el codebase     |
| Ambigüedad técnica con respuesta verificable (API, sintaxis, patrón)     | Investiga docs, codebase, online      |
| Decisión de negocio que solo el usuario conoce (prioridad, alcance)      | Pregunta al usuario                   |
| Bloqueo real (herramienta caída, credencial faltante)                    | Reporta el bloqueo y detente          |

- Al implementar con versiones recientes (Nuxt 4, Tailwind v4, DaisyUI v5, Drizzle), verifica la API
  contra la documentación oficial en vez de asumir por memoria — las tres cambiaron de forma en su
  última mayor.
- Lee un archivo completo antes de editarlo. Un edit sobre contexto parcial pisa código que no viste.
- Si encuentras algo roto y el fix es claro, arréglalo.
- No dejes código muerto, imports sin usar ni funciones que nadie llama.
