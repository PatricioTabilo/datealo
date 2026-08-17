# Misión: taxonomía de categorías y comunas — Investigación

**Estado:** activo

**Última actualización:** 2026-08-17

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando no existe una lista única de la que todos parten

**Situación:** don Héctor es electricista y se está por registrar en Datealo (misión 04, todavía en
exploración). El formulario le pide elegir su oficio y su comuna. Al mismo tiempo, alguien en Ñuñoa abre el
buscador (misión 06, también en exploración) y escribe "electricista".

**Acción o necesidad:** ambos formularios — el de registro y el de búsqueda — necesitan la misma lista de
oficios y la misma lista de comunas para poder cruzarse. Hoy esa lista no existe en ningún lado: la landing
tiene ocho categorías ilustrativas (`app/constants/landing.ts`) pensadas para verse bien en un carrusel, no
para ser el catálogo con el que un profesional se registra.

**Respuesta actual:** sin lista, cada misión que toque el dato inventa la suya. Es lo que ya casi pasó una
vez: la misión 02 mencionó "categorías de oficio" y "comunas disponibles" como algo que todavía no existía
formalmente, y las siguientes (04 registro, 06 búsqueda) iban a tener que decidirlo cada una por su cuenta
si esta misión no se abría primero.

**Consecuencia:** don Héctor se registra bajo "Instalaciones eléctricas" en la comuna "Región
Metropolitana" porque el formulario de la misión 04 usó su propia lista de texto libre. La persona de
Ñuñoa busca "electricista" en "Ñuñoa" con el formulario de la misión 06, que usó otra lista. No matchean.
Don Héctor existe en la base de datos y es invisible para la única persona que lo estaba buscando esa
noche.

## Preguntas que la investigación debe resolver

- ¿Qué tan granular tiene que ser una categoría para que un chileno se reconozca en ella sin dudar —
  "gasfitería" o "reparación de cañerías"?
- ¿Cuántas categorías cubrir en el lanzamiento sin que la mayoría queden con cero profesionales?
- ¿Cuál es la unidad geográfica con la que la gente ya piensa su búsqueda — comuna, barrio, "cerca de mí"?
- ¿El lanzamiento parte solo en la Región Metropolitana, o hace falta cubrir más desde el día uno?

## Evidencia

