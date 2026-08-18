# Misión 03 — Taxonomía: categorías y comunas

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** lista para construir

**Última actualización:** 2026-08-18

Segunda de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/), ya cerrada, para poder guardar algo.

| Documento     | Estado  | Qué falta para su gate              |
| ------------- | ------- | ------------------------------------ |
| Investigación | activo  | se acumula, no bloquea — el problema tiene situación y consecuencia concretas, hay 3 conclusiones (C-001 a C-003) y un ideal con capacidades observables |
| Producto      | vigente | aprobado por Patricio el 2026-08-17 — D-001 a D-004 aceptadas, Q-001 y Q-002 resueltas |
| Experiencia   | vigente | aprobado por Patricio el 2026-08-18 — componente `ComunaSelect`/`CategoriaSelect` (UXF-001), 6 modos con mockup |
| Ingeniería    | vigente | aprobado por Patricio el 2026-08-18 — T-001 a T-003 aceptadas, plan de construcción S-001 a S-004 |

**Próximo hito:** crear los issues S-001 a S-004 desde el plan de construcción y empezar a construir. Sin
fecha límite todavía.

## Brief

Definir qué categorías de oficio (gasfitería, electricidad, peluquería, limpieza...) y qué comunas cubre
datealo en su lanzamiento — probablemente Santiago más otra región para empezar, no todo Chile de una vez.

Es la lista maestra de la que dependen registro (04) y búsqueda (06): sin ella, cada misión inventa su
propia versión de "qué categorías existen" o "qué comunas están disponibles", y quedan inconsistentes entre
sí. La decisión de qué entra y qué queda afuera en el lanzamiento es de producto, no algo que se resuelve
solo en el modelo de datos.
