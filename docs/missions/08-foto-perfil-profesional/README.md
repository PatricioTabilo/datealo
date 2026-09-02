# Misión 08 — Foto de perfil de profesional

**Tipo:** producto. **Abierta el** 2026-08-29. **Nace de:** ninguna.

**Estado de la misión:** cerrada 2026-09-02

**Última actualización:** 2026-09-02

No es una de las seis misiones originales hacia el MVP (esas son la 02 a la 07, ver el registro de
misiones) — nace después, al descubrir que [misión 05](../05-perfil-publico-profesional/) y
[misión 06](../06-busqueda-resultados/) usan hoy el mismo círculo de iniciales para todo profesional,
tenga o no fotos de trabajo cargadas. Depende de [misión 04](../04-registro-perfil-profesional/) (donde el
profesional carga sus fotos hoy y donde tendría que subir esta si se decide agregarla), y su resultado se
consume en la 05 (perfil público) y la 06 (búsqueda y resultados).

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** ninguno — los 7 issues del plan de construcción
([#125](https://github.com/PatricioTabilo/datealo/issues/125)–[#131](https://github.com/PatricioTabilo/datealo/issues/131))
están cerrados y mergeados. F-001 y F-002 funcionando de punta a punta.

`investigacion.md` sostiene dos conclusiones: una foto de trabajo no sirve como avatar de confianza
(C-001), y mostrar siempre iniciales sin excepción deja la lista de resultados sin señal diferenciadora
(C-002).

`producto.md` vigente — aprobado por Patricio el 2026-08-31. F-001 (el profesional sube su foto) y F-002
(el buscador la ve en vez de iniciales) quedan confirmadas; D-001 aceptada — la foto de perfil es un campo
nuevo y opcional, nunca inferido de las fotos de trabajo.

`experiencia.md` **vigente — aprobado por Patricio el 2026-09-01**. No crea ninguna vista nueva, modifica
una pieza de tres pantallas que ya construyeron las misiones 04 (dónde se sube la foto), 05 y 06 (dónde se
ve en vez de las iniciales). Pasó por evaluación heurística en contexto separado (un hallazgo bloqueante y
cinco de ejecución, todos corregidos) y por una verificación contra el código real: los dos únicos lugares
del repo que hoy renderizan iniciales (`ProfessionalPublicPhotos.vue` en el perfil público,
`SearchResultCard.vue` en resultados) coinciden exactamente con las vistas que `experiencia.md` cubre.
Mockup validado en `design-mockups/foto-perfil.html` (5 frames, móvil y un desktop del perfil público).

`ingenieria.md` **vigente — aprobado por Patricio el 2026-09-01**. La foto de perfil es una columna nueva (`professionals.avatarPath`) que
reutiliza el bucket `professional-photos` ya existente — mismo patrón de path, cero policies de Storage
nuevas (verificado contra `rls.sql`). Dos endpoints nuevos (`POST`/`DELETE /api/professionals/me/avatar`)
calcados de los que ya suben/borran fotos de trabajo (misión 04), y dos extensiones de lectura (perfil
público, resultados de búsqueda). Plan de construcción cortado en 7 slices. Pasó por auditoría en contexto
separado, con `clean-architecture`, `domain-driven-design` y `supabase-postgres-best-practices` invocados
de verdad: encontró un hallazgo bloqueante real (el círculo chico junto al nombre se le había asignado a
`ProfessionalPublicPhotos.vue`, que no tiene acceso al nombre en su template — el bloque vive en
`[id].vue`) y varios no bloqueantes (un hueco de contrato en el `DELETE` sin perfil, una condición de
carrera entre subidas simultáneas, la tabla de vocabulario faltante), todos corregidos. Los dos intentos
explícitos de tumbar las decisiones técnicas centrales (reusar el bucket, reemplazar sin `upsert`) no
encontraron una alternativa mejor — ambas se confirman.

## Brief

Hoy un profesional sube fotos de trabajos terminados (misión 04) — un tablero eléctrico, una cañería
reparada — y ninguna de esas fotos es necesariamente una foto de su cara. El perfil público (misión 05) y
los resultados de búsqueda (misión 06) resuelven esto mostrando siempre un círculo con las iniciales del
profesional, nunca una de sus fotos de trabajo, incluso cuando cargó varias. Es una decisión de diseño ya
tomada en ambos mockups, pero nunca declarada como decisión de producto — no hay ningún `D-xxx` en la 05 ni
en la 06 que la sostenga.

Esta misión existe para llenar ese vacío: investigar si el problema es real, decidir con Patricio si vale
la pena un campo de foto de perfil separado, y si la respuesta es sí, dejar `producto.md` y
`experiencia.md` listos antes de que se construya.
