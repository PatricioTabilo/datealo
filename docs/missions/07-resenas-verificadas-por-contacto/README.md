# Misión 07 — Reseñas verificadas por contacto

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** exploración

**Última actualización:** 2026-08-13

Sexta y última misión hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/) (verificación de teléfono del buscador, sobre Supabase Auth) y de
[misión 05](../05-perfil-publico-profesional/) (el evento de contacto al que se ata cada reseña).

| Documento     | Estado    | Qué falta para su gate              |
| ------------- | --------- | ------------------------------------ |
| Investigación | pendiente | discovery completo — hoy solo existe la carpeta |
| Producto      | pendiente | —                                     |
| Experiencia   | pendiente | —                                     |
| Ingeniería    | pendiente | —                                     |

**Próximo hito:** ninguno todavía — esta misión no se ha empezado a trabajar.

## Brief

Después de contactar a un profesional, el buscador puede dejar una reseña — verificada por teléfono (no
cuenta completa, solo un OTP puntual), atada al hecho de que el contacto realmente ocurrió. No es un
formulario abierto que cualquiera llena: es la pieza que sostiene la promesa de "reseñas reales, sin
inventadas" que la landing ya le mostró a gente real.

El buscador no necesita cuenta persistente para buscar ni para contactar — solo para esto. Ver la
conversación de arquitectura del roadmap (2026-08-13) para el porqué: research sobre verificación de
reviews sin transacción dentro de la plataforma, y por qué "cuenta completa" sería fricción sin beneficio
para el resto del flujo.
