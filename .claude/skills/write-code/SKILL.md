---
name: write-code
description: Convenciones base para escribir código en Datealo — YAGNI, TypeScript strict, manejo de errores y naming. Usar antes de escribir o editar cualquier `.ts` o `.vue` en `app/` o `server/`, sin importar la capa. No cubre arquitectura de componentes/composables (ver `vue-composition`), comentarios (ver `comentarios`), endpoints (ver `nuxt-server-endpoints`) ni dónde vive cada pieza del sistema (ver `arquitectura`) — este skill es la base que aplica encima de todos esos.
---

# Escribir código en Datealo

Reglas base para cualquier archivo de código del proyecto. No reemplazan a los skills más específicos —
son la capa debajo de `vue-composition`, `nuxt-server-endpoints`, `comentarios` y `arquitectura`.

## YAGNI

Cada línea de código es deuda técnica. Antes de escribir código custom: (1) buscar si ya existe en el
proyecto, (2) evaluar si una librería establecida lo resuelve, (3) recién entonces escribir lo mínimo.

Esto no aplica a la estructura de lo que sí se va a construir: aislar un dominio, definir un contrato
entre capas o separar lógica pura de reactividad no son abstracciones especulativas, son la forma de que
lo pedido quede bien hecho. La pregunta no es "¿sería más simple sin esto?" sino "¿esto existe por algo
que ya nos pidieron?".

## TypeScript strict

- `type` sobre `interface` para modelos de dominio.
- `as const` para enums; derivar tipos de las constantes (`(typeof X)[keyof typeof X]`).
- Sin `any` — usar `unknown` + narrowing.
- Sin `@ts-ignore`.

## Errores

- Ningún `catch` vacío.
- Fallo de red → feedback visible al usuario. Fallo de servidor → mensaje legible, no el error crudo.
- Sin `console.log` de debug en código que se mergea.

## Naming

- Archivos: kebab-case.
- Componentes: PascalCase.
- Composables: `useAlgo`.
- Constantes: `SCREAMING_SNAKE_CASE`.
- Tipos: PascalCase.
- Funciones: camelCase.
- Named exports sobre default exports.

## Componentes Vue, mínimo

- Siempre `<script setup lang="ts">`.
- `computed()` sobre métodos para estado derivado.
- Presentacionales — la lógica de negocio vive en composables, no en el componente.

Para extracción, umbrales de tamaño y arquitectura de composables (incluyendo estado local vs.
compartido, cuándo usar `useState()` vs. `ref()`), ver `vue-composition` — ahí vive la auditoría de salud
de archivos que aplica antes de tocar cualquier `.vue` o composable.

## Al terminar

Correr `npx nuxi typecheck` — cero errores es el mínimo, no una aspiración.
