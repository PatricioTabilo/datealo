# Misión 13 — Tamaño de fuente

**Tipo:** producto. **Carril:** Light Spec — cambio visual, sin RLS, sin dato de usuario, 100% reversible.
**Abierta el** 2026-09-06. **Nace de:** ninguna.

**Estado de la misión:** cerrada 2026-09-06

**En foco:** ninguno — misión cerrada

**Última actualización:** 2026-09-06

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Cierre:** los tres slices del plan de construcción se implementaron y mergearon: S-001 (#217, issue
#214), S-002 (#218, issue #215) y S-003 (#219, issue #216). [Q-001](./producto.md#q-001) se resolvió
revisando la captura real de S-001 en 390px — la jerarquía nombre 16px bold / secundario 14px normal se
sostiene sola, sin ajuste de peso o contraste. [TR-001](./ingenieria.md) cerrado con el mismo criterio
para los tres slices.

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
