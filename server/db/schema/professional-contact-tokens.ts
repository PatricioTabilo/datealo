import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'
import { professionals } from './professionals'

// Nace siempre en la misma request que un professional_contact_events — nunca se escribe por separado,
// así un token solo existe atado a un contacto real. (professionalId, token) como PK compuesta: es la
// única unicidad real de esta tabla, no hace falta un id propio.
export const professionalContactTokens = pgTable(
  'professional_contact_tokens',
  {
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'restrict' }),
    token: uuid('token').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [primaryKey({ columns: [table.professionalId, table.token] })],
)
