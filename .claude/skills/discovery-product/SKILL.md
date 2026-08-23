---
name: discovery-product
description: Investigación y documentación de producto para features nuevas en Datealo. Usar cuando iteres sobre `investigacion.md` o `producto.md` de una misión, explores un problema de usuario, investigues cómo lo resuelven otros marketplaces de servicios, o definas funcionalidades y alcance. También cuando alguien pregunte "¿cómo lo resuelven otros productos?", "¿qué evidencia tenemos para esto?" o "¿esto entra en el MVP?".
---

# Discovery de producto en Datealo

Este skill cubre dos documentos con naturalezas distintas:

- **`investigacion.md`** — se acumula, no se reescribe: evidencia, benchmarks, conclusiones y el ideal.
- **`producto.md`** — spec viva del resultado: funcionalidades JTBD, reglas, señales y decisiones de alcance.

Para flujos e interacción, ver `discovery-ux`. Para arquitectura y contratos, ver `discovery-engineering`.

El conocimiento del dominio vive en las misiones de `docs/missions/`, en `CLAUDE.md` y en el producto mismo
— es punto de partida, no restricción. Si la investigación indica que una entidad o un término tiene
problemas, la evidencia gana sobre el modelo actual.

## Qué es Datealo — el sesgo que filtra toda funcionalidad

Datealo es un buscador de profesionales de servicios: alguien tiene un problema concreto y necesita a la
persona correcta, cerca, hoy. Toda funcionalidad propuesta pasa por estos filtros antes de entrar a
`producto.md`:

- **El flujo core es sagrado.** buscar → resultados → perfil → contactar. Una funcionalidad que agrega un
  paso a ese camino necesita justificar por qué el resultado sin ella es peor, no solo por qué es útil.
- **La confianza se muestra, no se promete.** Verificación, reseñas de personas reales, fotos de trabajos
  hechos. Un badge sin respaldo verificable es peor que no tenerlo: transfiere a Datealo la culpa del mal
  servicio.
- **El contacto es directo y sin intermediación.** WhatsApp o teléfono, sin formularios de cotización, sin
  subastas, sin pago para desbloquear. Cualquier concepto que ponga a Datealo entre las dos personas
  necesita una decisión de producto explícita, no entra por conveniencia técnica.
- **Chileno y hablado.** El copy de la landing es la referencia de tono: "¿Alguien cacha un gasfiter
  bueno?" no es un chiste, es el lenguaje del usuario.

### El arranque en frío no es un detalle, es una restricción de diseño

Datealo es un marketplace de dos lados y está pre-lanzamiento: cero profesionales, cero reseñas, cero
búsquedas. Toda funcionalidad del lado buscador depende de que exista oferta del otro lado.

Por eso cada `F-xxx` declara **a qué lado sirve** y **qué necesita del otro lado para entregar su
resultado**. Y por eso el estado vacío no es un caso límite decorativo: para muchas búsquedas será el
estado principal durante meses.

Para decidir con qué categoría-comuna arrancar, cómo tratar al lado difícil (profesionales) frente al lado
fácil (clientes), y qué significa "suplir oferta manualmente" sin fingir actividad falsa, usar el skill
`cold-start-problem`.

```
❌ "F-004: filtrar resultados por rating mínimo, disponibilidad y rango de precio"
   (con 6 profesionales en una comuna, tres filtros combinados devuelven cero siempre)

✅ "F-004: ordenar resultados por cercanía, con el filtro de categoría como único corte.
   Los filtros por rating y precio entran cuando una categoría-comuna promedie 15+ perfiles
   (ver Fuera de alcance)."
```

La pregunta que corre este filtro: **¿esta funcionalidad sigue entregando su resultado con la oferta que
tenemos hoy?** Si la respuesta es no, la funcionalidad no está mal — está fuera de fase, y su fila va a
"Fuera de alcance" con la condición que la reabre.

### El test del concepto importado

Yelp, Thumbtack, Angi y Airbnb son marketplaces maduros: millones de perfiles, equipos de moderación,
años de datos de comportamiento. Sus soluciones asumen esa escala. Antes de aceptar un concepto de una de
esas fuentes:

