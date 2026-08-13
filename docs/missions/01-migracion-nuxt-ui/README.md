# Misión 01 — Migración a Nuxt UI

**Tipo:** técnica. **Abierta el** 2026-08-11. **Nace de:** A-004 del skill `arquitectura`.

**Estado de la misión:** en validación

**Última actualización:** 2026-08-13

Sin `producto.md` ni `experiencia.md`: no hay cambio de producto observable — quien usa Datealo ve la misma
landing antes y después. La decisión de fondo (por qué Nuxt UI, qué se descarta, cuándo se reabre) ya está
tomada y vive en [A-004](../../../.claude/skills/arquitectura/SKILL.md#a-004--nuxt-ui-v4-es-la-base-de-interfaz).

| Documento  | Estado  | Qué falta para su gate  |
| ---------- | ------- | ------------------------ |
| Ingeniería | vigente — aprobado por Patricio Tabilo el 2026-08-11 | ninguno — los 12 issues (#1 a #12) están mergeados; TR-001 y TR-002 documentados en `ingenieria.md` |

**Próximo hito:** verificación visual en 390px de los 8 componentes migrados (S-002 a S-009). Quedó
pendiente en las 8 PRs — la herramienta de resize del browser no funcionó en este entorno durante toda la
construcción (detalle y lista de PRs en `ingenieria.md`, TR-002). Es lo único que falta para pasar a
`cerrada`: la promesa de "cero cambio visual" de esta misión se verificó en desktop en cada merge, pero el
caso principal de Datealo (mobile) todavía no se confirmó a ojo.

## Resumen ejecutivo

- **Qué cambia:** el motor de componentes de interfaz, de DaisyUI a Nuxt UI v4. Nada del contenido, la
  copia ni la estructura de la landing.
- **Por qué:** DaisyUI es solo CSS — la accesibilidad de componentes interactivos (focus trap, teclado,
  ARIA) se escribiría a mano en cada misión futura. Nuxt UI la trae resuelta. Detalle en A-004.
- **Alcance de esta entrega:** los 8 componentes de `app/components/landing/`, el theming en
  `app.config.ts` + `main.css`, retirar DaisyUI del proyecto, y dejar el kit de mockups y el skill
  `discovery-ux` citando Nuxt UI — para que la primera misión de producto que los use encuentre
  instrucciones ciertas, no las de un motor que ya no está.
- **Fuera de alcance:** cualquier cambio visual. Si un slice no se ve idéntico a lo que reemplaza, el
  slice está mal — no es una oportunidad para mejorar el diseño de paso.
- **Decisión bloqueante:** ninguna.
