---
name: supabase-functions-logic
description: Implementar y mantener logica de negocio en Supabase Edge Functions (`supabase/functions/**`) con seguridad, validacion y observabilidad basica. Usar cuando el proyecto necesite mover reglas de negocio fuera del cliente y del endpoint Nuxt, ejecutar integraciones externas, proteger secretos o exponer operaciones reutilizables.
---

# Supabase Functions Logic

Definir funciones edge pequenas, testeables y reutilizables para reglas de negocio y procesos sensibles.

## Flujo de trabajo

1. Definir contrato de entrada/salida y estrategia de auth.
2. Crear o actualizar funcion en `supabase/functions/<name>/index.ts`.
3. Validar payload y permisos al inicio.
4. Ejecutar logica de negocio y acceso a datos.
5. Estandarizar respuesta y codigos de error.
6. Probar localmente y documentar consumo desde Nuxt.

## Reglas de implementacion

- Verificar auth antes de ejecutar logica costosa.
- Mantener funciones pequenas y orientadas a un caso de uso claro.
- Encapsular integraciones externas en helpers reutilizables.
- Retornar errores uniformes para facilitar manejo desde Nuxt.
- Evitar depender del cliente para reglas criticas.
- Limitar logs a informacion util sin exponer secretos.

## Integracion con Nuxt Endpoints

- Permitir que `server/api` sea adaptador HTTP y la Function concentre negocio.
- Llamar Function desde Nuxt cuando necesites ocultar tokens o unificar respuestas.
- Mantener contrato versionado cuando la Function sea consumida por multiples clientes.

## Referencias

- Cargar `references/function-patterns.md` para estructura base, auth y errores.