| ID    | Tipo         | Fuente                 | Hecho verificable | Límite de la evidencia |
| ----- | ------------ | ----------------------- | ------------------ | ----------------------- |
| E-001 | código       | `app/constants/landing.ts` | La landing ya usa 8 categorías: Gasfitería, Electricidad, Peluquería, Limpieza, Mudanzas, Pintura, Cerrajería, Jardinería | Elegidas por el fundador para verse bien en un carrusel, sin encuesta ni dato de demanda real |
| E-002 | benchmark    | [Thumbtack Services](https://www.thumbtack.com/more-services), [Thumbtack Engineering](https://medium.com/thumbtack-engineering/building-multi-category-search-results-616bee77a564) | Thumbtack opera con más de 1.000 microcategorías (ej. "Radon Mitigation", "Fitness Equipment Assembly") sobre un motor de búsqueda y matching por texto libre | Escala de EE.UU. con millones de profesionales; una lista así de granular en un catálogo que un humano recorre a mano, con oferta cero al lanzamiento, garantiza casi todas las categorías vacías |
| E-003 | benchmark    | [TaskRabbit Services](https://www.taskrabbit.com/services) | TaskRabbit opera con un puñado de categorías amplias: Cleaning, Handyman, Moving, Mounting, Yard Work, Errands | No distingue oficios que en Chile son roles profesionales separados — un gasfiter y un electricista no caben los dos en "Handyman" sin perder la palabra que la gente realmente usa |
| E-004 | benchmark    | [Yapo.cl — aseo del hogar](https://www.yapo.cl/paginas/servicios/aseo-hogar), [Yapo.cl — servicio doméstico](https://www.yapo.cl/paginas/trabajos/servicio-domestico) | El clasificado chileno más usado para este tipo de oferta organiza el hogar bajo nombres de oficio en español chileno — "aseo del hogar", "asesora del hogar" — no en inglés ni en jerga de marketplace | Yapo mezcla empleo de planta (nana, asesora del hogar full-time) con trabajos puntuales por oficio; Datealo es solo lo segundo |
| E-005 | observación  | `app/constants/landing.ts` (copy de la landing) | El copy ya asume la comuna como unidad de búsqueda: "Gasfiter en Providencia", "Cerrajero urgente en Ñuñoa", "Mudanza dentro de Santiago" | Es intuición de producto ya congelada en copy de marketing, no algo validado con un buscador real |
| E-006 | dato oficial | [SUBDERE — división político-administrativa](https://www.subdere.gov.cl/sites/default/files/documentos/articles-73111_recurso_1.pdf), [Wikipedia — comunas de Chile](https://es.wikipedia.org/wiki/Anexo:Comunas_de_Chile) | Chile tiene 346 comunas en 16 regiones. La Región Metropolitana tiene 52 comunas en 6 provincias; la Provincia de Santiago (Gran Santiago urbano) tiene 32: Santiago, Cerrillos, Cerro Navia, Conchalí, El Bosque, Estación Central, Huechuraba, Independencia, La Cisterna, La Florida, La Granja, La Pintana, La Reina, Las Condes, Lo Barnechea, Lo Espejo, Lo Prado, Macul, Maipú, Ñuñoa, Pedro Aguirre Cerda, Peñalolén, Providencia, Pudahuel, Quilicura, Quinta Normal, Recoleta, Renca, San Joaquín, San Miguel, San Ramón, Vitacura | Es geografía administrativa oficial — no dice nada sobre dónde va a haber demanda real de gasfiter o electricista en Datealo |

## Conclusiones

<a id="c-001"></a>

### C-001 — La categoría es el oficio, no la microtarea ni una etiqueta genérica

- **Sustento:** [E-001](#e-001), [E-002](#e-002), [E-003](#e-003), [E-004](#e-004).
- **Razonamiento:** con oferta cero al lanzamiento, una taxonomía de 1.000 microcategorías al estilo
  Thumbtack garantiza que casi todas queden vacías; una taxonomía de 6 etiquetas genéricas al estilo
  TaskRabbit borra la palabra exacta que un chileno usa para pedir ayuda ("gasfiter" no es "handyman"). El
  copy de la propia landing y el vocabulario de Yapo.cl ya coinciden en que la unidad natural es el nombre
  del oficio, en un solo nivel, sin jerarquía de subcategorías.
- **Implicación:** la lista de categorías del lanzamiento tiene que ser corta, plana (sin subcategorías) y
  en el lenguaje de oficio que ya usa la landing — "Gasfitería", no "Reparación de cañerías y filtraciones".
- **Confianza:** media, porque se apoya en benchmarks y en copy ya escrito por el propio equipo, no en
  entrevistas a un buscador real pidiendo ayuda.

<a id="c-002"></a>

### C-002 — La comuna es la unidad geográfica de búsqueda, no la dirección exacta ni la región completa

- **Sustento:** [E-005](#e-005), [E-006](#e-006).
- **Razonamiento:** la comuna es la unidad con la que la gente ya se identifica y busca ("gasfiter en
  Providencia"), y es lo bastante fina para ordenar por cercanía sin exponer la dirección exacta de nadie
  — coherente con que Datealo nunca muestra un dato de contacto sin que el profesional lo autorice.
- **Implicación:** el modelo de datos necesita una lista cerrada de comunas, no un campo de texto libre. La
  Provincia de Santiago (las 32 comunas del Gran Santiago) es el candidato natural para arrancar, porque es
  donde probablemente concentra oferta y demanda inicial — pero esto es hipótesis, no dato propio.
- **Confianza:** media — que la comuna sea el grano correcto está bien sustentado; cuántas comunas cubrir
  al lanzamiento todavía no tiene dato propio detrás.

<a id="c-003"></a>

### C-003 — Cubrir toda la Región Metropolitana o más de una región al lanzamiento arriesga vaciar casi
todas las combinaciones categoría × comuna

- **Sustento:** [E-006](#e-006), el filtro de "arranque en frío" del skill `discovery-product`.
- **Razonamiento:** con una oferta inicial probablemente de decenas de profesionales, repartirla entre 52
  comunas de la RM (o más, con una segunda región) deja casi cada cruce categoría × comuna en cero
  resultados — el peor estado posible, peor que no cubrir la comuna directamente.
- **Implicación:** el ideal de cobertura total de Chile se recorta en `producto.md` a un subconjunto chico
  de comunas de alta densidad para el lanzamiento, con una condición explícita de cuándo se amplía.
- **Confianza:** media — es una aplicación directa del filtro de arranque en frío, sin evidencia externa
  nueva propia de Datealo.

## El ideal: cualquier oficio, en cualquier comuna de Chile, encontrado con las palabras propias del buscador

### El resultado ideal se ve así

Alguien en Curicó escribe "el que arregla el portón eléctrico" y Datealo lo entiende como "Electricidad".
Alguien en Ñuñoa escribe "una peluquera para las once" y llega a "Peluquería". Cualquiera de las 346
comunas de Chile tiene la posibilidad de tener profesionales registrados — ninguna queda excluida por
diseño del modelo de datos. Si en Melipilla no hay ningún gasfiter todavía, Datealo lo dice y ofrece los más
cercanos de las comunas vecinas con su distancia, en vez de un estado vacío sin salida.

### Capacidades del ideal

| Capacidad                    | Acción habilitada                                              | Respuesta esperada                                                   | Conclusión que la justifica |
| ----------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| Categoría por nombre de oficio | El buscador escribe el oficio con sus propias palabras           | Datealo lo mapea a la categoría correcta aunque no use el término exacto | [C-001](#c-001)             |
| Comuna como unidad de búsqueda | El buscador ve resultados de su comuna primero                   | Si no hay oferta ahí, ve comunas vecinas marcadas con su distancia      | [C-002](#c-002)             |
| Cobertura geográfica total     | Cualquier comuna de Chile puede tener profesionales registrados  | Ninguna comuna queda estructuralmente excluida del modelo de datos      | [C-003](#c-003)             |

### El ideal no significa cubrir todo desde el día uno

- No significa que el lanzamiento tenga que activar las 346 comunas de Chile de partida — el recorte a un
  subconjunto para la primera entrega vive en `producto.md`, no acá.
- No significa una categoría por cada microtarea al estilo Thumbtack — el oficio es la unidad, no la tarea
  puntual dentro de un oficio.

## Referencias

- [Thumbtack — More Services](https://www.thumbtack.com/more-services): usado en E-002 para el tamaño y
  granularidad de su taxonomía.
- [Thumbtack Engineering — Building multi-category search results](https://medium.com/thumbtack-engineering/building-multi-category-search-results-616bee77a564):
  usado en E-002 para confirmar la escala de su catálogo.
- [TaskRabbit — Services](https://www.taskrabbit.com/services): usado en E-003 para el contraste de
  categorías amplias vs. microcategorías.
- [Yapo.cl — Aseo del hogar](https://www.yapo.cl/paginas/servicios/aseo-hogar): usado en E-004 para el
  vocabulario chileno de categorías de servicio al hogar.
- [SUBDERE — División político-administrativa de Chile](https://www.subdere.gov.cl/sites/default/files/documentos/articles-73111_recurso_1.pdf):
  usado en E-006 para el conteo oficial de regiones, provincias y comunas.
- [Wikipedia — Anexo:Comunas de Chile](https://es.wikipedia.org/wiki/Anexo:Comunas_de_Chile): usado en
  E-006 para el conteo total de 346 comunas.
