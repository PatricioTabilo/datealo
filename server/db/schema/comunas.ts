import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

export const comunas = pgTable('comunas', {
  // codigo es la clave primaria en vez de un uuid autogenerado — mismo criterio que categorias.ts
  // (T-001): el catálogo es fijo, y este código oficial de comuna (Decreto Exento Nº 817, SUBDERE)
  // ya es único y estable, así que un id interno encima no agregaría nada.
  codigo: text('codigo').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(false),
})
