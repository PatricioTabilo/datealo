import { boolean, pgTable, text } from 'drizzle-orm/pg-core'

export const comunas = pgTable('comunas', {
  // codigo es la clave primaria: ya es el identificador oficial y estable de la comuna (Decreto Exento
  // Nº 817, SUBDERE), no hace falta inventar un uuid encima.
  codigo: text('codigo').primaryKey(),
  nombre: text('nombre').notNull(),
  activa: boolean('activa').notNull().default(false),
})
