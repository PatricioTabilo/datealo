# Misión: <nombre> — Investigación

**Estado:** activo

**Última actualización:** AAAA-MM-DD

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento se acumula: la evidencia y las conclusiones no se borran cuando el alcance cambia, porque
explican por qué el producto es como es. Lo que sí se actualiza es el ideal, que resume la dirección que
la investigación sostiene hoy.

Gate de salida — la investigación sostiene un producto.md cuando:
- el problema tiene situación y consecuencia concretas, no una categoría abstracta
- al menos una conclusión con confianza alta o media respalda la dirección
- el ideal describe capacidades observables, no intenciones
-->

## El problema aparece cuando <historia concreta>

<!--
Una situación real o reconstruida con precisión. No abras con una categoría como "falta de confianza" —
abre con quién estaba haciendo qué y qué salió mal. Nombra a la persona y el servicio concreto.
-->

**Situación:** <qué está ocurriendo antes del problema>.

**Acción o necesidad:** <qué se intenta resolver o decidir>.

**Respuesta actual:** <qué hace hoy la persona: grupo de WhatsApp, Google, recomendación de un vecino,
Datealo si ya existe la superficie>.

**Consecuencia:** <error, demora, riesgo o decisión que no puede tomarse>.

## Preguntas que la investigación debe resolver

<!--
Solo preguntas capaces de cambiar el ideal o una decisión. Al resolver una, moverla a evidencia o
conclusión. No es un backlog.
-->

- ¿<pregunta y decisión que depende de ella>?

## Evidencia

<!--
Un hecho verificable con fuente y límite. Prioriza observación directa, entrevistas y comportamiento
comprobado. Los benchmarks de otros productos también son evidencia: qué hacen, qué trade-off eligieron y
qué no aplica a Datealo.

Datealo no tiene datos de uso propios todavía. Cuando la única evidencia disponible sea un benchmark o
una entrevista, la columna "límite" es lo que impide que se lea como dato duro.
-->

| ID    | Tipo                                              | Fuente                | Hecho verificable | Límite de la evidencia |
| ----- | ------------------------------------------------- | --------------------- | ----------------- | ---------------------- |
| E-001 | <entrevista, benchmark, uso, código, observación> | <enlace o referencia> | <hecho>           | <qué no demuestra>     |

<a id="e-001"></a>

### E-001 — <fuente o hecho en una frase>

<!--
Desarrollar solo cuando la tabla no alcanza para evaluar la calidad de la evidencia. Cierra con la
consecuencia para la investigación.
-->

<Observación precisa y contexto necesario.>

Esto permite afirmar <alcance>, pero no demuestra <límite>.

## Conclusiones

<!--
Una conclusión interpreta evidencia; no es una preferencia ni una funcionalidad. El título expresa el
hallazgo, no el tema.
-->

<a id="c-001"></a>

### C-001 — <conclusión en una frase>

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** <por qué la evidencia conduce a esta lectura y no a otra>.
- **Implicación:** <qué deberá ser cierto en el producto o qué alternativa queda debilitada>.
- **Confianza:** <alta, media o baja> porque <razón o validación pendiente>.

## El ideal: <resultado completo, sin recortar>

<!--
El ideal es el producto de la investigación: la dirección que la evidencia sostiene, sin restricciones de
implementación. El recorte a la primera entrega no vive aquí — vive en producto.md como decisión de
alcance. Esta sección sí se reescribe cuando nueva evidencia cambia la dirección.
-->

### El resultado ideal se ve así

<Narra de principio a fin una situación futura con datos concretos: nombres, comunas, oficios, horarios.
Qué acción ocurre, qué responde Datealo, qué decisión puede tomar la persona. Evita "una experiencia
simple" sin comportamiento observable.>

### Capacidades del ideal

| Capacidad | Acción habilitada    | Respuesta esperada              | Conclusión que la justifica |
| --------- | -------------------- | ------------------------------- | --------------------------- |
| <nombre>  | <qué se puede hacer> | <qué produce o explica Datealo> | [C-001](#c-001)             |

### El ideal no significa <confusión probable>

- <límite conceptual que evita una interpretación incorrecta>.

## Referencias

<!-- Fuentes primarias citadas por las evidencias. El enlace no sustituye el hecho y el límite en E-xxx. -->

- [<título descriptivo>](URL): usado en E-001 para <afirmación concreta>.
