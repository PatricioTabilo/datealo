# Misión: foto de perfil de profesional — Producto

**Estado:** vigente — aprobado por Patricio el 2026-08-31

**Última actualización:** 2026-08-31

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: el profesional puede subir una foto de su cara, distinta de sus fotos de trabajo

**Resultado:** un profesional que quiere mostrar su cara puede subirla al completar o editar su perfil
(misión 04); si lo hace, esa foto reemplaza el círculo de iniciales en resultados (misión 06) y en su
perfil público (misión 05). Un profesional que no la sube sigue viéndose exactamente igual que hoy.

**Recorte respecto del ideal:** el ideal (ver [investigación](./investigacion.md)) no impone ningún límite
adicional — esta entrega ya lo cubre completo. Lo único que queda fuera es lo que el ideal explícitamente
no incluye: recorte de imagen y verificación de que la foto muestre una cara real.

**Restricciones aceptadas:** la foto se sube tal cual, sin editor de recorte dentro de Datealo — mismo
patrón que las fotos de trabajo de la misión 04. Es opcional en todo momento; nunca bloquea completar o
publicar un perfil.

## Funcionalidades

| ID    | Funcionalidad                                        | Lado         | Sustento     | Éxito |
| ----- | ------------------------------------------------------ | ------------ | ------------ | ----- |
| F-001 | El profesional sube una foto de su cara                | profesional  | C-001        | M-001 |
| F-002 | El buscador ve esa foto en vez del círculo de iniciales | buscador     | C-002        | M-001 |

<a id="f-001"></a>

### F-001 — El profesional sube una foto de su cara

Cuando termino de cargar las fotos de mis trabajos al completar mi perfil (misión 04),
quiero subir además una foto mía,
para que quien me busque me reconozca antes de escribirme.

**Lado del marketplace:** profesional. **Qué necesita del otro lado:** nada — no depende de que exista
ningún buscador todavía; es una acción que el profesional hace sola en su perfil.

