# Misión 13: Tamaño de fuente — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-09-06

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para arquitectura, datos, contratos, factibilidad y pruebas. Consume el comportamiento
definido en producto. Una limitación técnica cambia el alcance solo mediante una decisión explícita en
producto.md.

Núcleo obligatorio: contratos, modelo de datos, RLS y riesgos de factibilidad. Las secciones bajo demanda
(migración, rendimiento, entrega por etapas) se agregan solo cuando el riesgo lo justifica.

Gate de salida — ingenieria.md está lista para construir cuando:
- los contratos definen qué entra, qué sale y qué invariantes se mantienen, sin ambigüedad
- el modelo de datos soporta los casos límite de producto.md sin workarounds
- el impacto en RLS está resuelto: qué policy se crea o cambia, o por qué ninguna
- la migración de datos existentes tiene estrategia o está explícitamente fuera del alcance
- los escenarios verificables de producto están mapeados a pruebas
- el plan de construcción corta el diseño en slices atómicos ordenados (un slice = un Issue = un PR)
-->

## Decisión técnica: cambiar clases y props de tamaño, archivo por archivo, sin config global

F-001 se implementa cambiando clases Tailwind (`text-xs`→`text-sm`, `text-sm`→`text-base`) y props `size`
de Nuxt UI (`UButton`, `UInput`) directo en cada uno de los 18 archivos que `producto.md` ya enumeró. El
riesgo principal era el mecanismo de D-002 ("default a prueba de error"): la investigación de ingeniería
encontró que un override global en `app.config.ts` del tema de `button` (ej. redefinir que `size="lg"`
rinda 16px) tiene un radio de efecto que se sale del alcance de la misión — `size="lg"` también lo usan los
botones "Reintentar" de `buscar/index.vue`/`[id].vue` (que esta misión decidió no tocar, ya cumplen el piso
de 14px) y los `UButton` de `registro.vue`/`ingresar.vue` (explícitamente fuera de alcance). Cambiar el
tema global subiría esas pantallas sin que nadie lo haya pedido ni revisado. Por eso D-002 se resuelve con
cambios explícitos por instancia para el código que ya existe, y con el piso tipográfico agregado al skill
`write-code` (invocado obligatoriamente antes de cualquier edición de `.vue`/`.ts`) para el texto que se
escriba después — ver [T-001](#t-001).

- **Contratos de producto cubiertos:** F-001.
- **Riesgo bloqueante:** ninguno.

## Arquitectura: no hay una nueva — es un cambio de presentación sobre componentes existentes

Esta misión no introduce lógica de negocio, funciones puras, composables ni endpoints — es cambiar el
valor de una prop (`class`, `size`) en 18 archivos ya existentes. No hay responsabilidad nueva que dividir
ni frontera nueva que trazar: forzar una tabla de "componente → responsabilidad" acá describiría una
arquitectura que no existe. La única decisión de diseño real es T-001 (mecanismo de D-002), ya resuelta
arriba.

## Contratos

<!--
Cada contrato especifica entrada, salida e invariantes al nivel en que se puede implementar sin reuniones
de aclaración. Incluye los errores observables y el código HTTP cuando es un endpoint.
-->

Sin contratos nuevos ni modificados: F-001 no cambia qué datos entran o salen de ningún endpoint, ni las
props públicas de ningún componente (`CategoriaSelect`/`ComunaSelect` siguen recibiendo `modelValue`/`size`
igual que antes; `SearchResultCard` sigue recibiendo `professional`/`vecina`). Cambia únicamente el interior
de sus templates.

## Modelo de datos

<!-- Entidades con significado, escritura y ciclo de vida. El schema completo vive en server/db/. -->

No aplica — F-001 no crea, modifica ni lee ninguna tabla, columna o entidad. No hay datos nuevos que
tengan significado, escritura o retención que documentar.

### Impacto en RLS

<!--
Obligatorio. Fuente de verdad: server/db/sql/rls.sql. Si el cambio no toca ownership ni relaciones usadas
en policies, decirlo explícitamente con esa razón — no dejar la sección vacía.
-->

Ninguno. Corrí el checklist de `seguridad-datos` contra este diseño: no hay tabla ni bucket nuevo o
modificado, no cambia qué usa el cliente de Supabase del browser (`app/plugins/supabase.client.ts` sigue
llamando exactamente a lo mismo), no hay función `SECURITY DEFINER` ni verificación de pertenencia que
tocar — F-001 no le agrega ni le quita superficie a PostgREST/Storage. El checklist no aplica punto por
punto porque su precondición (tocar datos) no se cumple.

## Riesgos y experimentos de factibilidad

<!--
Un riesgo que podría cambiar el producto se enlaza como pregunta o decisión en producto.md. Un experimento
tiene pregunta, límite de tiempo y resultado capaz de cerrar la incertidumbre.
-->

| ID     | Riesgo o pregunta                                                                 | Qué invalida | Experimento o mitigación | Criterio de salida | Estado |
| ------ | ------------------------------------------------------------------------------------ | -------------- | --------------------------- | --------------------- | -------- |
| TR-001 | Los mockups usan Tailwind puro (aproximación); Nuxt UI real puede espaciar distinto y romper algún layout que el mockup no capturó | UX-001 (jerarquía sin tocar peso/color) — no D-001/F-001 en sí | Captura con Playwright en 390px de cada slice ya implementado, antes de abrir su PR | El dueño de producto revisa la captura real y confirma que sostiene lo que muestra el mockup — esto es lo que cierra [Q-001](./producto.md#q-001) | cerrado 2026-09-06 — capturas de los tres slices revisadas, layout y jerarquía sostenidos sin ajustes |

## Estrategia de pruebas

<!-- Mapea los ejemplos verificables de producto.md a niveles de prueba. Qué demuestra cada una. -->

No hay lógica pura ni contrato de API que probar con unidad/integración — F-001 es presentación. La
verificación es la que ya define [M-001](./producto.md#m-001) en `producto.md`:

| Contrato o riesgo | Nivel                                  | Caso principal                                                        | Límite o falla |
| ------------------- | ------------------------------------------ | -------------------------------------------------------------------------- | ------------------ |
| F-001              | estático (grep contra la lista de `producto.md`) | cero clases `text-xs`/`size="sm"` restantes en los elementos listados como "sube", por archivo | un elemento exento (ej. "En Datealo desde…") aparece en el grep y hay que confirmar a mano que sigue en la lista de exentos, no que se filtró |
| F-001, CL-001      | visual (Playwright, 390px, por slice)   | captura de cada vista con datos reales (incluido el nombre largo de CL-001) sin overflow ni layout roto | TR-001: la captura no sostiene lo que muestra el mockup → vuelve a UX-001, no se parcha en el PR |

### Propiedades que deben probarse

- El truncado (`truncate`, `…`) sigue activo en nombre y comuna con el tamaño nuevo — CL-001 no depende
  de un ancho fijo que el tamaño más grande pueda romper.
- Ningún elemento de la lista "sube" de `producto.md` queda en 12px o en un `size` que rinda 12-14px por
  debajo de lo que esa fila pide — verificable con el mismo grep que usa M-001.

## Plan de construcción

<!--
Se completa al final, cuando el gate de salida se cumple y ninguna pregunta bloqueante sigue abierta —
cortar sobre decisiones abiertas produce issues que mueren. Cada slice es un cambio funcional atómico: un
Issue, un PR, ejecutable sin haber leído la misión (el issue lleva su contrato inline) y con criterios
pass/fail enumerables como tests. Guía completa en el skill discovery-engineering.
-->

Eje de corte: por vista (V-001/V-002/V-003), no por tipo de cambio (ej. "todos los botones" separado de
"todos los textos") — cada slice es revisable y verificable de forma aislada en una sola pantalla, sin
esperar a que otro slice termine, y el riesgo es parejo entre los tres (ningún slice es más incierto que
otro, así que no hay un eje de riesgo que priorizar por encima del de superficie).

| ID    | Slice (una frase, sin "y")                                    | Sustento                        | Criterio de aceptación principal | Depende de |
| ----- | ----------------------------------------------------------------- | ------------------------------------ | ------------------------------------- | ------------ |
| S-001 | Subir el tamaño de texto del buscador y la card de resultados     | F-001, D-001, D-002, CL-001, [E-005](./investigacion.md#e-005) | Con "María Fernanda Rojas Ilabaca" en "San José de Maipo" y $25.000 en `/buscar` a 390px: el nombre se ve en 16px bold, comuna/rating/precio/contador en 14px, "En Datealo desde…" sin cambio, el botón "Buscar" del selector en 16px, y el nombre sigue truncando con `…` sin desbordar la card | — |
| S-002 | Subir el tamaño de texto del perfil público y su CTA de contacto  | F-001, D-001, D-002                  | En `/profesionales/[id]` a 390px: descripción y precio en 16px, "Escribir por WhatsApp" en 16px real (no 14px pese a `size="lg"`), "Reseñas" y el contenido de cada reseña en 16px, "En Datealo desde…" y la fecha relativa sin cambio | — |
| S-003 | Subir el tamaño de texto del perfil de gestión y sus componentes  | F-001, D-001, D-002                  | En `/profesional/perfil` a 390px: "Descripción"/"Precio" y sus valores en 16px, "Editar" y los mensajes de error de guardado en 14px, los inputs de precio y "Tus datos" en 16px (sin `size="sm"`), el botón "Reintentar" del selector de categoría/comuna en 14px (no 12px) | — |

## Secciones bajo demanda

<!--
Agregar solo cuando el riesgo lo justifique, con estos títulos:

- "Migración y compatibilidad": cuando existan datos o consumidores que deben llegar al nuevo contrato.
  Incluye rollback lógico si la migración física no puede revertirse.
- "Rendimiento y observabilidad": cuando haya presupuesto de latencia o volumen que defender (búsqueda
  geográfica y listados paginados son los candidatos naturales).
- "SEO e indexación": cuando la superficie deba ser indexable (páginas por categoría + comuna, datos
  estructurados).
- "Entrega por etapas": cuando el cambio necesite despliegue incremental o feature flags.
-->

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El código se corrige archivo por archivo; el piso a futuro se hace cumplir vía el skill `write-code`, no vía config ni lint

- **Estado:** aceptada — aprobado por Patricio el 2026-09-06. **Fecha:** 2026-09-06.
- **Contratos:** F-001, [D-002](./producto.md#d-002).
- **Alternativas descartadas:**
  - Sobrescribir en `app.config.ts` el tamaño real de `size="lg"`/`"sm"` de `button`/`input` para que
    "por default" rindan más grande — descartada: `size="lg"` lo usan también los botones "Reintentar" de
    `buscar/index.vue`/`[id].vue`, que esta misión decidió dejar en 14px, y los `UButton` de
    `registro.vue`/`ingresar.vue`, explícitamente fuera de alcance. Un override global los sube a todos
    sin que nadie lo haya pedido — CL-002 de `producto.md` ya anticipaba este riesgo, y acá se confirma
    que el radio de efecto es demasiado ancho para esta misión.
  - Una regla de lint/CI que bloquee `text-xs`/`size="sm"` — descartada: para verificar si una instancia
    puntual es "de uso frecuente" (sube) o "se lee una vez" (exenta) un lint necesitaría esa distinción
    marcada en el código de alguna forma (un atributo, una convención de nombre) que hoy no existe;
    construir esa marca solo para este chequeo es una abstracción a la medida de una herramienta, no del
    problema.
  - No decir nada y confiar en que el patrón ya escrito en `producto.md` se recuerde solo — descartada:
    es exactamente lo que ya falló una vez en esta misión (los inputs con `size="sm"` que rompían un
    supuesto que el propio documento daba por hecho); una regla que nadie vuelve a leer se repite.
- **Decisión y consecuencias:** cada slice (S-001 a S-003) cambia las clases y props `size` directo en los
  archivos que `producto.md` ya enumeró. Para el código que ya existe, esto cierra el problema. Para texto
  nuevo que se escriba después de esta misión, el piso tipográfico (texto de uso frecuente nunca en 12px;
  principal en 16px, secundario en 14px como mínimo) quedó agregado al skill `write-code`
  (`.claude/skills/write-code/SKILL.md`), que el proyecto invoca **obligatoriamente** antes de escribir o
  editar cualquier `.vue`/`.ts` (`write-code.global.md`) — no es una guía que alguien podría no leer, es
  un paso del flujo de edición, igual que el `typecheck` antes de cerrar un cambio. Consecuencia aceptada:
  esto depende de que el skill se siga invocando (una garantía de proceso, no una imposibilidad técnica
  como sería un tipo de TypeScript) — más débil que un lint, pero cubre el caso real (un desarrollador o
  un agente escribiendo código nuevo) sin la abstracción a medida que exigiría automatizarlo hoy.
- **Reapertura:** si el piso documentado en `write-code` se salta más de una vez en la práctica (alguien
  edita un `.vue` sin que el skill se haya invocado, o lo invoca y aun así reintroduce 12px), reconsiderar
  el lint descartado arriba — a esa altura ya habría evidencia real de que la marca semántica que hace
  falta vale la pena construirse.

## Preguntas

<!--
Todas viven en esta tabla ordenada por ID, abiertas y cerradas juntas. Ningún ID se borra ni se reutiliza.
Estado: abierta | resuelta AAAA-MM-DD | disuelta AAAA-MM-DD. Solo las abiertas llevan bloque de detalle.
-->

No hay ninguna pregunta abierta que bloquee la construcción. TR-001 (¿el layout real sostiene lo que
muestra el mockup?) no bloquea empezar — se resuelve slice por slice, con la captura de cada PR, antes de
mergearlo.
