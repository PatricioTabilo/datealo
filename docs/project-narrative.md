# Narración para documentación de proyecto

Esta convención rige la prosa de la documentación de Datealo:

- Documentos de misión (`docs/missions/`) y planes de implementación.
- La descripción de un PR y el cuerpo de un issue.
- Los mensajes de commit.
- La documentación `.md` de un módulo, READMEs incluidos.

Es documentación para alinear, decidir, ejecutar y volver a consultar después. Por eso debe optimizarse
para tres modos de lectura:

- **Lectura rápida:** entender en pocos minutos qué pasa, qué se decidió y qué falta.
- **Lectura profunda:** entender contexto, trade-offs, riesgos y criterios detrás de la propuesta.
- **Consulta futura:** volver semanas o meses después y recordar por qué se tomó una decisión.

En los documentos de misión el documento además es vivo: muestra las decisiones tomadas, las que faltan
por tomar, en qué se está trabajando y el estado actual.

El anti-patrón típico de un agente es escribir como si todo tuviera la misma importancia: una muralla de
contexto, detalles técnicos, alternativas, riesgos y pendientes sin jerarquía. La solución no es "hacerlo
más bonito", sino imponer una arquitectura narrativa.

La estructura ya viene dada por el artefacto: las secciones del template de misión, el cuerpo del commit
o las secciones del README. El trabajo tiene dos partes: ubicar cada pieza de información en el lugar que
le corresponde y presentarla de forma clara y jerárquica.

No toda la información vive en el mismo lugar. Una misma decisión puede enunciarse en la descripción del
PR y detallarse en el documento de la misión. Cada aparición se presenta según lo que ese lugar necesita.

Si el artefacto tiene convenciones propias (por ejemplo, la convención de commits de `CLAUDE.md`), esas
mandan en lo que choquen con esta.

## Reglas

1. **Jerarquiza: primero la idea principal, después el detalle**

   Orden recomendado: qué es lo más importante que el lector debe entender, por qué importa, qué detalles
   lo sostienen, qué consecuencia o pregunta queda abierta. Si hay que leer cinco párrafos antes de llegar
   al punto, está mal ordenado.

2. **Usa encabezados informativos, no genéricos**

   Que el subtítulo lleve el mensaje, no solo el tema. "El problema aparece cuando el cliente no sabe si
   el profesional va a llegar" comunica más que "Contexto". "Riesgos: duplicar la lógica de distancia y
   acoplar la búsqueda a Santiago" comunica más que "Riesgos".

3. **Separa hechos, decisiones, hipótesis y pendientes**

   No mezcles información confirmada con supuestos en el mismo párrafo, ni escondas preguntas abiertas
   dentro de prosa larga. En un producto pre-lanzamiento esto importa el doble: casi todo lo que sabemos
   del usuario es hipótesis, y el documento tiene que decir cuál es cuál.

4. **Escribe con trazabilidad**

   Al presentar una decisión, deja clara la cadena: contexto, criterio usado, alternativas o tensiones,
   decisión, consecuencia práctica. Evita "se recomienda hacer X" sin el criterio detrás: la documentación
   debe sobrevivir al contexto oral.

5. **No documentes todo lo investigado**

   Incluye información solo si ayuda a entender el problema, tomar una decisión, ejecutar, identificar
   riesgos o consultar el contexto después. Lo correcto pero inútil para esos fines se resume, se mueve a
   un anexo o se elimina.

6. **Ajusta la profundidad a la importancia del punto**

   Un punto simple se explica en 1 o 2 frases. Uno con impacto relevante, en un párrafo breve. Una
   decisión, trade-off, riesgo o cambio de comportamiento se desarrolla. No sobreexpliques lo obvio para
   que el documento parezca completo.

7. **Párrafos para causalidad, bullets para escanear**

   Párrafos para explicar por qué algo importa, cómo una causa genera un problema, qué trade-off se acepta
   o por qué se descarta una alternativa. Bullets para información comparable: criterios, riesgos, casos,
   dependencias, restricciones, pendientes. Un bullet de muchas líneas probablemente es un párrafo.

