import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

export const comunas = pgTable('comunas', {
  // Código oficial de comuna (Decreto Exento Nº 817, SUBDERE) — no un id interno.
  codigo: text('codigo').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(false),
})
