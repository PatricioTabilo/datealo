import { index, integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { categorias } from './categorias'
import { professionals } from './professionals'

export const professionalCategorias = pgTable(
  'professional_categorias',
  {
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'cascade' }),
    categoriaSlug: text('categoria_slug')
      .notNull()
      .references(() => categorias.slug, { onUpdate: 'cascade' }),
    priceFrom: integer('price_from'),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    primaryKey({ columns: [table.professionalId, table.categoriaSlug] }),
    // Postgres no indexa una FK automáticamente, y esta es la columna por la que filtra
    // /api/search — la superficie de más tráfico esperado.
    index('professional_categorias_categoria_slug_idx').on(table.categoriaSlug),
  ],
)
