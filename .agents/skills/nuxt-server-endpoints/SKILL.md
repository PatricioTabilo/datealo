---
name: nuxt-server-endpoints
description: Implementar y mantener endpoints backend ligeros en Nuxt (`server/api`, `server/utils`), incluyendo validacion, autenticacion server-side y acceso a datos con Drizzle ORM. Usar cuando se pidan rutas API, middleware de servidor, o integracion directa con Supabase/PostgreSQL desde el servidor.
---

# Nuxt Server Endpoints

Implementar endpoints de API claros, seguros y alineados con el esquema de datos.

## Flujo de trabajo

1. Definir contrato de entrada/salida del endpoint.
2. Autenticar con `requireServerUser(event)` antes de acceder a datos.
3. Validar payload y parametros de ruta.
4. Ejecutar operacion con Drizzle ORM filtrando siempre por `userId`.
5. Retornar datos o error estandarizado.

## Reglas de implementacion

- Siempre filtrar por `userId` en queries para reforzar ownership.
- Usar soft delete (`deletedAt`/`isArchived`) en vez de DELETE fisico.
- Filtrar datos archivados/eliminados en la query SQL, no en JS.
- Validar campos requeridos y retornar 400 con mensaje claro.
- Mantener endpoints pequenos y enfocados en una operacion.
- Usar `readBody` con tipo generico para tipado del payload.

## Referencias

- Cargar `references/endpoint-patterns.md` para estructura sugerida y snippets base.