1. ¿Funciona con la oferta y el volumen que Datealo tendrá el primer año? (no con el que quisiéramos)
2. ¿Quién lo opera? Un concepto que exige moderación humana continua no tiene quién lo sostenga hoy.
3. ¿Se puede explicar usando solo cosas que ya existen en Datealo?

Si explicarlo exige inventar pantallas, rituales o roles hipotéticos, el concepto aún no pertenece al
producto: registrarlo como hipótesis en "Fuera de alcance" con su condición de reconsideración.

## El vocabulario es una decisión de producto

El idioma canónico es el del usuario chileno, no el de las fuentes ni el del código. Un término nuevo entra
a los documentos solo definido y aprobado por el dueño de producto, registrado como decisión `D-xxx` en
`producto.md` — no en un glosario aislado. Producto, experiencia e ingeniería usan el mismo término.

```
❌ "El prestador de servicios recibe leads calificados en su bandeja"
   (jerga de marketplace — ninguna de esas tres palabras existe para un gasfiter)

✅ "El profesional recibe el mensaje directo del cliente por WhatsApp"
```

Términos semilla en uso hoy (landing y código), pendientes de confirmar como `D-xxx` en la primera misión
que los toque: **profesional** (no "prestador" ni "proveedor"), **buscador** o **cliente** para el otro
lado, **zona** y **comuna** para geografía, **reseña** (no "review" ni "valoración"), **categoría**,
**verificado**.

## Flujo y handoffs

```
investigacion.md → producto.md → experiencia.md → ingenieria.md
        ↑               ↑                ↑
        └───────────────┴────────────────┘  (loops de vuelta vía decisiones en producto.md)
```

**`investigacion.md` no se aprueba.** Es un registro que se acumula: informa al producto pero no lo
autoriza, y no bloquea nada. Está en buena forma cuando el problema tiene situación y consecuencia
concretas (no "falta confianza"), alguna conclusión respalda la dirección y el ideal describe capacidades
observables. El único documento que el dueño de producto aprueba es `producto.md`.

**Gate de `producto.md`** — está listo para `experiencia.md` cuando:

- cada funcionalidad tiene formato JTBD, reglas y al menos un caso límite definido
- cada funcionalidad enlaza una conclusión de `investigacion.md` y una señal de éxito
- cada funcionalidad declara su lado del marketplace y qué necesita del otro lado
- no hay decisiones de producto delegadas a diseño o ingeniería
- las decisiones propuestas tienen fecha límite en el README de la misión

**Aprobación:** Claude propone y marca `en revisión`; `vigente` lo otorga solo el dueño de producto. Toda
decisión `propuesta` lleva fecha límite — sin deadline es pocket veto.

**El producto puede decidir en contra de la evidencia, a propósito.** Investigar algo y hacer lo contrario
es una jugada válida: la evidencia informa, el dueño de producto decide. Cuando pase, la conclusión
afectada lleva una "Revisión (fecha)" que diga qué se decidió en contra, por qué y qué parte de ella
sobrevive — nunca se borra ni se reescribe para que calce. Sin esa marca, la próxima lectura la toma como
vigente y reabre lo ya decidido.

**Loop de vuelta:** si UX o ingeniería invalidan algo, el cambio entra primero como decisión `D-xxx` en
`producto.md`. Si además cambia la dirección, el ideal se actualiza en `investigacion.md` con la nueva
evidencia.

**Un documento a la vez:** se trabaja solo el documento en foco de la misión. Mientras `producto.md` está
en revisión, `experiencia.md` e `ingenieria.md` no se crean ni se actualizan "para mantenerlos alineados"
— se rehacen cuando el dueño de producto dé el paso explícito. El loop de vuelta sí es válido en cualquier
momento. Trabajo aguas abajo sobre definiciones en revisión queda obsoleto y se paga dos veces.

## La evidencia de un producto sin usuarios

Datealo no tiene datos de uso propios. La consecuencia práctica: **el benchmark es la evidencia más fácil
de conseguir y la más fácil de sobrevalorar.** Ver que Thumbtack hace X demuestra que Thumbtack hace X,
no que sus usuarios lo prefieran ni que a nosotros nos sirva.

