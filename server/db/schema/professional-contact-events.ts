import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { professionals } from './professionals'

export const professionalContactEvents = pgTable(
  'professional_contact_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // onDelete: 'restrict' — hoy ningún flujo borra un professionals row, así que nunca se ejerce;
    // decidido explícito para no heredar el default silencioso de Postgres el día que sí exista un borrado.
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('professional_contact_events_professional_id_idx').on(table.professionalId),
  ],
)
