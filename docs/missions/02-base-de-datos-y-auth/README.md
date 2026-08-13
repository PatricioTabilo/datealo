# Misión 02 — Base de datos y Auth (config)

**Tipo:** técnica. **Abierta el** 2026-08-13. **Nace de:** A-001, A-002 y A-003 del skill `arquitectura`.

**Estado de la misión:** exploración

**Última actualización:** 2026-08-13

Primera de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Sin `producto.md`,
`experiencia.md` ni `investigacion.md`: es pura infraestructura, sin cambio de producto observable.

**Ojo con esto al tomar la misión:** `A-001`, `A-002` y `A-003` en `arquitectura` están marcadas
**"propuesta"**, no "aceptada" — no son un hecho consumado que esta misión solo ejecuta. Ratificarlas (o
ajustarlas) contra una decisión real, con código de por medio, es parte del trabajo de esta misión, no algo
que ya viene resuelto de afuera.

| Documento  | Estado    | Qué falta para su gate  |
| ---------- | --------- | ------------------------ |
| Ingeniería | pendiente | discovery completo — hoy solo existe la carpeta |

**Próximo hito:** ninguno todavía — esta misión no se ha empezado a trabajar.

## Brief

Instalar y configurar lo que hoy no existe en el proyecto: la base de datos (Supabase + Drizzle) y el
mecanismo de autenticación que van a compartir profesionales y buscadores, cada uno con su propio flujo de
acceso — no lo mismo, pero la misma base.

**Decisión pendiente de confirmar, no de dar por hecha:** en la conversación de roadmap del 2026-08-13 la
recomendación fue usar Supabase Auth (no construir autenticación in-house, no sumar un tercer proveedor),
porque ya es la base de datos elegida y trae nativo lo que necesitan los dos flujos — pero es una
recomendación, no una decisión ratificada. Evaluar build-vs-buy en serio, con la alternativa descartada y
el porqué documentados, es parte del `ingenieria.md` de esta misión.

Es solo plomería: cero tablas de negocio, cero pantallas, cero flujo de usuario. Cada misión siguiente
(03 a 07) modela y construye su propia parte del dato y su propia parte del login cuando le toca — acá
sale a andar `useDb()`, el helper `requireUser()`, y el mecanismo de RLS (A-002: la policy es respaldo, la
autorización real vive en el código del endpoint).

Ninguna otra misión de este roadmap puede empezar a construir sin que esta termine primero.