8. **Cierra cada bloque importante con una consecuencia**

   "Esto implica que…", "Por eso la primera entrega debe limitarse a…", "La decisión pendiente es…". No
   cierres un bloque con datos sueltos que no dicen qué entender o hacer.

9. **Evita la ambigüedad operativa**

   En vez de "se debería revisar" o "hay que considerar algunos casos", especifica qué hay que revisar,
   quién debería resolverlo, qué impacto tiene, qué decisión depende de eso y qué pasa si no se resuelve.

10. **Mantén una voz profesional, directa y humana**

    Escribe como una persona senior explicando el proyecto a otro equipo. Evita el tono burocrático ("El
    presente documento tiene por objetivo…", "Cabe destacar que…"). Prefiere lo directo ("El problema
    aparece cuando…", "La recomendación es…", "Para avanzar, falta resolver…").

## Formato y presentación

El criterio de fondo es cómo se visualiza la información, no una checklist mecánica. Las listas y los
títulos son anclas para texto corto; el detalle largo va en prosa. Un contenido correcto pero mal
maquetado se lee igual de mal que uno desordenado.

1. **Las listas y los títulos son para texto corto**

   Un ítem de lista, un sub-bullet o un título debe caber en 2 líneas; un párrafo, en 4 líneas. Si el
   contenido no cabe, no lo aprietes: pásalo al formato que sí lo sostiene.

   - Si el título y su detalle son cortos, pueden ir en la misma línea separados por ":".
   - Si el detalle es largo, el título queda solo en su línea y el detalle baja como párrafo, o como
     sub-bullets si son varios ítems cortos.

2. **Párrafos de máximo 4 líneas**

   Más que eso se lee como un saco de palabras. Si tienes más, parte en dos párrafos separados por una
   línea en blanco, cada uno con una idea.

3. **Líneas de máximo 120 caracteres, espacios incluidos**

4. **Una idea por frase; no encadenes con punto y coma**

   El ";" que empalma varias ideas no facilita la lectura, solo esconde que son ideas distintas.

   - Mal: "...renombra el composable y reordena las secciones; el resto no cambia."
   - Bien: "...renombra el composable y reordena las secciones. El resto no cambia."

5. **Niveles legibles, anidación máxima de 3**

   Que se distinga a simple vista en qué nivel está cada ítem. No mezcles lista numerada y lista con
   bullets en el mismo nivel.

6. **Si no puedes agregar algo sin quebrar una regla, sube el scope de la revisión**

   El problema casi nunca es de formato. Antes de forzar un cuarto nivel o un párrafo de seis líneas:
   ¿estás agregando demasiado detalle?, ¿ese detalle va en otra sección?, ¿hay un nivel intermedio que
   aporta poco y cuyo contenido se puede repartir u omitir?

## Antes de entregar

Revisa cada sección como lo haría un lector que no estuvo en la conversación:

- ¿La primera frase orienta al lector?
- ¿Se distingue lo confirmado de lo pendiente, y lo observado de lo supuesto?
- ¿Hay demasiado detalle antes de la idea principal?
- ¿La sección cierra con una consecuencia clara?
- ¿Alguien podría entenderla sin haber estado en la conversación, y volver en un mes a entender por qué
  quedó escrita así?
- ¿Algún ítem de lista o título arrastra un detalle largo que debería ser párrafo?
- ¿Hay párrafos de más de 4 líneas, o frases encadenadas con ";"?
- ¿Alguna línea pasa de 120 caracteres?

Si una sección solo acumula información correcta pero no ayuda a entender, decidir o ejecutar, reescríbela.

## Regla de oro

La documentación de proyecto no cuenta todo lo que se investigó. Explica lo suficiente para que otra
persona entienda el problema, confíe en la dirección tomada y pueda ejecutar o revisar la decisión después.

Cuando exista más detalle (en otra sección, un anexo o un documento enlazado), la narración guía hacia él
en lugar de exponerlo todo de entrada.