Jerarquía de evidencia mientras no haya producto en producción:

| Tipo                                    | Qué demuestra                                   | Límite típico                        |
| --------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| Entrevista o conversación con un usuario| Cómo describe su problema y qué hizo la última vez | Lo que dice que haría ≠ lo que hará |
| Comportamiento observado fuera del producto | Que el problema existe (grupos de WhatsApp, Marketplace) | No dice si nuestra solución sirve |
| Benchmark de otro producto              | Qué trade-off eligió alguien con otra escala    | No transfiere a nuestro volumen      |
| Intuición del equipo                     | Nada. Es hipótesis                              | Se declara como tal o no se escribe  |

Para conseguir la primera fila de la tabla sin contaminarla con respuestas de cortesía, usar el skill
`mom-test` al preparar y correr la conversación: hablar de su vida y su comportamiento pasado, nunca de la
idea, y cerrar con un compromiso real en vez de un "me encantaría usarlo".

Toda `C-xxx` sostenida solo por benchmark lleva confianza `media` o `baja`, y su implicación se escribe
como "esto deberá ser cierto", no como "esto es así".

## Qué se ve concreto en Datealo

El objetivo es que cualquier persona pueda leer `producto.md` y saber exactamente qué construir. Si una
funcionalidad puede interpretarse de dos formas distintas, no está lista.

```
❌ Abstracto: "Datealo debe ofrecer resultados de búsqueda relevantes según la ubicación del usuario"

✅ Concreto: "El buscador ve los profesionales de la categoría ordenados por distancia a su ubicación.
   Si no dio permiso de ubicación, ve los de la comuna que eligió a mano, con el selector de comuna
   visible arriba de la lista. Si la comuna no tiene ninguno, ve los de las comunas vecinas
   marcados con su distancia, no un estado vacío."
```

La regla práctica: si la funcionalidad no describe quién hace qué, qué responde Datealo, y qué pasa en el
caso edge más probable (que acá casi siempre es "no hay resultados"), está incompleta.

### Prueba de lectura en frío

El documento se escribe en el lenguaje en que se lo explicarías en voz alta al dueño de producto — no en
registro de spec. Antes de presentar una sección, releerla preguntando: ¿esta frase necesitaría traducción
oral? Si sí, la traducción oral es la redacción correcta.

- El vocabulario del aparato del template (señal, umbral, guardrail, canónico) lleva su significado en la
  misma frase o no aparece en el cuerpo.
- Toda afirmación abstracta lleva su ejemplo con nombres, comunas y oficios reales en el mismo párrafo.
- Cuando el dueño de producto pregunta "¿qué significa esto?", la respuesta incluye reescribir el texto en
  el documento — la explicación que funcionó en la conversación es la redacción nueva, no un extra.

```
❌ "Señal: la tasa de conversión a contacto sobre sesiones con intención de búsqueda
   supera el umbral definido para la cohorte inicial."

✅ "Señal (qué observaríamos si funciona): de cada 10 personas que buscan una categoría
   y abren un perfil, al menos 3 tocan el botón de WhatsApp."
```

Antes de fijar una señal, usar el skill `lean-analytics` para distinguirla de una vanity metric: una señal
vale si es un ratio (no un total acumulado que solo sube) y si cambia lo que Datealo hace después. "500
profesionales registrados" no es una señal — "3 de 10 tocan WhatsApp" sí lo es.

### Cómo se redacta una decisión (D-xxx)

- **Título = la decisión en una frase que se entiende sola**, no una etiqueta abstracta.
  ❌ "Modelo de contacto y trazabilidad de la conversación"
  ✅ "El contacto sale de Datealo hacia WhatsApp y no vuelve"
- **"Alternativas descartadas"**, no "Alternativas" — el lector debe saber sin deducir que son opciones
  rechazadas, no cosas que el producto hace. Cada una con el porqué del rechazo en la misma línea.
