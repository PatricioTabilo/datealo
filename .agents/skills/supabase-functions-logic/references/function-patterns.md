# Function Patterns

## Estructura sugerida

- `supabase/functions/<name>/index.ts`: entrada principal.
- `supabase/functions/_shared/**`: utilidades compartidas.

## Flujo base

1. Parsear request.
2. Verificar auth (si aplica).
3. Validar payload.
4. Ejecutar logica de negocio.
5. Retornar JSON estable.

## Formato de respuesta

- Exito: `{ ok: true, data: ... }`
- Error controlado: `{ ok: false, code: '...', message: '...' }`

Mantener codigos de estado coherentes (`200`, `400`, `401`, `403`, `404`, `500`).

## Casos ideales para Edge Functions

- Reglas de negocio reutilizadas por web y mobile.
- Integraciones con APIs externas.
- Procesamiento protegido por secretos.
- Operaciones asincronas o de mayor costo.

## Integracion con Nuxt

- Exponer endpoint Nuxt fino que llame la Function cuando se necesite control HTTP adicional.
- Mantener validacion defensiva en ambos lados cuando la operacion sea critica.
