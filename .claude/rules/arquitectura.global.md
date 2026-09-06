---
paths:
  - "server/api/**"
  - "server/db/**"
  - "server/utils/**"
  - "server/routes/**"
  - "app/plugins/**"
  - "app/middleware/**"
  - "app/composables/useProfessionalSession.ts"
  - "nuxt.config.ts"
---
# Arquitectura

- Antes de crear un endpoint, tocar la base de datos, escribir o revisar políticas RLS, conectar
  Supabase/Drizzle, manejar secretos o cambiar configuración de despliegue, invocar el skill `arquitectura`
  — no asumir dónde va cada cosa ni qué ya está decidido de memoria.
- Si el archivo está en `server/api/**`, invocar también `nuxt-server-endpoints` para el patrón de
  implementación con Drizzle antes de escribir el endpoint.
- Si el archivo está en `server/db/schema/**`, `server/db/migrations/**` o es `server/db/sql/rls.sql`,
  invocar también `supabase-postgres-best-practices`.
- Si el cambio crea una tabla con datos de usuario, cambia el ownership (`user_id`) o las relaciones que
  usan las policies (`EXISTS`/FKs) — en el schema o en `server/db/sql/rls.sql` — invocar `seguridad-datos`
  y correr su checklist antes de cerrar el edit: "hay una policy" no es lo mismo que "esa policy es la que
  protege" (A-002 del skill `arquitectura`).
