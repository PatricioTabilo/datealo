import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

// Clave primaria natural, no uuid — T-001 de la misión 03 (docs/missions/03-taxonomia-categorias-y-comunas).
export const categorias = pgTable('categorias', {
  slug: text('slug').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(true),
})
