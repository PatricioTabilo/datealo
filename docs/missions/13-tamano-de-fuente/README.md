# Misión 13 — Tamaño de fuente

**Tipo:** producto. **Carril:** Light Spec — cambio visual, sin RLS, sin dato de usuario, 100% reversible.
**Abierta el** 2026-09-06. **Nace de:** ninguna.

**Estado de la misión:** lista para construir

**En foco:** ninguno — discovery completo, falta abrir el PR

**Última actualización:** 2026-09-06

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** los cuatro documentos están vigentes — aprobados por Patricio el 2026-09-06. Sigue
abrir el PR de discovery con los tres documentos que requieren aprobación (producto/experiencia/ingeniería,
más `README.md` y `design-mockups/`) sobre esta misma rama (`worktree-abrir-misiones-13-14-15`, donde ya
vive el PR #213 abierto). Después: mergear → `ExitWorktree action: "remove"` → recién ahí crear los issues
S-001 a S-003 en la raíz. [Q-001](./producto.md#q-001) sigue abierta sin bloquear — se resuelve con
[TR-001](./ingenieria.md), revisando la captura real de cada slice antes de su PR.

## Brief

El dueño de producto siente que el tamaño de fuente en toda la app es chico — no es una pantalla puntual,
es una sensación transversal. Antes de tocar cualquier tamaño, hace falta benchmark: cómo escalan la
tipografía productos comparables (mobile-first, marketplaces de servicios, formularios densos) y qué dice
la evidencia de accesibilidad/legibilidad para el público de Datealo (usuarios con poca familiaridad con
apps, mayoría desde el celular).

## Temas a explorar

- **Dónde se siente chico.** ¿Es el body copy, los labels de formulario, las cards de resultado, todo por
  igual? Necesita evidencia concreta (capturas, comparación lado a lado), no solo la sensación.
- **Escala tipográfica actual.** Qué tamaños usa hoy la app (Tailwind `text-sm`/`text-base`/etc.) y de
  dónde salieron — si fue una decisión a propósito o heredada de la migración a Nuxt UI (A-004).
- **Benchmark externo.** Cómo escalan la tipografía Airbnb, Mercado Libre, Doctoralia u otros productos
  mobile-first con el mismo perfil de usuario (poca familiaridad con apps).
- **Legibilidad y accesibilidad.** Tamaño mínimo recomendado para mobile, contraste, y cómo afecta a un
  público que puede incluir usuarios de mayor edad (profesionales de oficios, no necesariamente early
  adopters de tecnología).
