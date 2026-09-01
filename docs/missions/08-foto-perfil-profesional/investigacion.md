# Misión: foto de perfil de profesional — Investigación

**Estado:** activo

**Última actualización:** 2026-08-29

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando Marcelo sube fotos de su trabajo, no de su cara

**Situación:** Marcelo Rojas es electricista en Ñuñoa. Al completar su perfil (misión 04) sube tres fotos:
un tablero que instaló, un empalme y un enchufe terminado. Ninguna es una foto de él.

**Acción o necesidad:** alguien busca "Electricidad" en Ñuñoa (misión 06) y necesita decidir, entre varias
cards parecidas, a quién escribirle primero.

**Respuesta actual:** la card de Marcelo muestra un círculo con "MR", igual que la de Héctor, que no subió
ninguna foto. El perfil público de Marcelo (misión 05) sí muestra sus tres fotos en un carrusel, pero solo
después de tocar la card — en resultados, antes de decidir, no hay ninguna diferencia visual entre un
profesional con fotos reales de su trabajo y uno que no cargó nada.

**Consecuencia:** la lista de resultados se ve homogénea — una fila de círculos de iniciales — y pierde la
señal de confianza que "fotos reales" debería aportar (`CLAUDE.md`: "confianza primero: perfiles con
reseñas, fotos de trabajos y verificación"). El buscador no tiene ninguna pista visual de con quién está a
punto de escribir hasta entrar al perfil, y ahí tampoco hay garantía de que alguna foto del carrusel
muestre su cara.

## Preguntas que la investigación debe resolver

- ¿Agregar un campo de foto de perfil separado de las fotos de trabajo resuelve el problema, o alcanza con
  dejar que el profesional marque cuál de sus fotos de trabajo lo representa a él?
- ¿El costo de un paso adicional en el registro (misión 04) se justifica con la evidencia que hay, o es una
  funcionalidad que puede esperar a que haya más profesionales y se sepa si el problema es real?

## Evidencia

| ID    | Tipo        | Fuente                                                                 | Hecho verificable | Límite de la evidencia |
| ----- | ----------- | ----------------------------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código      | `server/db/schema/professionals.ts`                                     | El perfil solo guarda `photoPaths` (fotos de trabajo) — no existe ningún campo que distinga una foto de la persona de una foto de un trabajo | Dice qué existe hoy, no qué debería agregarse |
| E-002 | observación | `docs/missions/05-perfil-publico-profesional/design-mockups/perfil-publico.html`, `docs/missions/06-busqueda-resultados/design-mockups/resultados-busqueda.html` | Ambos mockups usan siempre el círculo de iniciales para el avatar chico, incluso en el modo de perfil completo con 3 fotos cargadas — ninguna foto de trabajo se reusa nunca como avatar | Es una decisión de diseño ya tomada bajo el supuesto de que ninguna foto de trabajo es confiablemente una cara; no viene de evidencia externa |
| E-003 | benchmark   | Doctoralia, Airbnb, Yelp                                                 | Los tres muestran siempre una foto de la persona o el negocio junto al nombre en resultados, nunca solo iniciales, incluso con perfiles recién creados y poca información cargada | Son marketplaces maduros con moderación de contenido activa; no dice qué pasa en un marketplace recién lanzado donde nadie ha subido nada todavía |
| E-004 | código      | worktree de la misión 06, sin commitear (`server/db/schema/professionals.ts`, migración `0004_acoustic_kree.sql`) | Ya se agregó una columna `avatarPath` a `professionals`, con el comentario "nunca se completa con la primera foto de `photoPaths`" — indica que alguien ya evaluó y descartó usar automáticamente la primera foto de trabajo como avatar | Es trabajo de ingeniería adelantado a cualquier decisión de producto, no evidencia externa por sí solo — pero es la razón concreta por la que existe esta misión |

<a id="e-004"></a>

### E-004 — el código ya descartó la alternativa obvia antes de que exista la decisión

El comentario en `professionals.ts` no dice "avatar opcional del profesional" — dice explícitamente que
nunca se completa con la primera foto de `photoPaths`. Esa es una decisión con alternativa descartada
(usar la primera foto de trabajo como avatar automático), tomada en algún punto de una conversación que no
quedó en ningún `producto.md`.

Esto permite afirmar que la alternativa "avatar automático desde la primera foto de trabajo" ya fue
considerada y rechazada, pero no demuestra que un campo de foto de perfil separado sea la respuesta
correcta — solo que el fallback automático no lo es.

## Conclusiones

<a id="c-001"></a>

### C-001 — Una foto de trabajo no sirve como avatar de confianza

- **Sustento:** [E-002](#e-002), [E-004](#e-004).
- **Razonamiento:** nada garantiza que la primera foto que un profesional suba a `photoPaths` muestre su
  cara — puede ser una herramienta, un tablero, un antes/después del trabajo. Mostrarla como avatar
  circular junto al nombre puede generar más confusión que confianza, y esa fue exactamente la razón por
  la que dos personas distintas (quien diseñó los mockups de la 05/06, y quien escribió el comentario de
  `avatarPath`) llegaron a la misma conclusión sin coordinarse.
- **Implicación:** si se agrega una foto de perfil, tiene que ser un campo que el profesional suba a
  propósito como "esta es mi cara", nunca algo inferido de las fotos de trabajo.
- **Confianza:** media, porque el sustento es razonamiento interno convergente (E-004) más un patrón de
  diseño ya aplicado (E-002), no evidencia de usuarios reales.

<a id="c-002"></a>

### C-002 — Mostrar siempre iniciales, sin excepción, deja la lista de resultados sin señal de confianza diferenciadora

- **Sustento:** [E-002](#e-002), [E-003](#e-003).
- **Razonamiento:** con 3+ profesionales activos en una categoría-comuna (el caso que la misión 06 ya
  describe como el más común al lanzamiento), una lista donde todos se ven igual —un círculo de
  iniciales— no ayuda al buscador a elegir. Los tres benchmarks de E-003 resuelven esto mostrando una foto
  real de entrada, aunque su escala y moderación no sean comparables a Datealo hoy.
- **Implicación:** vale la pena evaluar un campo de foto de perfil aunque agregue un paso al registro
  (misión 04), porque el resultado que reemplaza —una lista de iniciales indistinguibles— es precisamente
  el problema que la señal de confianza de `CLAUDE.md` busca evitar.
- **Confianza:** media, porque el benchmark no transfiere directo al volumen y madurez de Datealo
  pre-lanzamiento — la comparación válida es contra el estado vacío real de hoy, no contra Yelp.

## El ideal: cada profesional que quiere mostrar su cara, puede — y el buscador la ve antes de decidir

### El resultado ideal se ve así

Marcelo sube una foto de su cara al completar su perfil (misión 04), separada de las tres fotos de su
trabajo. Cuando alguien busca "Electricidad" en Ñuñoa (misión 06), ve tres cards: la de Marcelo con su
foto real, la de Jorge (que también subió la suya) y la de Héctor (que no subió ninguna, con su círculo de
iniciales "HS", exactamente como hoy). La diferencia es visible de inmediato, sin tener que entrar a
ningún perfil — y para Héctor no cambia nada: sigue siendo un perfil válido y visible, solo que sin esa
señal extra.

### Capacidades del ideal

| Capacidad                                   | Acción habilitada                                         | Respuesta esperada                                                        | Conclusión que la justifica |
| -------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| Subir foto de perfil                        | El profesional carga una foto de su cara, distinta de las de trabajo | Se guarda como un campo separado, nunca inferido de `photoPaths`         | [C-001](#c-001)              |
| Ver foto de perfil en resultados y en el perfil | El buscador ve esa foto en el círculo de avatar, en vez de iniciales | Si no existe, se mantiene el círculo de iniciales — comportamiento actual | [C-002](#c-002)              |

### El ideal no significa recorte automático ni verificación de identidad

- No reemplaza el carrusel de fotos de trabajo de la misión 05 — sigue existiendo aparte, con su propio
  propósito.
- No implica verificar que la foto de perfil efectivamente muestre una cara humana — eso es moderación de
  contenido, un problema distinto y probablemente fuera de alcance mientras Datealo verifique perfiles a
  mano (misión 02).

## Referencias

- Ninguna todavía — la evidencia de benchmark (E-003) se basa en observación directa de las apps, sin una
  fuente escrita citable más allá de lo que cualquiera puede ver abriendo Doctoralia, Airbnb o Yelp.
