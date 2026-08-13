# Misión: <nombre> — Producto

**Estado:** borrador

**Última actualización:** AAAA-MM-DD

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento es la spec viva del resultado: qué construimos ahora y bajo qué reglas. El porqué vive en
investigacion.md — aquí solo se enlaza. Se reescribe cuando el alcance cambia; no acumula historia.

Gate de salida — producto.md está listo para experiencia.md cuando:
- cada funcionalidad tiene formato JTBD, reglas y al menos un caso límite con comportamiento definido
- cada funcionalidad enlaza una conclusión de investigacion.md y una señal de éxito
- cada funcionalidad declara a qué lado del marketplace sirve, y qué necesita del otro lado para funcionar
- no hay decisiones de producto delegadas a diseño o ingeniería
- las decisiones propuestas tienen fecha límite en el README
-->

## Qué construimos: <resultado en una frase>

<!--
El recorte vigente del ideal y por qué sigue entregando el resultado central. Máximo cuatro párrafos
cortos. El ideal completo vive en investigacion.md.
-->

**Resultado:** <qué podrá lograr una persona al finalizar esta entrega>.

**Recorte respecto del ideal:** <qué dimensión se reduce y por qué sigue siendo suficiente>
(ver [el ideal](./investigacion.md)).

**Restricciones aceptadas:** <plataforma, cobertura geográfica, categorías, volumen inicial de
profesionales>.

## Funcionalidades

| ID    | Funcionalidad                  | Lado         | Sustento     | Éxito |
| ----- | ------------------------------ | ------------ | ------------ | ----- |
| F-001 | <verbo + resultado observable> | buscador     | C-001, D-001 | M-001 |

<a id="f-001"></a>

### F-001 — <verbo + resultado observable>

<!--
Duplica este bloque por funcionalidad. Se escribe desde el resultado del usuario (working backwards):
primero el JTBD, después las reglas. Si la respuesta de Datealo no se puede describir sin hablar de tablas
o componentes, falta cerrar la decisión de producto.
-->

Cuando <usuario en contexto concreto>,
quiero <acción>,
para <resultado observable>.

**Lado del marketplace:** buscador, profesional o ambos. **Qué necesita del otro lado:** <volumen mínimo
de perfiles, reseñas o cobertura sin el cual esta funcionalidad no entrega su resultado>.

**Sustento:** [C-001](./investigacion.md#c-001) y [D-001](#d-001). **Éxito:** [M-001](#m-001).

**Reglas:**

- Si <condición>, Datealo <comportamiento esperado>.
- Si <caso límite>, Datealo <comportamiento seguro y qué información muestra>.
- Datealo nunca <comportamiento que rompería el significado o la confianza>.

**Ejemplo verificable:** dado <estado con datos concretos>, cuando <acción>, entonces <resultado
observable>.

**No incluye:** <variante del ideal excluida de esta funcionalidad>.

**Experiencia:** <enlace a UXF-xxx cuando exista>. **Ingeniería:** <enlace a T-xxx cuando exista>.

## Casos límite que cruzan funcionalidades

<!--
Solo condiciones que afectan varias funcionalidades. Las propias de una viven en su bloque. Un caso
retirado no se borra ni se reutiliza: conserva su fila, o se nombra con su motivo en una línea debajo.

Los casos límite propios de un marketplace pre-lanzamiento aparecen acá: cero resultados en una comuna,
un profesional sin reseñas, una categoría con un solo perfil, un perfil sin verificar.
-->

| ID     | Condición concreta     | Comportamiento esperado | Funcionalidades |
| ------ | ---------------------- | ----------------------- | --------------- |
| CL-001 | <estado o combinación> | <qué hace Datealo>      | F-001           |

## Fuera de alcance

<!-- Distingue postergado de descartado y qué condición justificaría reabrirlo. -->

| Capacidad o caso      | Estado                  | Razón del recorte | Condición para reconsiderar |
| --------------------- | ----------------------- | ----------------- | --------------------------- |
| <capacidad del ideal> | postergada o descartada | <trade-off>       | <evidencia o hito>          |

## Señales de éxito

<a id="m-001"></a>

### M-001 — <señal que demuestra el resultado>

- **Pregunta:** ¿<qué queremos comprobar>?
- **Señal:** <comportamiento o resultado observable>.
- **Método y umbral:** <instrumentación o revisión, qué resultado, en qué población y ventana>.
- **Guardrail:** <daño que no debe aumentar para conseguir la señal>.

## Decisiones de producto

<!--
Solo decisiones con alternativas reales. No borres decisiones reemplazadas: explican por qué el producto
es como es. Toda decisión propuesta se refleja en el README con fecha límite.
-->

<a id="d-001"></a>

### D-001 — <decisión en una frase que se entiende sola>

- **Estado:** propuesta, aceptada, reemplazada o descartada. **Fecha:** AAAA-MM-DD.
- **Sustento:** [C-001](./investigacion.md#c-001).
- **Tensión:** <criterios que no podían maximizarse al mismo tiempo>.
- **Alternativas descartadas:** <opciones y razón concreta del rechazo, en la misma línea>.
- **Decisión y consecuencia:** <qué se hará y qué habilita, limita o exige revisar en UX e ingeniería>.
- **Reapertura:** <evidencia o cambio que justificaría revisarla>.

## Preguntas

<!--
Solo preguntas que pueden cambiar una decisión o funcionalidad. Lo demás va a un issue.
Todas viven en esta tabla ordenada por ID, abiertas y cerradas juntas. Ningún ID se borra ni se reutiliza.
Estado: abierta | resuelta AAAA-MM-DD (alguien la respondió) | disuelta AAAA-MM-DD (el producto cambió y la
pregunta dejó de tener sentido). Solo las abiertas llevan bloque de detalle debajo de la tabla.
-->

<Una frase que responde "¿qué falta?": la pregunta que bloquea y qué bloquea.>

| ID    | La duda                | Estado              | Respuesta, o quién la resuelve                                  |
| ----- | ---------------------- | ------------------- | --------------------------------------------------------------- |
| Q-001 | <la duda en una frase> | abierta             | <quién la resuelve, con qué método, qué bloquea y hasta cuándo> |
| Q-002 | <la duda en una frase> | resuelta AAAA-MM-DD | <qué se respondió, enlazando la decisión que la cerró>          |

<a id="q-001"></a>

### Q-001 — <la pregunta en una frase que se entiende sola>

- **La duda, con un ejemplo:** <el caso concreto que muestra por qué hay dos respuestas posibles>.
- **Afecta a:** D-001 o F-001.
- **Cómo se resolverá:** <quién y con qué método>.
- **¿Bloquea algo?:** <qué bloquea y su fecha límite, o no>.
