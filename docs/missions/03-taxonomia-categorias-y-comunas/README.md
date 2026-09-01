# Misión 03 — Taxonomía: categorías y comunas

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** cerrada 2026-08-20

**Última actualización:** 2026-08-20

Segunda de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/), ya cerrada, para poder guardar algo.

| Documento     | Estado  | Qué falta para su gate              |
| ------------- | ------- | ------------------------------------ |
| Investigación | activo  | se acumula, no bloquea — el problema tiene situación y consecuencia concretas, hay 3 conclusiones (C-001 a C-003) y un ideal con capacidades observables |
| Producto      | vigente | aprobado por Patricio el 2026-08-17 — D-001 a D-004 aceptadas, Q-001 y Q-002 resueltas |
| Experiencia   | vigente | aprobado por Patricio el 2026-08-18 — componente `ComunaSelect`/`CategoriaSelect` (UXF-001), 6 modos con mockup |
| Ingeniería    | vigente | aprobado por Patricio el 2026-08-18 — T-001 a T-003 aceptadas, plan de construcción S-001 a S-005 |

Issues cerrados: [#45](https://github.com/PatricioTabilo/datealo/issues/45) (S-001, tablas + RLS + seed),
[#46](https://github.com/PatricioTabilo/datealo/issues/46) (S-002, endpoints),
[#47](https://github.com/PatricioTabilo/datealo/issues/47) (S-003, composables),
[#48](https://github.com/PatricioTabilo/datealo/issues/48) (S-004, `CatalogSelect`),
[#49](https://github.com/PatricioTabilo/datealo/issues/49) (S-005, `CategoriaSelect`/`ComunaSelect`).
También corregido en el camino: [#55](https://github.com/PatricioTabilo/datealo/issues/55) (Puente Alto y
San Bernardo activados en el catálogo de comunas); y el 2026-08-28, durante el discovery de misión 06,
Frutillar, Puerto Montt y Llanquihue activadas junto a Puerto Varas (los profesionales de esa zona ya
atienden cruzando esas comunas) — pendiente de su propio issue/PR, hecho directo en la base por pedido de
Patricio.

Plan de construcción completo — las 346 comunas y 8 categorías existen desde el día uno (D-002), Gran
Santiago y la zona del lago Llanquihue activas, y el componente de selección (`CategoriaSelect`,
`ComunaSelect`) listo para que lo importen las misiones 04 y 06.

## Brief

Definir qué categorías de oficio (gasfitería, electricidad, peluquería, limpieza...) y qué comunas cubre
datealo en su lanzamiento — probablemente Santiago más otra región para empezar, no todo Chile de una vez.

Es la lista maestra de la que dependen registro (04) y búsqueda (06): sin ella, cada misión inventa su
propia versión de "qué categorías existen" o "qué comunas están disponibles", y quedan inconsistentes entre
sí. La decisión de qué entra y qué queda afuera en el lanzamiento es de producto, no algo que se resuelve
solo en el modelo de datos.
