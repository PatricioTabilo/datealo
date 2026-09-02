---
paths:
  - "app/**/*.ts"
  - "app/**/*.vue"
  - "server/**/*.ts"
---
# Comentarios

- Antes de escribir un comentario nuevo, o de guardar un archivo donde se tocó uno ya existente, invocar
  el skill `comentarios` y aplicar su test y sus reglas antes de cerrar el edit.
- Si al pasar por un comentario existente (aunque no sea el que estás tocando) no pasa el test del skill,
  corregirlo ahí mismo — ya es la instrucción del skill, se repite acá porque es la condición que dispara
  la invocación.
- Antes de cerrar el edit, si agregaste o tocaste algún comentario, correr
  `grep -nE "T-[0-9]|D-[0-9]|A-[0-9]|TC-[0-9]|UXF-[0-9]|UX-[0-9]|F-[0-9]|TR-[0-9]|CL-[0-9]|V-[0-9]"` sobre
  los archivos modificados. Haber leído el skill al principio no garantiza que el comentario final lo
  cumpla — este grep es lo que lo verifica de verdad.
