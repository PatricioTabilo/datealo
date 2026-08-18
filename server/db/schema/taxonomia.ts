import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

// Clave primaria natural, no uuid — T-001 de la misión 03 (docs/missions/03-taxonomia-categorias-y-comunas).
export const categorias = pgTable('categorias', {
  slug: text('slug').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(true),
})

export const comunas = pgTable('comunas', {
  // Código oficial de comuna (Decreto Exento Nº 817, SUBDERE) — no un id interno.
  codigo: text('codigo').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(false),
})
