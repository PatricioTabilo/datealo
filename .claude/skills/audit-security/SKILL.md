---
name: audit-security
description: Comando — audita el `ingenieria.md` y el Plan de construcción de una misión en busca de problemas de seguridad de datos, usando el checklist del skill `seguridad-datos`. Se invoca como `/audit-security <misión>` (ej. "misión 4", "04", "registro-perfil-profesional") o sin argumento para auditar cambios de schema/RLS/Storage pendientes en la rama actual. Usar cuando alguien pida auditar la seguridad de una misión, corra `/audit-security`, o pregunte "¿el diseño de datos de la misión X tiene problemas de seguridad?".
---

# `/audit-security` — auditoría de seguridad de una misión

Este comando existe para no depender de que alguien se acuerde de pedir la auditoría manual que se hizo la
primera vez a mano, con un subagente, en la misión 04. Automatiza el "cómo correrlo" del skill
`seguridad-datos` contra un target concreto.

## Paso 1 — Resolver el target

Si el argumento nombra una misión ("misión 4", "04", un slug, o parte de uno), resolverla contra la tabla
de [`docs/missions/README.md`](../../../docs/missions/README.md) — no adivinar el número, leer la tabla. Si
no matchea ninguna fila, decirlo y detenerse; no auditar la misión más parecida por las dudas.

Si no hay argumento, o el argumento no es una misión (ej. "rama actual", "este PR"), el target pasa a ser
`git diff` contra la base de la rama, filtrado a lo que toca `server/db/schema/`, `server/db/sql/rls.sql`,
o cualquier creación/modificación de bucket de Storage. Si ese diff está vacío, decirlo y detenerse — no
hay nada que auditar.

## Paso 2 — Reunir contexto

Para una misión: leer completos `producto.md` y `experiencia.md` (para saber qué datos son públicos y
cuáles no, por decisión de producto — no asumirlo) y `ingenieria.md` completo, con especial atención a
"Modelo de datos", "Impacto en RLS", y **"Plan de construcción"** — el Paso 4 lo necesita completo, no un
resumen.

Para un diff: `git diff` contra la base, más los archivos completos que ese diff toca (un diff parcial de
`rls.sql` sin el archivo completo esconde policies existentes que la nueva podría chocar).

## Paso 3 — Correr el checklist

Invocar el skill `seguridad-datos` y aplicar su checklist completo contra lo reunido en el Paso 2. No
resumir el checklist de memoria — invocarlo de verdad, es la fuente de verdad de qué mirar.

**Antes de evaluar, decidir cómo:** si el `ingenieria.md` (o el diff) fue escrito o editado por ti mismo en
esta misma conversación, delegar el Paso 3 y el Paso 4 a un subagente nuevo, sin ese contexto — la razón ya
está escrita en `seguridad-datos` ("Cómo correrlo"): una relectura propia sigue anclada al razonamiento con
el que uno se convenció a sí mismo. Si el documento o el diff vienen de otra sesión, de otra persona, o de
antes en el historial de git sin que tú lo hayas tocado, podés correr el checklist directo, sin subagente.

## Paso 4 — Auditar el Plan de construcción, no solo el diseño

Esto es lo que un checklist de RLS por sí solo no atrapa, y es la razón por la que este comando lee el
slicing además del documento: **una tabla o un bucket puede estar perfectamente diseñado y aun así quedar
inseguro varios PRs, si el slicing lo corta mal.** Recorrer cada fila de "Plan de construcción" y verificar,
para cada slice que cree o modifique una tabla o un bucket con datos de usuario:

- ¿El slice incluye, en el mismo PR, tanto la policy RLS como la verificación de pertenencia en el
  endpoint? Si la policy queda en un slice y la verificación en uno posterior, hay una ventana entre ambos
  merges donde cualquiera lee o escribe lo que no debería — exactamente la advertencia de
  `slicing.md` ("Lo que la arquitectura obliga a cortar junto").
- Si el slice crea un bucket de Storage: ¿el mismo slice fija `public`/privado, `file_size_limit` y
  `allowed_mime_types`, o esos quedan para "después"? Un bucket que nace sin límites, aunque sea por un
  solo PR, ya es una ventana real.
- ¿Algún slice usa la frase "revisar seguridad después" o equivalente en vez de un criterio de aceptación
  verificable? Es la señal de un slice que se aprobó sin que nadie decidiera qué significa "seguro" para
  esa pieza.

Cada hallazgo de este paso es tan válido como uno de diseño — un diseño seguro con un slicing que lo
despedaza mal produce el mismo agujero en producción.

## Paso 5 — Reportar

**No usar la tool `ReportFindings`** — no está disponible de forma confiable fuera del skill `code-review`
(verificado: un subagente que la intentó usar no la tuvo disponible). Reportar en texto plano, un bloque
por hallazgo, ordenados de mayor a menor severidad:

- **Severidad** (`ALTA`/`MEDIA`/`BAJA`) y **categoría** — una de: `rls-exposure` (PostgREST/Storage
  alcanzable sin querer), `storage-config` (bucket mal configurado), `key-exposure` (secretos,
  `SECURITY DEFINER` sin control, o un enlace/token transferible mal acotado), `ownership-verification`
  (falta el chequeo en código, A-002), `slicing-gap` (el Paso 4: el diseño está bien, el corte en slices
  no).
- **Ubicación** — archivo y línea o sección de `ingenieria.md` (la fila del "Plan de construcción" para
  hallazgos del Paso 4, la sección correspondiente para hallazgos del Paso 3), o el archivo real que el
  diff toca.
- **Qué está mal**, citando el texto exacto del documento que lo muestra.
- **`failure_scenario`** — el escenario concreto de qué sale mal, no solo la regla que se viola: quién hace
  qué, con qué acceso, y qué consigue.

Cerrar con un veredicto explícito: ¿este `ingenieria.md` (o este diff) es seguro para construir tal como
está, sí o no, y con qué condición si la respuesta es "sí, pero" — mismo formato que ya usó la auditoría de
la misión 04.
