# Misión 14 — Múltiples categorías por profesional

**Tipo:** producto. **Carril:** Full Spec — toca el modelo de datos de `professionals` (hoy una sola
categoría por profesional) y cómo `/api/search` filtra por categoría. **Abierta el** 2026-09-06.
**Nace de:** ninguna.

**Estado de la misión:** lista para construir

**En foco:** ninguno — los tres documentos (`producto.md`, `experiencia.md`, `ingenieria.md`) están
`vigente`

**Última actualización:** 2026-09-07

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** abrir el PR de discovery con los tres documentos vigentes (paso 6 de la secuencia en
`docs/missions/README.md`). Sin fecha límite todavía.

## Brief

Hoy un profesional declara una sola categoría (gasfitería, electricidad, etc.) en su perfil. En la
práctica, muchos profesionales de oficios cubren más de un rubro relacionado — el ejemplo que dio el
dueño de producto: alguien que es electricista y también gasfiter. Con una sola categoría, ese profesional
solo aparece en las búsquedas de una de las dos, perdiendo la otra mitad de su demanda potencial — y
Datealo pierde cobertura de oferta en la categoría donde ese profesional no quedó registrado.

## Temas a explorar

- **Cuántas categorías tiene sentido permitir.** ¿Sin límite, o un tope razonable (2-3) para que el perfil
  siga siendo legible y no se use como spam de categorías para aparecer en todo?
- **Cómo se ve en el perfil público y en las cards de resultado.** Hoy la categoría es un dato singular en
  varios lugares (`categoriaNombre` en la card, en el perfil) — mostrar 2-3 categorías sin romper la
  jerarquía visual existente.
- **Cómo busca alguien.** Si el buscador sigue siendo "una categoría a la vez" (`/buscar?categoria=X`), un
  profesional con 2 categorías debe aparecer en los resultados de cualquiera de las dos que tenga.
- **Impacto en el modelo de datos.** Hoy `professionals` probablemente tiene la categoría como columna
  simple — pasar a múltiples categorías es una tabla de relación nueva (`professional_categorias` o
  similar), con su propia policy RLS y migración de los datos existentes (cada profesional actual conserva
  su única categoría de hoy como la primera).
- **Impacto en `/api/search`.** El filtro por categoría pasa de una comparación simple a un `EXISTS`/join
  contra la tabla de relación — evaluar costo de query y si necesita índice nuevo.
