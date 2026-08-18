import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

// slug es la clave primaria en vez de un uuid autogenerado: el catálogo es fijo y chico (8 filas), y
// el slug ya es único y estable por definición — un id sin significado encima solo obligaría a un
// join o un mapeo extra en cada lugar que ya conoce el nombre (T-001).
export const categorias = pgTable('categorias', {
  slug: text('slug').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(true),
})
