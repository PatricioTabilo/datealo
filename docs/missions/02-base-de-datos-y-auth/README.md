# Misión 02 — Base de datos, Auth y correo (config)

**Tipo:** técnica. **Abierta el** 2026-08-13. **Nace de:** A-001, A-002 y A-003 del skill `arquitectura`.

**Estado de la misión:** lista para construir

**Última actualización:** 2026-08-13

Primera de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Sin `producto.md`,
`experiencia.md` ni `investigacion.md`: es pura infraestructura, sin cambio de producto observable.

**Ojo con esto al tomar la misión:** `A-001`, `A-002` y `A-003` en `arquitectura` están marcadas
**"propuesta"**, no "aceptada" — no son un hecho consumado que esta misión solo ejecuta. Ratificarlas (o
ajustarlas) contra una decisión real, con código de por medio, es parte del trabajo de esta misión, no algo
que ya viene resuelto de afuera.

| Documento  | Estado      | Qué falta para su gate  |
| ---------- | ----------- | ------------------------ |
| Ingeniería | en revisión | aprobación del dueño de producto para pasar a `vigente` |

Issues abiertos: [#31](https://github.com/PatricioTabilo/datealo/issues/31) (S-001, Supabase + Drizzle),
[#32](https://github.com/PatricioTabilo/datealo/issues/32) (S-002, auth de servidor),
[#33](https://github.com/PatricioTabilo/datealo/issues/33) (S-003, Resend SMTP de Supabase Auth),
[#34](https://github.com/PatricioTabilo/datealo/issues/34) (S-004, `sendEmail()`).

**Próximo hito:** empezar S-001 (#31) — sin fecha límite todavía. La verificación de dominio en Resend
(TQ-001/TR-003) queda como tarea operativa de Patricio, en paralelo, sin bloquear el código.

## Brief

Instalar y configurar lo que hoy no existe en el proyecto: la base de datos (Supabase + Drizzle), el
mecanismo de autenticación que van a compartir profesionales y buscadores (cada uno con su propio flujo de
acceso, no lo mismo, pero la misma base), y el envío de correo transaccional.

El correo se agregó tarde a este roadmap: hace falta desde el primer flujo real (cuando un profesional se
registra, algo le tiene que confirmar "recibimos tu solicitud, la vamos a validar pronto" — sin eso el
registro se siente un hueco negro). No hay nada instalado todavía.

**Decisiones pendientes de confirmar, no de dar por hechas** (ambas salieron de la conversación de roadmap
del 2026-08-13, ninguna es decisión ratificada — evaluar build-vs-buy en serio, con alternativa descartada
y porqué documentados, es parte del `ingenieria.md` de esta misión):

- **Auth:** la recomendación fue Supabase Auth (no in-house, no un tercer proveedor), porque ya es la base
  de datos elegida y trae nativo lo que necesitan los dos flujos.
- **Correo:** la recomendación fue un proveedor transaccional tipo Resend (no SMTP propio, no otro
  proveedor sin evaluar) — mismo criterio: bajo costo de integración, no construir algo que ya está
  resuelto.

Es solo plomería: cero tablas de negocio, cero pantallas, cero flujo de usuario, cero copy de correo. Cada
misión siguiente (03 a 07) modela y construye su propia parte del dato, su propia parte del login, y
dispara sus propios correos con su propio contenido cuando le toca — acá sale a andar `useDb()`, el helper
`requireUser()`, el mecanismo de RLS (A-002: la policy es respaldo, la autorización real vive en el código
del endpoint), y un `sendEmail()` genérico en `server/utils/` para que nadie reinvente la integración con
el proveedor cada vez.

Ninguna otra misión de este roadmap puede empezar a construir sin que esta termine primero.
