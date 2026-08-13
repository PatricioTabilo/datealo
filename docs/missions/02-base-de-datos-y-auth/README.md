# Misión 02 — Base de datos y Auth (config)

**Tipo:** técnica. **Abierta el** 2026-08-13. **Nace de:** A-001, A-002 y A-003 del skill `arquitectura`.

**Estado de la misión:** exploración

**Última actualización:** 2026-08-13

Primera de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Sin `producto.md`,
`experiencia.md` ni `investigacion.md`: es pura infraestructura, sin cambio de producto observable, y las
decisiones que la sustentan ya están tomadas en `arquitectura`.

| Documento  | Estado    | Qué falta para su gate  |
| ---------- | --------- | ------------------------ |
| Ingeniería | pendiente | discovery completo — hoy solo existe la carpeta |

**Próximo hito:** ninguno todavía — esta misión no se ha empezado a trabajar.

## Brief

Instalar y configurar lo que hoy no existe en el proyecto: Supabase, Drizzle, y el mecanismo de
autenticación (Supabase Auth) que van a compartir profesionales y buscadores, cada uno con su propio flujo
de acceso — no lo mismo, pero la misma base.

Es solo plomería: cero tablas de negocio, cero pantallas, cero flujo de usuario. Cada misión siguiente
(03 a 07) modela y construye su propia parte del dato y su propia parte del login cuando le toca — acá
sale a andar `useDb()`, el helper `requireUser()`, y el mecanismo de RLS (A-002: la policy es respaldo, la
autorización real vive en el código del endpoint).

Ninguna otra misión de este roadmap puede empezar a construir sin que esta termine primero.
