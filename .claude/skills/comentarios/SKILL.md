---
name: comentarios
description: Cuándo escribir un comentario de código en Datealo y cómo no dejarlo pudrirse — evita comentarios negativos ("no hace X"), duplicados entre archivos, con números que se desactualizan, o que citan una decisión (D-001, T-003, UX-002) sin explicar el porqué en la misma línea. Usar antes de escribir cualquier comentario nuevo, o al revisar si uno existente debería reescribirse o borrarse.
---

# Comentarios en Datealo

**Fuentes**: [Stack Overflow Engineering — Best practices for writing code
comments](https://stackoverflow.blog/2021/12/23/best-practices-for-writing-code-comments/) ("code tells you
how, comments tell you why"; comentarios que duplican el código tienen valor negativo — ensucian y hay que
mantenerlos). Sección "Comentarios" de `CLAUDE.md` (regla de autocontención del repo).

Este skill nació de dos vueltas de feedback reales en la misma tarea (PR #57, `CategoriaSelect.vue`): la
primera corrigió comentarios que citaban una decisión sin explicar nada; la segunda encontró que el
comentario "corregido" seguía siendo duplicado y con un número que ya estaba mal el mismo día que se
escribió. Los ejemplos de abajo son ese caso real.

## Antes de escribir un comentario, en este orden

1. **¿El código ya lo dice solo?** Un wrapper de 4 líneas con un solo componente adentro no necesita un
   comentario que diga "esto es un wrapper que no hace nada propio" — eso ya se lee en el código. No
   comentar.
2. **¿Esta explicación ya vive en otro archivo?** No la repitas. Que viva una sola vez, donde el dato o la
   prop se define — todo lo demás son N copias que se pueden desincronizar.
3. **¿Es positiva o negativa?** Describe qué hace, qué extiende, o dónde vive la lógica relevante — nunca
   qué NO hace. "No reimplementa X" no ayuda a nadie a entender el código; "X vive en Y" sí.
4. **¿Tiene un número o hecho que puede cambiar sin que el comentario se entere?** Sacalo. Describe la
   forma cualitativa ("catálogo chico" vs. "catálogo grande"), no el valor exacto ("8" vs. "346") — el
   valor exacto vive en el código o los datos, no en un comentario que nadie va a actualizar cuando cambie.
5. **¿Cita un ID de decisión (D-001, T-003, UX-002) sin explicar el porqué en la misma línea?** La cita
   acompaña como trazabilidad hacia la decisión completa — nunca reemplaza la explicación. Si al sacar el
   ID el comentario deja de tener sentido, todavía no explica nada.

Si la respuesta a la 1 es sí, no hay comentario. Si sobrevive las cinco, es un comentario que vale la pena.

## Ejemplos reales de este repo

❌ Cita sin explicar (encontrado en `server/db/seed/taxonomia.ts`, antes de corregirse):

```ts
// Catálogo de referencia, cambia solo a mano (D-002).
```

Obliga a ir a buscar D-002 para entender qué significa que el catálogo "cambie a mano".

✅ Corregido — la razón vive en la línea, D-002 es trazabilidad:

```ts
// El campo `activa` se cambia a mano en la base, no desde la app — no hay panel de admin todavía, así
// que no hay ningún evento de escritura del que colgar una invalidación de caché al instante (D-002).
```

❌ Negativo + duplicado + número que se pudre (encontrado en `CategoriaSelect.vue`, dos vueltas de
feedback antes de esta versión):

```ts
// No reimplementa nada de la interacción (filtrado, apertura, selección) — eso vive una sola vez en
// CatalogSelect... (T-003)
//
// Categorías son solo 8 — mostrarlas todas al enfocar no es ruido, por eso showAllOnFocus (UX-002).
```

Tres problemas a la vez: describe qué NO hace (regla 3), la razón de `showAllOnFocus` ya estaba explicada
en `CatalogSelect.vue` junto a la prop (regla 2), y "son solo 8" es un hecho que cambia — el mismo
comentario decía en otra versión "~33 comunas activas" y ya estaba desactualizado el día que se escribió
(regla 4).

✅ Corregido — cero comentarios en el wrapper (el prop ya es el hecho), la razón vive una sola vez donde se
declara la prop:

```ts
// CatalogSelect.vue, junto a la prop:
// Catálogo chico (categorías): mostrar todo al enfocar no cuesta nada. Catálogo grande (comunas): esperar
// a que se escriba, el patrón ya validado de Mercado Libre — mostrar todas las opciones de entrada es
// más ruido que ayuda. UX-002 en experiencia.md.
```

```vue
<!-- CategoriaSelect.vue: sin comentario, el prop ya lo dice -->
<CatalogSelect ... :show-all-on-focus="true" />
```

## Al revisar un comentario existente

Si estás editando un archivo y pasás por un comentario que no cumple las cinco reglas, corregilo ahí mismo
— no hace falta una tarea aparte para eso, es parte de dejar el código mejor de como lo encontraste.
