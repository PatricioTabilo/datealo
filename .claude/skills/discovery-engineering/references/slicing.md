# Slicing: del diseño a tareas atómicas

Convierte un `ingenieria.md` cerrado en un plan de construcción: una lista ordenada de slices donde cada
slice es un cambio funcional atómico — un Issue, un PR (el flujo de `CLAUDE.md`). El plan vive en la
sección "Plan de construcción" de `ingenieria.md`; los issues se crean desde ahí cuando el usuario lo pida.

## Contenido

- [Cuándo cortar](#cuándo-cortar)
- [Cómo encontrar los slices](#cómo-encontrar-los-slices)
- [Qué eje de corte usar](#qué-eje-de-corte-usar)
- [Cortar un reemplazo de código vivo](#cortar-un-reemplazo-de-código-vivo)
- [Qué hace atómico a un slice](#qué-hace-atómico-a-un-slice)
- [Lo que la arquitectura obliga a cortar junto](#lo-que-la-arquitectura-obliga-a-cortar-junto)
- [Trazabilidad para detectar obsolescencia](#trazabilidad-para-detectar-obsolescencia)
- [Validar antes de crear la tarjeta](#validar-antes-de-crear-la-tarjeta)
- [Ejemplo](#ejemplo)
- [Orden y dependencias](#orden-y-dependencias)

## Cuándo cortar

Cortar recién cuando el gate de salida se cumple y las preguntas que bloquean construcción están resueltas.
Slicing sobre decisiones abiertas produce issues que mueren: un cambio de modelo posterior no invalida un
issue, invalida la tanda completa, y hay que redactarla dos veces.

## Cómo encontrar los slices

Los slices se derivan de las **costuras del diseño** — los lugares donde el sistema ya está partido y por
lo tanto se puede construir y verificar una parte sin la otra:

| Costura                                          | Slice candidato                                                 |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Cada `TC-xxx` de Contratos                       | Su entrada/salida ya está definida: se implementa y testea sola |
| Cada tabla nueva                                 | El schema, su policy y la verificación que la hace valer (ver abajo) |
| Cada capa (función pura → endpoint → composable → componente) | El comportamiento de esa capa con las demás simuladas |
| Cada paso de un cambio de datos                  | Un paso del expand/contract, nunca la migración completa        |

El procedimiento: enumerar las costuras, y para cada candidato preguntar *"¿esto se puede mergear solo,
dejando el sistema consistente?"*. Si sí, es un slice. Si no, le falta un predecesor — y ese predecesor es
otro slice que todavía no estaba en la lista.

La lista de funcionalidades es la fuente equivocada: una `F-xxx` es una unidad de valor para el usuario y
un slice es una unidad de cambio para el código, y casi nunca coinciden. Un slice por funcionalidad produce
issues-feature imposibles de revisar.

## Qué eje de corte usar

La pregunta que decide el eje es **dónde está la incertidumbre**, no qué es más ordenado:

- **Riesgo en el algoritmo o las reglas** (ranking, cálculo de distancia, agregación de rating) → cortar
  **horizontal** sobre la lógica pura: cada slice es una capacidad, verificable sin base de datos ni
  servidor. Costo aceptado: los primeros slices no entregan nada visible, así que el plan **debe nombrar
  explícitamente el slice de integración** que los expone.
- **Riesgo en la integración** (¿el contrato aguanta?, ¿funciona punta a punta?, ¿la query rinde?) → cortar
  **vertical**: primero un *walking skeleton*, el camino más delgado que atraviesa todas las capas con el
  caso más trivial, y engrosarlo después.

```markdown
Walking skeleton de la búsqueda (el riesgo está en la integración, no en el ranking):

S-001 "Listar los profesionales de una categoría en una comuna, sin orden ni filtros"
      Atraviesa endpoint → composable → lista de cards con el caso más simple.
      Acepta: una comuna con 3 perfiles activos devuelve 3 cards con nombre y oficio;
      una comuna sin perfiles muestra el estado vacío de UXF-001.

Los slices siguientes engrosan ese esqueleto —orden por distancia, filtros, mapa— sin
volver a tocar el contrato entre capas, que quedó probado en el primero.
```

En Datealo, con producto nuevo y pocas capas construidas, el default es **vertical**: casi todo el riesgo
está en que el camino completo exista, no en un cálculo. El corte horizontal aparece cuando la misión trae
un motor propio (ranking geográfico, reglas de verificación).

**Señal de que elegiste mal el eje:** seis slices mergeados y todavía no hay nada que se pueda probar en la
aplicación.

## Cortar un reemplazo de código vivo

Reemplazar código que ya está desplegado se corta como **convivencia**: el reemplazo nace al lado de lo
viejo, ambos coexisten, y la sustitución ocurre al final. Un slice "reemplazar X" no deja verde nunca.

```markdown
Reemplazar el filtrado en cliente por búsqueda en servidor (Branch by Abstraction):

S-001 Introducir la interfaz `SearchProvider` sobre el comportamiento actual, sin cambiarlo.
      Acepta: mismos resultados que hoy en todos los casos existentes.
S-002..N Implementar el provider de servidor detrás de la misma interfaz, sin conectarlo.
      Acepta: el provider nuevo pasa sus propios tests; la app sigue usando el viejo.
S-N+1 Conmutar el consumidor al provider nuevo.
      Acepta: el flujo UXF-001 completo funciona contra el provider nuevo.
S-N+2 Borrar el provider viejo y su código muerto.
      Acepta: no quedan imports ni utilidades del filtrado en cliente.
```

Para cambios de datos, la misma lógica en pasos (*expand/contract*): agregar los campos nuevos → escribir
en ambos → backfill de lo existente → leer del nuevo → borrar el viejo. Cada paso es un slice; "migrar el
campo" como slice único deja el sistema inconsistente a mitad de camino. En Supabase, cada paso lleva su
revisión de RLS: una columna nueva que participa de una policy cambia el paso, no solo el schema.

**El slice de borrado es obligatorio y entra al plan desde el principio.** Sin un issue propio no ocurre:
el código viejo queda vivo y aparece meses después como deuda que nadie recuerda.

## Qué hace atómico a un slice

Un slice está bien cortado cuando un modelo simple puede ejecutarlo sin haber leído la misión:

- **Pass/fail sin juicio:** los criterios de aceptación se pueden enumerar como tests concretos. "El
  endpoint valida la entrada" es verificable; "el endpoint es robusto" no. Este es el filtro que de verdad
  descarta un slice mal cortado — si no puedes escribir sus criterios, no está cortado.
- **Autocontenido:** el issue lleva su contrato inline — entrada, salida, invariantes y ejemplos de
  aceptación copiados o resumidos, no solo enlazados. El enlace a `F-xxx`/`D-xxx`/`TC-xxx` es para
  trazabilidad, no para que el ejecutor reconstruya contexto.
- **Dentro de un límite claro:** un slice vive en una capa y un dominio. Si necesita cruzar —el endpoint
  necesita una tabla que no existe—, el cruce es su propio slice y va antes.
- **Sin decisiones pendientes:** si al ejecutarlo habría que decidir algo que no está escrito en la misión,
  el slice es prematuro o el diseño está incompleto — volver al documento, no decidir en el PR. Esto
  incluye verificar cómo funciona una librería o API externa que el slice asume: si el criterio de
  aceptación depende de un mecanismo concreto (¿esta librería necesita una escala de colores completa o un
  valor plano? ¿el override va en config o en una variable de runtime?), esa verificación se hace al
  escribir `ingenieria.md` y su resultado queda en una receta del skill `arquitectura` — no se investiga
  por primera vez a mitad de la ejecución, porque ahí un hallazgo incómodo invalida trabajo ya empezado en
  vez de solo una fila del documento.
- **Deja verde:** cada slice mergeado deja `npx nuxi typecheck` y `npm run build` pasando, y el sistema
  consistente. Un slice que necesita "el que sigue" para no romper es un slice mal cortado.
- **Respeta los umbrales de salud:** si el slice empuja un componente o composable a zona roja, la
  extracción es parte del slice, no un issue aparte (ver el skill `vue-composition`).
- **Una frase sin "y":** señal débil, útil solo como primer descarte. "implementar la búsqueda de
  profesionales" es una frase sin conjunciones y aun así son semanas — la abstracción esconde el alcance.
  Si la frase pasa pero los criterios no son enumerables, gana el criterio.

## Lo que la arquitectura obliga a cortar junto

Las decisiones del skill `arquitectura` no solo dicen cómo construir: cambian dónde **no** se puede cortar.
Un slice que deja el sistema inseguro a mitad de camino está mal cortado aunque compile y aunque su frase
no lleve "y".

**Una tabla con datos de usuario entra con su verificación, no después.** Por A-002 la policy RLS no corre
en la conexión de Drizzle, así que el slice tiene que incluir los tres pedazos: schema, policy y la
verificación de pertenencia en el endpoint que la expone.

```markdown
❌ S-004 "Crear la tabla professional_service_areas con su policy de escritura del dueño"
   S-007 "Verificar pertenencia al editar zonas de atención"
   — entre el merge de S-004 y el de S-007, cualquiera edita las zonas de cualquiera.
     La policy existe y no corre. El hueco vive en main tres PRs.

✅ S-004 "Permitir que un profesional edite sus zonas de atención, solo las suyas"
   Acepta: el dueño actualiza y recibe 200; otro usuario autenticado recibe 403;
   un anónimo recibe 401; la policy existe en rls.sql.
```

Eso no colapsa toda la tabla en un slice gigante. Si la tabla se lee público antes de poder escribirse, el
slice de lectura va solo y el de escritura trae su verificación cuando llega.

**Dos cortes más que vienen de la arquitectura:**

- **La primera misión que toque datos necesita un slice de fundación antes que cualquier endpoint**: el
  cliente de `server/utils/db.ts`, la conexión por el pooler con `prepare: false` y el `runtimeConfig`. Sin
  eso el segundo slice no puede dejar verde.
- **Las capas de A-001 son las costuras naturales** — función pura en `server/utils/` → endpoint →
  composable → componente. Cortar sobre ellas sale gratis porque el diseño ya está partido ahí.

## Trazabilidad para detectar obsolescencia

Cada issue nombra las decisiones (`D-xxx`, `T-xxx`) que lo sustentan. El porqué: cuando una decisión
cambia, buscar esa etiqueta en los issues abiertos entrega la lista exacta de tareas a reescribir o cerrar
— sin eso, la auditoría es releer todo el backlog contra toda la misión.

Esa trazabilidad depende por completo de que el texto quede bien escrito en el issue. Nada en GitHub la
verifica — por eso el paso siguiente es obligatorio, no opcional, cada vez que se crean tarjetas.

## Validar antes de crear la tarjeta

Este chequeo corre solo, como parte de crear los issues desde el "Plan de construcción" — no es una
auditoría aparte que alguien pide después. Se hace en dos momentos: antes de abrir cada tarjeta, y una vez
al final del lote.

**Antes de abrir cada tarjeta**, por cada fila `S-xxx` del plan:

- La columna "Sustento" no está vacía y cada ID que lista (`D-xxx`, `TC-xxx`, `F-xxx`) existe de verdad en
  `producto.md` o `ingenieria.md` — no es un ID inventado ni uno que se retiró sin que el slice se haya
  actualizado.
- Ningún ID de sustento apunta a una decisión en estado `reemplazada` o `descartada`. Si eso pasa, el
  slice quedó desactualizado respecto al documento — se corrige el sustento antes de crear la tarjeta, no
  después.
- El cuerpo del issue **copia** la línea de sustento tal cual ("Sustento: TC-002, D-003"), no solo enlaza
  a la misión. Es lo que hace que buscar "D-003" en GitHub encuentre esta tarjeta más adelante.
- Los labels `type:*` y `scope:*` que le corresponden ya existen en el repo. Si no existen, se crean antes
  de asignarlos — no se abre el issue sin label y "se etiqueta después".

**Al terminar el lote**, antes de darlo por cerrado:

- Cada fila del Plan de construcción tiene su número de issue anotado — ningún slice quedó cortado en el
  documento sin su tarjeta correspondiente.
- Se repasa la lista de issues recién creados y se confirma que todos llevan su línea de sustento, no solo
  los primeros.

Si algo de esto falla, se corrige antes de seguir — un lote de tarjetas sin trazabilidad limpia es el
mismo problema que describe la sección anterior, solo que recién creado.

## Ejemplo

```markdown
❌ Un issue-feature:
"feat(app): implementar búsqueda de profesionales con filtros y mapa"
— 8 bullets de alcance, 6 criterios, 3 dependencias.
Mezcla schema, endpoint, ranking, lista, mapa y estados vacíos: semanas de trabajo,
PR imposible de revisar, y cualquier cambio de modelo lo invalida entero.

✅ Slices del mismo trabajo (cada uno un Issue → un PR):
S-001 "Crear la tabla professional_service_areas con su policy de lectura pública"
Sustento: TC-002, D-003. Acepta: un profesional con dos comunas devuelve dos filas;
un usuario anónimo puede leerlas; solo el dueño puede insertarlas.
S-002 "Devolver los profesionales activos de una categoría y comuna, sin orden"
Sustento: TC-001. Acepta: categoría con 3 perfiles activos y 1 inactivo devuelve 3;
comuna sin perfiles devuelve `{ results: [], nextCursor: null }`, no un 404.
S-003 "Ordenar los resultados por distancia cuando la petición trae coordenadas"
Sustento: TC-001, D-004. Acepta: con origen en Ñuñoa, el de Ñuñoa va antes que el de
Maipú; sin coordenadas, `distanceKm` es null y el orden cae a rating.
```

## Orden y dependencias

Los slices se ordenan para que cada uno construya sobre lo ya mergeado. Las dependencias se declaran en el
issue ("requiere S-002") solo cuando son reales; una cadena lineal artificial serializa trabajo que podía
avanzar en paralelo.

**Entre dos slices sin dependencia entre sí, va antes el que puede invalidar el diseño.** Un slice que
demuestra que el modelo no aguanta cuesta un PR si va primero, y seis PRs botados si va séptimo. El orden
lo fija el riesgo, no la comodidad de construir lo fácil primero.

Un riesgo `TR-xxx` que no se puede cerrar con un slice entregable se corta como **spike acotado**:
pregunta, límite de tiempo y resultado capaz de cerrar la incertidumbre. Va en el plan marcado como no
entregable y su resultado vuelve a la tabla de riesgos de `ingenieria.md` — el código de un spike no se
mergea.
