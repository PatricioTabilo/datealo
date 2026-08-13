# Misión 01: Migración a Nuxt UI — Ingeniería

**Estado:** activo

**Última actualización:** 2026-08-11

[Índice](./README.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: reemplazar DaisyUI por Nuxt UI v4 sin cambiar el resultado visual

Sustituir el motor de componentes manteniendo pixel-a-pixel el mismo look: mismo índigo, mismo turquesa,
misma tipografía, mismos radios. El riesgo no es de arquitectura — es de regresión visual y de bundle,
porque Nuxt UI trae JS que DaisyUI no tenía.

- **Contratos de producto cubiertos:** A-004 (`arquitectura`).
- **Riesgo bloqueante:** ninguno.

## Arquitectura: dos capas de theming, cero componentes compartiendo motor a la vez

Nuxt UI separa tokens crudos (Tailwind `@theme`, en `main.css`) de su mapeo semántico (`app.config.ts` bajo
`ui.colors`). DaisyUI mezcla ambos en `[data-theme="datealo"]`. Los dos motores pueden convivir mientras
dura la migración: `S-001` instala Nuxt UI y lo tematiza sin tocar ningún componente, así que hasta
`S-002` la landing sigue siendo 100% DaisyUI y compilando.

El mecanismo exacto (escala de 11 tonos por color, dónde va el mapeo semántico, cómo se overridea el
radio) está verificado y documentado como receta reutilizable en
[`arquitectura/references/recetas.md`](../../../.claude/skills/arquitectura/references/recetas.md#colores-de-marca-y-radio-en-nuxt-ui) —
no se repite acá.

| Componente         | Responsabilidad                              | No debe decidir          | Contratos |
| ------------------- | --------------------------------------------- | ------------------------ | --------- |
| `main.css`          | Tokens crudos (`@theme`): color, radio, fuente | Mapeo semántico           | A-004     |
| `app.config.ts`     | Mapeo semántico (`ui.colors`, `ui.<componente>`) | Valores de color crudos | A-004     |
| `landing/*.vue`      | Markup y contenido, con componentes de Nuxt UI | Su propio color o radio  | A-004     |

## Contratos

No aplica — esta misión no agrega ni cambia ningún endpoint ni contrato entre capas de datos.

## Modelo de datos

No aplica — no toca `server/`, no hay tabla nueva ni cambiada.

### Impacto en RLS

No aplica — no se crea ni modifica ninguna tabla ni policy.

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta                                                | Qué invalida            | Experimento o mitigación                                                          | Criterio de salida                                       | Estado  |
| ------ | ------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------- |
| TR-001 | Nuxt UI agrega JS que puede pesar en 3G/4G, el contexto real del buscador | El presupuesto de carga en móvil | Medir el tamaño del bundle de la landing antes de `S-001` y después de `S-010`, con `npx nuxi analyze` | La diferencia queda documentada; si crece más del 30%, se revisa contra A-004 | medido — crece 70% gzip, revisado y aceptado por Patricio Tabilo el 2026-08-12 |
| TR-002 | Un componente migrado se ve distinto al original y nadie lo nota  | La promesa de "cero cambio visual" | Cada slice de componente compara contra un screenshot del componente actual antes de mergear | Revisión visual en 390px y desktop, lado a lado, antes de cada merge | resuelto — S-002 a S-009 verificados en desktop en cada PR; 390px se verificó al cierre de la misión (no durante la construcción — la herramienta de resize del browser no funcionó en este entorno hasta encontrar el workaround: un `<iframe>` de 390px de ancho tiene su propio viewport real de CSS, independiente de la ventana del browser). Los 8 componentes revisados en la app real: navbar, ambos forms de waitlist, grillas de problema/solución, carrusel de categorías (flechas correctamente ocultas), CTA final y footer — todos calzan, sin overflow ni texto cortado |

**TR-001, detalle de la medición** (JS+CSS del cliente, build de producción, tres puntos de comparación):

| | Antes (DaisyUI puro) | S-001 (Nuxt UI instalado, 0 componentes usados) | S-010 (8 componentes migrados, DaisyUI afuera) |
| - | - | - | - |
| JS | 214 KB | 264 KB | 352 KB |
| CSS | 53 KB | 297 KB | 226 KB |
| Total gzip | 91 KB | 144 KB | 155 KB |

Cruza el 30% (+70% gzip total), pero la causa está identificada y no es preocupante hacia adelante: más de la mitad del salto en JS (+50 KB de los +138 KB) ocurre en `S-001`, antes de usar un solo componente — es el costo fijo de registrar el módulo (plugins de color mode, app-config, íconos). El resto (+88 KB) es `reka-ui` + `tailwind-merge` + el runtime de íconos que traen `UButton`/`UInput`, compartido entre todos los componentes que los usan — no crece linealmente por cada componente nuevo. El CSS no tiene relación con JS: es la escala completa de 11 tonos por color de marca que `S-001` fuerza con `@theme static` (ver `recetas.md`), fija sin importar cuántos componentes la referencien; bajó de `S-001` a `S-010` al retirar el CSS de DaisyUI que convivía en paralelo.

## Estrategia de pruebas

| Contrato o riesgo | Nivel                     | Caso principal                                    | Límite o falla                              |
| ------------------ | -------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| Cada slice S-002..S-009 | visual + build         | El componente migrado, en 390px, calza con el original | `npx nuxi typecheck` y `npm run build` limpios |
| TR-001              | medición                  | Tamaño de bundle antes/después                       | —                                                |

## Plan de construcción

Corte vertical por componente: cada `landing/*.vue` es su propia costura, se puede migrar y verificar sola
sin tocar las demás. `S-001` es la fundación (nada funciona sin el theming). `S-010` es el borrado de
DaisyUI — obligatorio desde el principio, no un follow-up que alguien se acuerde de abrir después.

| ID     | Slice (una frase, sin "y")                          | Sustento | Criterio de aceptación principal                                                                 | Depende de | Issue |
| ------ | ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------- | ---------- | ----- |
| S-001  | Instalar y tematizar Nuxt UI sin usarlo en ningún componente | A-004    | `npm i @nuxt/ui` + `app.config.ts` con `ui.colors.primary` en el índigo datealo; un `<UButton>` de prueba en una página aislada sale con el color y radio correctos; ningún componente de la landing cambia | —          | [#1](https://github.com/PatricioTabilo/datealo/issues/1) |
| S-002  | Migrar LandingNavbar a componentes de Nuxt UI           | A-004    | Visualmente idéntico en 390px y desktop; `npx nuxi typecheck` limpio                              | S-001      | [#2](https://github.com/PatricioTabilo/datealo/issues/2) |
| S-003  | Migrar LandingHero a componentes de Nuxt UI             | A-004    | Idéntico en 390px y desktop, botón e ícono incluidos                                              | S-001      | [#3](https://github.com/PatricioTabilo/datealo/issues/3) |
| S-004  | Migrar LandingProblem a componentes de Nuxt UI          | A-004    | Idéntico en 390px y desktop                                                                       | S-001      | [#4](https://github.com/PatricioTabilo/datealo/issues/4) |
| S-005  | Migrar LandingSolution a componentes de Nuxt UI         | A-004    | Idéntico en 390px y desktop                                                                       | S-001      | [#5](https://github.com/PatricioTabilo/datealo/issues/5) |
| S-006  | Migrar LandingCategories a componentes de Nuxt UI       | A-004    | Idéntico en 390px y desktop, grilla de categorías incluida                                        | S-001      | [#6](https://github.com/PatricioTabilo/datealo/issues/6) |
| S-007  | Migrar LandingForProfessionals a componentes de Nuxt UI | A-004    | Idéntico en 390px y desktop                                                                       | S-001      | [#7](https://github.com/PatricioTabilo/datealo/issues/7) |
| S-008  | Migrar LandingFinalCta a componentes de Nuxt UI         | A-004    | Idéntico en 390px y desktop, botón de waitlist incluido                                           | S-001      | [#8](https://github.com/PatricioTabilo/datealo/issues/8) |
| S-009  | Migrar LandingFooter a componentes de Nuxt UI           | A-004    | Idéntico en 390px y desktop                                                                       | S-001      | [#9](https://github.com/PatricioTabilo/datealo/issues/9) |
| S-010  | Retirar DaisyUI del proyecto                            | A-004    | `daisyui` fuera de `package.json`; `@plugin "daisyui"` y `[data-theme="datealo"]` fuera de `main.css`; cero referencias a clases DaisyUI en `app/`; `npm run build` limpio | S-002..S-009 | [#10](https://github.com/PatricioTabilo/datealo/issues/10) |
| S-011  | Actualizar el kit de mockups a Nuxt UI                  | A-004    | `docs/design/datealo-mockup-kit.css` define las mismas variables `--ui-*` (`--ui-primary`, `--ui-bg`, `--ui-text`, `--ui-radius`, etc.) que Nuxt UI genera en runtime desde `app.config.ts`, con los mismos valores; `docs/design/README.md` ya no cita DaisyUI; un mockup de prueba con clases reales de Nuxt UI (`bg-primary`, `text-primary`) reproduce el look real de la app sin correr Vue | S-010      | [#11](https://github.com/PatricioTabilo/datealo/issues/11) |
| S-012  | Actualizar el skill `discovery-ux` a Nuxt UI             | A-004    | La sección de DaisyUI como base de todo elemento interactivo pasa a citar Nuxt UI y Reka UI; el ejemplo de "algo que DaisyUI no tiene" se revisa porque deja de aplicar igual | S-010      | [#12](https://github.com/PatricioTabilo/datealo/issues/12) |

S-002 a S-009 no dependen entre sí — se pueden mergear en cualquier orden o en paralelo. El orden de la
tabla sigue el orden en que aparecen en la página, solo para que revisarlos en secuencia sea más fácil de
seguir.

**Por qué S-011 y S-012 dependen de S-010, no de S-001:** mientras DaisyUI siga en el proyecto, el kit de
mockups y el skill `discovery-ux` siguen describiendo lo que hay — cambiarlos antes deja al kit
documentando un motor que la app todavía no usa. El mecanismo de S-011 ya está verificado: Nuxt UI expone
su mapeo semántico como variables CSS en runtime (`--ui-primary`, `--ui-bg`, `--ui-text`, `--ui-radius`...)
derivadas de `app.config.ts`. El kit las espeja igual que hoy espeja los tokens de `main.css` — mismo
patrón, una capa más arriba, sin copiar clases compuestas por componente.

Sin S-011 y S-012, la primera misión de producto que necesite un mockup o abra `discovery-ux` se encuentra
con instrucciones que ya no son ciertas — por eso quedan en el plan de esta misión y no como una nota
suelta que alguien tiene que acordarse de retomar.

## Preguntas

Ninguna abierta que bloquee construcción.