- **La decisión abre con la afirmación directa**, incluidas las negaciones que el lector podría dudar ("no
  existe un chat interno"), y lleva su ejemplo con nombres reales en el mismo párrafo.
- **Si una decisión describe algo que el sistema hace solo bajo cierta condición**, nombrar la causa en la
  primera frase — que nunca se lea como comportamiento automático inexplicado.
- **Una decisión reemplazada se colapsa**: estado, "Qué decía, en corto" (3-5 líneas: qué decía, por qué
  murió, qué sobrevive y dónde), y nada más — el detalle vive en el historial de git.
- **Los cambios posteriores entran como "Revisión (fecha)"** al final, en el mismo lenguaje llano,
  enlazando la decisión que los produjo.

### Los IDs son permanentes y viven en su lugar

Todo ID de una misión (E, C, D, F, M, CL, Q) es permanente. Cuando algo muere no se borra de su lista ni
migra a una sección de cerrados al final: se colapsa en su lugar, en orden, con su estado y el porqué. Un
ID retirado no se reutiliza nunca.

- Si el ítem vive en prosa (una decisión), se colapsa donde está, con su estado en la primera línea.
- Si vive en una tabla, conserva su fila con el estado. Si son pocos y la tabla no tiene columna de estado,
  basta una línea bajo la tabla que los nombre con su motivo y su decisión.

Si la lista salta de CL-007 a CL-009, el lector no puede distinguir un caso retirado de un error, y tiene
que reconstruir el conjunto desde dos lugares.

### Cómo se registran las preguntas (Q-xxx)

La forma literal de la tabla vive en [`docs/missions/template/producto.md`](../../../docs/missions/template/producto.md);
lo que sigue es el porqué y las trampas. Todas las preguntas viven en **una sola tabla ordenada por ID**,
abiertas y cerradas juntas, con la respuesta a la vista.

- **El estado distingue tres cosas:** `abierta`, `resuelta AAAA-MM-DD` (alguien la respondió) y
  `disuelta AAAA-MM-DD` (el producto cambió y la pregunta dejó de tener sentido). Colapsar resuelta y
  disuelta en un solo "cerrada" borra lo más útil para el lector futuro.
- **La última columna contiene la respuesta, no un puntero.** Cerrada: qué se respondió y con qué decisión.
  Abierta: quién la resuelve, con qué método, qué bloquea mientras tanto y su fecha límite.
- **Solo las abiertas llevan bloque de detalle** debajo de la tabla, con "La duda, con un ejemplo" (el caso
  concreto que muestra por qué hay dos respuestas posibles), "Afecta a", "Cómo se resolverá" y "¿Bloquea
  algo?". La fila sola comprime justo el contexto que hace entendible la duda.
- **Antes de la tabla, una frase responde "¿qué falta?"** nombrando la pregunta que bloquea y qué bloquea.

## Trazabilidad entre los dos documentos

```
investigacion.md:  E-001 evidencia → C-001 conclusión → ideal
producto.md:       D-001 decisión → F-001 funcionalidad → M-001 señal de éxito
                   (D y F enlazan a C-xxx de investigacion.md)
```

Toda funcionalidad necesita al menos una conclusión y una señal. Sin esa cadena es una apuesta sin validar
— presentarla como tal.

## Formato JTBD para funcionalidades

Cada funcionalidad se escribe primero desde el resultado del usuario (working backwards), luego las reglas
y casos límite.

```
Cuando [usuario en contexto concreto],
quiero [acción],
para [resultado observable].

Reglas:
- Si [condición], Datealo [comportamiento].
- Si [caso límite], Datealo [comportamiento seguro].
```

```
✅ F-001: Cuando se me tapa el desagüe un domingo y no conozco ningún gasfiter,
          quiero ver quiénes trabajan hoy cerca de mi casa,
          para llamar a uno sin tener que preguntar en el grupo del edificio.
          Reglas:
          - Si el profesional marcó que atiende fines de semana, aparece con la etiqueta "Atiende hoy".
          - Si ninguno de la comuna atiende hoy, la lista muestra los de comunas vecinas
            con su distancia, antes que los de la comuna que no atienden.
          - Datealo nunca muestra un teléfono sin que el profesional lo haya verificado.

❌ F-001: "Búsqueda de profesionales con filtro de disponibilidad"
          (no describe quién, en qué contexto, ni qué pasa cuando no hay nadie)
```

Para profundizar un `F-xxx` dudoso, usar el skill `jobs-to-be-done`: separar la dimensión funcional (llamar
a alguien hoy) de la emocional (dejar de angustiarse) y la social (no depender del grupo del edificio), y
recordar que la competencia real de Datealo no es otro marketplace — es "no hacer nada" o resolverlo con el
vecino.

## Cómo estructurar la investigación

1. Describir el problema con situación + acción + respuesta actual + consecuencia.
2. Formular las preguntas que pueden cambiar el ideal o el alcance (solo esas).
3. Investigar cómo otros productos resuelven el mismo problema, y con qué escala lo asumen.
4. Registrar cada hallazgo como evidencia con su límite antes de concluir.
5. Derivar conclusiones y recién entonces escribir el ideal.

Una investigación extensa que no concluye qué cambia en el producto es un antipatrón. La evidencia debe
llevar a conclusiones, las conclusiones a decisiones, las decisiones a funcionalidades.

## Herramientas de referencia

Antes de proponer una solución, investigar cómo la resuelven productos con usuarios o restricciones
similares. La referencia es para entender trade-offs, no para copiar — y siempre pasa por el test del
concepto importado.

**Marketplaces de servicios a domicilio** — el análogo más directo:

| Producto             | Qué observar                                                                    |
| -------------------- | ------------------------------------------------------------------------------- |
| **Thumbtack**        | Matching por solicitud, cómo presenta precio estimado y por qué cobra al pro    |
| **Angi (HomeAdvisor)** | Categorización de oficios, verificación de background, páginas por ciudad     |
| **TaskRabbit**       | Selección directa del profesional, disponibilidad por franja horaria            |
| **Yelp**             | Perfil de negocio local, jerarquía de la card de resultado, sistema de reseñas  |

**Descubrimiento local y búsqueda geográfica**:

| Producto             | Qué observar                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| **Google Maps**      | Búsqueda + mapa + lista, permiso de ubicación, cómo degrada sin él          |
| **Airbnb**           | Card con foto + rating + precio, filtros progresivos, estados vacíos        |
| **Booksy**           | Reserva de servicios personales, perfil de profesional individual           |
| **Doctoralia**       | Perfil profesional verificado, reseñas moderadas, SEO por especialidad+ciudad |

**Confianza y reputación** — el problema central de Datealo:

| Producto             | Qué observar                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| **Airbnb**           | Reseñas de doble lado, qué se publica y cuándo                              |
| **Yelp**             | Filtro de reseñas no recomendadas, respuesta del negocio                    |
| **Mercado Libre**    | Reputación acumulada visible, contexto latinoamericano y de confianza baja  |

Para el mercado chileno, el punto de comparación honesto no es Yelp: es el grupo de WhatsApp del edificio,
Marketplace de Facebook y la recomendación de un vecino. Ese es el sustituto real, y es contra ese
estándar que una funcionalidad tiene que ganar.

Cuando haga falta explicar contra qué compite Datealo o por qué alguien lo elegiría sobre su alternativa
actual, usar el skill `obviously-awesome`: partir siempre de la alternativa real del usuario (el grupo de
WhatsApp, no Yelp), no de una categoría de mercado abstracta.

## El ideal vive en investigación; el recorte, en producto

El ideal es el producto de la investigación: la dirección que la evidencia sostiene, sin restricciones de
implementación. Vive al final de `investigacion.md`. El recorte de alcance es una decisión de producto y
vive en `producto.md` con su trade-off explícito.

```
✅ investigacion.md: "cualquier persona encuentra en menos de un minuto un profesional
   disponible, verificado y cerca, para cualquier oficio" (ideal, sin recortar)
✅ producto.md: "esta entrega cubre 6 categorías en 4 comunas de Santiago con contacto por
   WhatsApp; se posterga el sistema de reseñas porque sin volumen de servicios completados
   una reseña sola distorsiona más de lo que informa"

❌ "El MVP no tiene reseñas porque implementarlas es complejo"
   (límite técnico disfrazado de decisión de producto)
```

Una limitación de implementación puede influir en el recorte, pero no debe presentarse como necesidad de
producto.
