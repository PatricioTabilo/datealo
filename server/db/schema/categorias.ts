import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

// slug es la clave primaria: ya es el identificador natural y estable de la categoría, no hace falta
// inventar un uuid encima.
export const categorias = pgTable('categorias', {
  slug: text('slug').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(true),
})
