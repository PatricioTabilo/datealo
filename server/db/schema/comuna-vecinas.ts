import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { comunas } from './comunas'

// Guarda ambos sentidos de cada par (si A es vecina de B, existe la fila (A, B) y también (B, A)) — así
// buscar las vecinas de una comuna es un select simple por comunaCodigo, sin unir dos columnas. La PK
// compuesta ya cubre ese filtro (comunaCodigo es su columna líder), no hace falta un índice aparte.
export const comunaVecinas = pgTable(
  'comuna_vecinas',
  {
    comunaCodigo: text('comuna_codigo')
      .notNull()
      .references(() => comunas.codigo),
    vecinaCodigo: text('vecina_codigo')
      .notNull()
      .references(() => comunas.codigo),
  },
  table => [primaryKey({ columns: [table.comunaCodigo, table.vecinaCodigo] })],
)
