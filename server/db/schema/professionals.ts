import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { categorias } from './categorias'
import { comunas } from './comunas'

export const professionals = pgTable(
  'professionals',
  {
    // id propio, distinto de userId: evita exponer el id de auth.users en la URL pública futura
    // del perfil.
    id: uuid('id').primaryKey().defaultRandom(),
    // Sin foreign key formal a auth.users: esa tabla la gestiona Supabase, no Drizzle.
    userId: uuid('user_id').notNull().unique(),
    displayName: text('display_name').notNull(),
    categoriaSlug: text('categoria_slug')
      .notNull()
      .references(() => categorias.slug, { onUpdate: 'cascade' }),
    comunaCodigo: text('comuna_codigo')
      .notNull()
      .references(() => comunas.codigo),
    contact: text('contact').notNull(),
    description: text('description'),
    priceFrom: integer('price_from'),
    // Paths dentro del bucket professional-photos, nunca URLs completas — la URL pública se
    // calcula al responder, no se guarda.
    photoPaths: text('photo_paths').array().notNull().default([]),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Postgres no indexa una FK automáticamente — son las dos columnas por las que la búsqueda
    // va a filtrar y hacer join.
    index('professionals_categoria_slug_idx').on(table.categoriaSlug),
    index('professionals_comuna_codigo_idx').on(table.comunaCodigo),
  ],
)
