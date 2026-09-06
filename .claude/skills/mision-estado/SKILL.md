---
name: mision-estado
description: Comando — dado un número/slug de misión (o inferido del worktree/rama actual si no se da), revisa el estado real (worktree, PR, documentos, issues) contra la secuencia canónica de docs/missions/README.md y dice explícitamente cuál es el único paso siguiente válido. Se invoca como `/mision-estado <misión>` o sin argumento para inferir la misión activa. Usar antes de retomar el trabajo de una misión, antes de abrir un PR o crear issues, o cuando no esté claro qué sigue.
---

# `/mision-estado` — dónde está una misión en su secuencia

Este comando existe para no reconstruir de memoria en qué paso de la secuencia está una misión — es
exactamente lo que falló cuando se ofreció "crear los issues de los 3 slices" saltándose el PR de discovery
y el cierre del worktree. La secuencia completa, numerada, vive en
[`docs/missions/README.md`](../../../docs/missions/README.md#secuencia-completa-de-una-misión) — este
comando no la repite de memoria, la lee.

## Paso 1 — Resolver el target

Si el argumento nombra una misión ("misión 12", "12", un slug, o parte de uno), resolverla contra la tabla
de `docs/missions/README.md` — no adivinar el número, leer la tabla. Si no matchea ninguna fila, decirlo y
detenerse.

Si no hay argumento — incluido "no me acuerdo en qué misión estoy" — inferir en este orden, sin adivinar:

1. `git worktree list` y la rama actual: ¿hay un worktree `NN-slug`, o la rama sigue el patrón
   `feat/s-NNN-*`/`fix/s-NNN-*`? Si hay una sola candidata clara, es esa.
2. Si no hay señal de git (ej. estás en `main` sin cambios), leer la tabla "Registro" de
   `docs/missions/README.md` y filtrar las filas con Estado distinto de `cerrada` y `pausada`. Como solo
   una misión puede estar `en construcción` a la vez, si hay una es casi seguro esa.
3. Si ninguna está `en construcción` pero hay varias en discovery en paralelo (cada una en su worktree),
   listarlas con su columna "En foco" y **preguntar cuál** — nunca elegir una por las dudas cuando hay más
   de una candidata igual de válida.

## Paso 2 — Reunir el estado real

No preguntarle a la memoria de la conversación — todo esto se verifica en el momento:

- **El tipo de misión** (columna "Tipo" de la tabla en `docs/missions/README.md`: `producto` o `técnica`)
  — determina qué documentos existen antes de buscarlos. Una misión técnica no tiene `investigacion.md`,
  `producto.md` ni `experiencia.md`; buscarlos ahí es ruido, no una señal de que faltan.
- `git worktree list` — ¿existe un worktree para esta misión? ¿en qué rama y con qué cambios sin commitear?
  **De paso, revisar todos los demás worktrees que aparezcan en esa misma lista** (no solo el de la misión
  consultada) contra el estado de su misión en la tabla de `docs/missions/README.md`: cualquiera cuya misión
  ya diga `cerrada` es huérfano — nombrarlo en el reporte con el `ExitWorktree action: "remove"` pendiente,
  sin esperar a que alguien pregunte por esa otra misión.
- El header `Estado:` de cada documento que sí exista para este tipo de misión — leerlos, no asumir por la
  fecha de la última edición.
- `gh pr list --state all --search "<slug o número de misión>"` — ¿hay un PR de discovery abierto,
  mergeado, o no existe todavía?
- Si `ingenieria.md` tiene "Plan de construcción": `gh issue list --state all --search "<label o texto de
  los slices>"` — cuántos de los issues del plan existen, cuántos están cerrados, cuántos abiertos.
- El estado de la misión en la tabla de `docs/missions/README.md` y en el README de la misión.

## Paso 3 — Ubicar la misión en la secuencia canónica

Comparar lo reunido contra los 11 pasos de la secuencia — **si la misión es técnica, los pasos 2 a 4 no
existen**: tratar "los tres documentos" de las reglas de abajo como solo `ingenieria.md` para ese caso.
Reglas de precedencia — de la señal más avanzada hacia atrás, la primera que sea cierta gana:

- Todos los issues del Plan de construcción cerrados y el estado de la misión ya dice `cerrada` → misión
  completa, no hay paso siguiente de esta lista.
- Hay issues del plan todavía abiertos, o algunos cerrados y otros ni creados → **paso 10**: seguir el
  loop de issues, uno a la vez, en la raíz.
- El worktree ya se cerró (no aparece en `git worktree list`) pero no hay ningún issue del plan creado →
  **paso 9**: crear los issues.
- El PR de discovery está mergeado pero el worktree todavía existe → **inconsistencia**, no un paso
  siguiente normal: el paso 8 se saltó. Reportarlo así, no seguir a crear issues sin resolverlo primero.
- Los documentos que corresponden a este tipo de misión están todos `vigente` pero no hay PR de discovery
  (ni abierto ni mergeado) → **paso 6**: abrir el PR.
- Están todos `vigente` y hay un PR de discovery abierto sin mergear → **paso 7**: esperar o gestionar el
  merge, no adelantarse a crear issues ni a cerrar el worktree todavía.
- Alguno de esos documentos no está `vigente` → **el paso que le corresponda** (3, 4, o 5 en una misión de
  producto; directo el 5 en una técnica) — seguir el discovery ahí, en el worktree.
- Misión de producto, no existe worktree ni ningún documento más allá de `investigacion.md` → **paso 1 o
  2**: abrir worktree o seguir en investigación. Misión técnica sin worktree ni `ingenieria.md` → **paso
  1**: abrir worktree.

## Paso 4 — Reportar

Decir explícitamente, sin rodeos: "esta misión está en el paso N de la secuencia. El paso siguiente válido
es: <texto exacto de ese paso, tal como está en `docs/missions/README.md`>."

Si el Paso 3 encontró una inconsistencia (un paso saltado), decirlo primero y como bloqueante — no ofrecer
el paso siguiente "normal" como si nada, resolver la inconsistencia es lo que sigue.

Si el Paso 2 encontró worktrees huérfanos de otras misiones, listarlos aparte (no son parte de la secuencia
de la misión consultada) y ofrecer cerrarlos ahí mismo — no dejarlo para que el usuario lo note por su
cuenta como pasó con las misiones 09 y 10.

No terminar el reporte sugiriendo una acción distinta a la que dice la secuencia, aunque parezca más rápida
en el momento — ese atajo es exactamente el que este comando existe para prevenir.
