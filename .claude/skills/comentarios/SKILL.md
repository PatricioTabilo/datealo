---
name: comentarios
description: Cuándo escribir un comentario de código en Datealo y cómo no dejarlo pudrirse — evita comentarios que restan el porqué a favor del qué, negativos ("no hace X"), duplicados entre archivos, con números que se desactualizan, o que citan un ID de decisión (D-001, T-003, UX-002) en vez de explicar. Usar antes de escribir cualquier comentario nuevo, o al revisar si uno existente debería reescribirse o borrarse.
---

# Comentarios en Datealo

**Fuentes:** [Google eng-practices — What to look for in a code
review](https://google.github.io/eng-practices/review/reviewer/looking-for.html) ("comments are useful
when they explain why some code exists, and should not be explaining what... if code isn't clear enough
to explain itself, then the code should be made simpler"). [Ousterhout, *A Philosophy of Software
Design*](https://www.goodreads.com/work/quotes/61938796) ("a first step towards writing good comments is
to use different words in the comment from those in the name of the entity being described"). [Stack
Overflow Engineering — Best practices for writing code
comments](https://stackoverflow.blog/2021/12/23/best-practices-for-writing-code-comments/) (comentarios
que duplican el código o un hecho que cambia tienen valor negativo: ensucian y hay que mantenerlos).

## El test

**Un comentario vale la pena solo si dice algo que el código no puede decir por sí solo:** la razón detrás
de una decisión, una restricción no obvia, o un caso límite. Si lo único que hace es repetir en prosa lo
que el nombre de la variable, función o prop ya dice, no suma nada — bórralo.

**"Explica el porqué" no es un pase automático.** Un porqué puede seguir siendo redundante si ya se
infiere de la estructura del archivo — su nombre, sus props, o la existencia de otros archivos que lo
rodean. "Este componente es genérico para evitar lógica duplicada entre sus dos wrappers" es la
justificación de manual para cualquier extracción de componente compartido — si el nombre del archivo, sus
props sin nada específico de ningún caso de uso, y la existencia de esos wrappers ya cuentan esa historia,
repetirla en prosa no agrega nada. Preguntá no solo "¿explica el porqué?" sino "¿ese porqué ya era
inferible sin el comentario?".

**Si te cuesta escribirlo en una o dos líneas claras, la señal no es "necesito un comentario más largo" —
es que el código mismo es demasiado complicado y conviene simplificarlo primero** (Google eng-practices).
Un comentario largo casi nunca arregla un diseño confuso, solo lo documenta.

## Reglas, una vez que el comentario pasó el test

- **Explica el porqué, no el qué.** El código ya dice qué hace; el comentario existe para lo que el código
  no puede cargar solo — la razón, la restricción, el caso límite.
- **Usa palabras distintas a las del nombre.** Si el comentario es la prop/función/variable traducida a
  prosa, no agrega información — es ruido con forma de explicación.
- **No lo dupliques.** Si la misma razón ya está explicada donde vive el dato o la prop, no la repitas en
  cada lugar que la usa — una copia, no N que se pueden desincronizar.
- **En positivo, nunca en negativo.** Qué hace, qué extiende, dónde vive la lógica relacionada — nunca "no
  hace X". Decir qué no pasa no ayuda a entender qué sí pasa.
- **Sin números ni hechos que se pudren solos.** Si el valor puede cambiar sin que el comentario se
  entere, no lo hardcodees — describí la forma cualitativa ("catálogo chico" vs. "catálogo grande"), el
  valor exacto vive en el código o los datos.
- **Nunca cites un ID de decisión (D-001, T-003, UX-002).** Si la explicación no se sostiene sola sin la
  cita, todavía no explica nada — y si se sostiene sola, la cita no agrega nada. Trazabilidad hacia la
  decisión completa se resuelve con `git blame` o los docs de la misión, no desde el comentario.

## Ejemplos reales de este repo

❌ Cita sin explicar — encontrado en `server/db/seed/taxonomia.ts` antes de corregirse:

```ts
// Catálogo de referencia, cambia solo a mano (D-002).
```

Obliga a ir a buscar D-002 para entender qué significa que el catálogo "cambie a mano".

✅ La razón vive en la línea, sin cita:

```ts
// El campo `activa` se cambia a mano en la base, no desde la app — no hay panel de admin todavía, así
// que no hay ningún evento de escritura del que colgar una invalidación de caché al instante.
```

❌ Negativo + duplicado + con un número que ya estaba mal el día que se escribió — encontrado en
`CategoriaSelect.vue` (PR #57), aun después de una primera corrección:

```ts
// No reimplementa nada de la interacción (filtrado, apertura, selección) — eso vive una sola vez en
// CatalogSelect... (T-003)
//
// Categorías son solo 8 — mostrarlas todas al enfocar no es ruido, por eso showAllOnFocus (UX-002).
```

✅ Cero comentario en el wrapper — el prop `show-all-on-focus="true"` ya es el hecho, y la razón vive una
sola vez donde la prop se declara (`CatalogSelect.vue`), sin número exacto ni cita:

```ts
// Catálogo chico (categorías): mostrar todo al enfocar no cuesta nada. Catálogo grande (comunas): esperar
// a que se escriba, el patrón ya validado de Mercado Libre — mostrar todas las opciones de entrada es
// más ruido que ayuda.
```

❌ Explicación completa pero con relleno y una cita que no agregaba nada — encontrado en
`server/db/schema/categorias.ts`:

```ts
// slug es la clave primaria en vez de un uuid autogenerado: el catálogo es fijo y chico (8 filas), y
// el slug ya es único y estable por definición — un id sin significado encima solo obligaría a un
// join o un mapeo extra en cada lugar que ya conoce el nombre (T-001).
```

Tres problemas: "(8 filas)" es un número que se pudre (D-001 dice explícitamente que sumar categorías
después es esperado), "fijo y chico" y "por definición" son relleno que no agrega razón, y T-001 no
resolvía ningún matiz que la frase no dijera ya.

✅ La razón real en una frase, sin relleno ni cita:

```ts
// slug es la clave primaria: ya es el identificador natural y estable de la categoría, no hace falta
// inventar un uuid encima.
```

❌ Porqué correcto en forma, pero redundante con lo que la estructura de archivos ya dice — encontrado en
`CatalogSelect.vue`:

```ts
// CategoriaSelect y ComunaSelect necesitan exactamente el mismo comportamiento de selección — que viva
// una sola vez acá, en vez de copiado en cada wrapper, evita que con el tiempo terminen comportándose
// distinto sin que nadie lo note.
```

Pasa el test de "explica el porqué, no el qué" — y aun así sobra: el nombre del archivo (`CatalogSelect`,
no `CategoriaOComunaSelect`), sus props sin nada de categoría ni comuna, y la existencia de
`CategoriaSelect.vue`/`ComunaSelect.vue` ya cuentan que es un componente compartido. Es la razón esperable
de cualquier extracción de componente, no un insight de esta decisión puntual.

✅ Sin comentario — la estructura de archivos ya lo dice.

## Al revisar un comentario existente

Si estás editando un archivo y pasás por un comentario que no pasa el test o rompe alguna regla,
corregilo ahí mismo — no hace falta una tarea aparte, es parte de dejar el código mejor de como lo
encontraste.