**Sustento:** [C-001](./investigacion.md#c-001). **Éxito:** [M-001](#m-001).

**Reglas:**

- La foto de perfil es un campo separado de `photoPaths` (fotos de trabajo) — nunca se completa
  automáticamente con ninguna de ellas, ni el profesional puede marcar una foto de trabajo existente como
  su foto de perfil: son dos campos con dos propósitos distintos.
- Es opcional en todo momento. Un profesional sin foto de perfil sigue teniendo un perfil válido y
  publicado, exactamente como hoy.
- Si el profesional borra la foto de perfil que había subido, el perfil vuelve al círculo de iniciales —
  nunca queda un espacio vacío ni un error.
- Subir una foto nueva reemplaza la anterior; no hay historial de fotos de perfil, a diferencia del
  carrusel de fotos de trabajo.

**Ejemplo verificable:** dado que Marcelo Rojas edita su perfil y sube una foto de su cara, cuando guarda
los cambios, entonces esa foto queda asociada a su perfil, distinta de las tres fotos de trabajo que ya
tenía cargadas.

**No incluye:** recortar o editar la foto dentro de Datealo; verificar que la imagen muestre efectivamente
una cara humana.

**Experiencia:** vigente ([experiencia.md](./experiencia.md)). **Ingeniería:** en revisión ([ingenieria.md](./ingenieria.md)).

<a id="f-002"></a>

### F-002 — El buscador ve esa foto en vez del círculo de iniciales

Cuando busco Electricidad en Ñuñoa y veo varias cards parecidas,
quiero ver la cara de cada profesional que subió una,
para elegir a quién escribirle con más confianza que si todos se ven igual.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** que el profesional haya subido su foto
de perfil (F-001); si no lo hizo, el resultado es idéntico al comportamiento actual — nada se rompe ni se
degrada.

**Sustento:** [C-002](./investigacion.md#c-002). **Éxito:** [M-001](#m-001).

**Reglas:**

- Si el profesional tiene foto de perfil, se muestra en el círculo de avatar tanto en resultados (misión
  06) como en el perfil público (misión 05), en el mismo lugar donde hoy se ven las iniciales.
- Si no tiene foto de perfil, se mantiene el círculo de iniciales — el comportamiento de hoy no cambia para
  ningún perfil que no suba una.
- Datealo nunca muestra una foto de trabajo en el lugar del avatar, aunque el profesional tenga varias
  cargadas y ninguna foto de perfil.

**Ejemplo verificable:** dado que Marcelo tiene foto de perfil y Héctor no, cuando alguien busca
Electricidad en Ñuñoa, entonces la card de Marcelo muestra su foto real y la de Héctor muestra "HS" en un
círculo — igual que hoy.

**No incluye:** ordenar o priorizar a quienes tienen foto de perfil por sobre quienes no —esta misión no
toca el orden de resultados, que es una decisión ya cerrada en `producto.md` de la misión 06 (D-001).

**Experiencia:** vigente ([experiencia.md](./experiencia.md)). **Ingeniería:** en revisión ([ingenieria.md](./ingenieria.md)).

## Casos límite que cruzan funcionalidades

Ninguno — los dos casos límite relevantes (borrar la foto, no tener ninguna) son propios de F-001 y F-002
respectivamente y ya están cubiertos en sus reglas.

## Fuera de alcance

| Capacidad o caso                                          | Estado     | Razón del recorte                                                              | Condición para reconsiderar |
| ----------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- | ----------------------------- |
| Recorte o editor de imagen dentro de Datealo                | postergada | Ninguna otra foto del perfil (fotos de trabajo) lo tiene tampoco — no es una regresión específica de esta funcionalidad | Si se agrega para fotos de trabajo, se evalúa acá también |
| Verificar que la foto muestre una cara humana real           | postergada | Es un problema de moderación de contenido distinto, sin quién lo opere hoy fuera de la verificación manual de la misión 02 | Cuando exista volumen que justifique moderación automática |
| Priorizar en el orden de resultados a quien tiene foto de perfil | descartada | El orden de resultados es una decisión cerrada de la misión 06 (D-001); reabrirla ahí, no acá | Evidencia de que la falta de foto de perfil predice mal desempeño, revisada en la misión 06 |

## Señales de éxito

<a id="m-001"></a>

### M-001 — Subir foto de perfil se adopta y mueve la conversión a contacto

- **Pregunta:** ¿los profesionales usan este campo, y cambia algo para el buscador cuando lo hacen?
- **Señal:** de los profesionales que completan su perfil (misión 04) en una semana dada, qué proporción
  sube también foto de perfil; y, de los buscadores que abren resultados con al menos un profesional con
  foto de perfil, qué proporción de los clics a "escribir por WhatsApp" caen sobre esos perfiles en vez de
  los que muestran iniciales, controlando por posición en la lista.
- **Método y umbral:** revisión manual sobre los primeros perfiles publicados después del lanzamiento de
  esta funcionalidad, sin umbral numérico todavía — no hay volumen para un umbral serio en la primera
  semana. Se define un umbral cuando misión 06 tenga suficiente tráfico real para medir clics de forma
  confiable.
- **Guardrail:** la proporción de perfiles que se publican sin foto de perfil no debería bajar la tasa de
  contacto de esos perfiles frente a como está hoy — esta funcionalidad no debe convertirse, de hecho, en
  una penalización para quien no la usa.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — La foto de perfil es un campo nuevo, nunca inferido de las fotos de trabajo

- **Estado:** aceptada. **Fecha:** 2026-08-31.
- **Sustento:** [C-001](./investigacion.md#c-001).
- **Tensión:** agregar un campo nuevo (con su paso de subida en misión 04, su columna en `professionals` y
  su consumo en misión 05/06) frente a resolver el problema sin tocar el modelo de datos, reusando lo que
  ya existe.
- **Alternativas descartadas:** (a) usar automáticamente la primera foto de `photoPaths` como avatar —
  descartada porque nada garantiza que sea una cara y podría mostrar una herramienta o un trabajo terminado
  junto al nombre del profesional, lo contrario de una señal de confianza; (b) dejar que el profesional
  marque cuál de sus fotos de trabajo ya cargadas "es su cara" — descartada porque mezcla dos propósitos
  distintos en el mismo campo (mostrar el trabajo vs. mostrar a la persona) y complica que cambie una sin
  afectar la otra, además de que casi ninguna foto de trabajo real muestra efectivamente una cara.
- **Decisión y consecuencia:** se agrega un campo separado y opcional en `professionals` para la foto de
  perfil, con nombre y forma exacta a definir en `ingenieria.md`; misión 04 gana un paso opcional de
  subida, y misión 05 y 06 lo consumen para reemplazar el círculo de iniciales cuando exista.
- **Reapertura:** si M-001 muestra que casi nadie sube la foto después de varias semanas, se reevalúa si el
  costo del campo se justifica frente a dejar solo iniciales.

## Preguntas

Ninguna abierta — D-001 ya se resolvió (aceptada, 2026-08-31), que era el único punto pendiente.
