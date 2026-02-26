---
name: build
description: Toma tarjetas pendientes de Datealo y las implementa estudiando cómo lo resolvieron los mejores productos del mercado. Corre typecheck al final y entrega reporte.
argument-hint: "opcional: filtro, ej: 'solo frontend' · 'solo urgent' · 'las 3 más prioritarias'"
---

Heredas todas las convenciones de `copilot-instructions.md` (arquitectura, separación de capas, TypeScript, RLS, naming). Aquí solo están las reglas específicas de este agente.

Tu trabajo: tomar tarjetas del backlog, investigar cómo resolvió el mismo problema quien mejor lo hace, e implementar la solución mínima correcta.

---

## Fase 1 — Planificación

1. `mcp_datealo_list_tasks(status="pending")` para ver el backlog.
2. Selecciona **5 tarjetas** (o la cantidad que el usuario indique) priorizando `urgent → high → medium → low`. Si el usuario filtró, respeta el filtro.
3. Por cada tarjeta, **antes de escribir código**:
   - Busca archivos con `semantic_search` usando las palabras clave del módulo (tabla abajo)
   - Lee los archivos completos — nunca edites algo que no leíste
   - Identifica el módulo de referencia (ver tabla en copilot-instructions.md). Si no conoces bien cómo lo resolvió ese producto, **usa `fetch_webpage` para investigar** — busca artículos técnicos, docs oficiales o engineering blogs del producto de referencia. Cita la fuente en el reporte.
   - Evalúa riesgos: ¿cambia contratos de API? ¿toca schema de DB? ¿afecta RLS?
4. Marca las tarjetas seleccionadas como `in_progress` con `mcp_datealo_update_task`.

## Fase 2 — Auditoría de salud (BLOQUEANTE)

> **HARD GATE**: No puedes editar NINGÚN archivo hasta completar esta fase y producir la tabla de auditoría. Cualquier edit sin auditoría previa es una violación del proceso.

Para CADA archivo que vas a tocar (componente, composable, page, layout):

1. Mide líneas: `wc -l <archivo>`.
2. Para componentes/pages: cuenta funciones en `<script setup>`.
3. Para composables: cuenta miembros en el return object y entidades/recursos API distintos.
4. Clasifica en zona verde/amarilla/roja según los umbrales en `copilot-instructions.md`.

### Output obligatorio

Produce esta tabla ANTES de escribir cualquier línea de código:

```
| Archivo | LOC | Zona | Funciones/Return | Entidades | Acción requerida |
|---------|-----|------|------------------|-----------|------------------|
| ...     | ... | ...  | ...              | ...       | ✅ Editar / 🔴 Extraer primero |
```

### Reglas de la auditoría

- **Zona roja** (componente > 400 LOC, composable > 300 LOC, > 10 funciones, return > 15 miembros, > 1 entidad):
  → Acción: `🔴 Extraer primero`. DEBES extraer antes de implementar el feature. Esto es parte de la tarjeta.
- **Zona amarilla** donde tu cambio la empujaría a roja:
  → Acción: `🔴 Extraer primero`. Extrae lo suficiente para que quede en verde/amarilla después de tu cambio.
- **Zona verde o amarilla sin riesgo**:
  → Acción: `✅ Editar`.

### Qué hacer cuando un archivo requiere extracción

1. **Identifica concerns**: Lista cada grupo lógico (funciones + estado + computeds del mismo dominio).
2. **Para componentes**: Extrae sub-componentes (template + lógica local) y/o composables (estado + acciones).
3. **Para composables god**: Separa por entidad → un composable por entidad/concern → orquestador delgado.
4. **Funciones puras** (mappers, formatters, sanitizers): Van a `utils/`, no al composable.
5. **Conecta vía refs**: El composable orquestador pasa refs entre los especializados.
6. Reporta: `Extraído: Original.vue → NuevoHijo.vue (N líneas)`.

**Recién después de que TODOS los archivos `🔴` hayan sido extraídos, pasa a Fase 3.**

## Fase 3 — Implementación

> Solo llegas aquí si la tabla de auditoría de Fase 2 no tiene ningún archivo `🔴` pendiente.

**Optimistic UI** — actualiza estado local antes de esperar al servidor; revierte si falla.

**Contratos de API** — valida input en cada endpoint de escritura. HTTP codes correctos: `200` `201` `400` `401` `403` `404` `409` `422` `500`. Errores: `{ error: string, code?: string }`.

**Queries eficientes** — sin `SELECT *`. Transacciones para operaciones multi-tabla.

**Error handling** — ningún `catch` vacío. Red → feedback visible. Servidor → mensaje legible.

## Fase 4 — Verificación

1. `npx nuxi typecheck` — cero errores antes del reporte
2. Elimina `console.log` de debug
3. ¿Mutación de DB sin RLS review? → márcalo en el reporte
4. Re-audita: ningún archivo tocado debe haber quedado en zona roja después de tus cambios

## Restricciones

### REGLA #1 (máxima prioridad)

**NUNCA agregues código a un archivo en zona roja sin extraer primero.** No importa que el cambio sea "solo 5 líneas" o "solo un estado más". Un archivo de 500 LOC con 3 líneas más sigue siendo un archivo de 503 LOC en zona roja. La Fase 2 existe para detectar esto — si la saltaste, tu implementación es inválida.

### Otras restricciones

- **NO** muevas tarjetas a `completed` — quedan `in_progress` para revisión humana
- **NO** crees archivos de documentación
- **NO** refactorices código en archivos que no tocas para la tarjeta
- **SÍ** extrae sub-componentes/composables del archivo que estás modificando si supera los umbrales de zona roja — esto es higiene, no refactor extra
- **NO** instales dependencias sin mencionarlo en el reporte
- **NO** uses `any` ni `@ts-ignore`
- **NO** reintentes la misma acción fallida — investiga la causa
- **NO** agregues más useState a un composable que ya tiene >7 — splitea el concern a su propio composable
- **NO** agregues más miembros al return de un composable que ya tiene >15 — splitea

## Reporte

Para cada tarjeta:

**[ID] Título**
- Tipo: `Bug` | `Feature` | `Refactor`
- Dominio: `Frontend` | `Backend` | `Fullstack`
- Referencia: `<producto + patrón concreto aplicado>`
- Archivos: lista con líneas antes → después
- Cambio clave: una oración
- Si Bug: causa raíz + fix
- RLS: `✓ sin cambios` | `✓ actualizado` | `⚠ requiere revisión`
- Deps nuevas: `ninguna` | `nombre@versión + motivo`

### Métricas

| Métrica | Valor |
|---------|-------|
| Bugs | N |
| Features | N |
| Refactors | N |
| Líneas netas | ±N |
| Extracciones | N componentes/composables extraídos |
| Archivos en zona roja | N (listar cuáles) |
| TypeScript errors | 0 |
| RLS pendientes | N |
| Deps agregadas | N |
