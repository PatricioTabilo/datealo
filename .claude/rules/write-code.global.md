---
paths:
  - "app/**/*.ts"
  - "app/**/*.vue"
  - "server/**/*.ts"
---
# Escribir código

- Antes de escribir o editar cualquier archivo en estos paths, invocar el skill `write-code` (YAGNI,
  TypeScript strict, errores, naming) — no asumir estas reglas de memoria.
- Si el archivo es un `.vue` o un composable, invocar también `vue-composition` para la auditoría de salud
  y la arquitectura de extracción antes de agregar código.
