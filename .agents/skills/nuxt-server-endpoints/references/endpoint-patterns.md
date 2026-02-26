# Endpoint Patterns

## Estructura sugerida

- `server/api/<resource>/<action>.<method>.ts`: handlers HTTP.
- `server/utils/<domain>.ts`: logica compartida.
- `server/middleware/**`: cross-cutting concerns.

## Handler base

1. Leer body/query/params.
2. Validar input.
3. Resolver identidad y permisos.
4. Ejecutar caso de uso.
5. Retornar payload uniforme.

## Errores

- Validacion: `400`.
- No autenticado: `401`.
- Sin permisos: `403`.
- No encontrado: `404`.
- Error inesperado: `500`.

Retornar errores con `createError` y mensaje corto, mas `data` opcional para detalles consumibles por frontend.

## Seguridad minima

- Validar metodo HTTP esperado.
- No confiar en datos de cliente.
- Limitar superficie de respuesta.
- Evitar logging de tokens, cookies o datos sensibles.
