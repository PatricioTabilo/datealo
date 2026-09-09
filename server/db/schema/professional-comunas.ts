import { index, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'
import { comunas } from './comunas'
import { professionals } from './professionals'

export const professionalComunas = pgTable(
  'professional_comunas',
  {
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'cascade' }),
    comunaCodigo: text('comuna_codigo')
      .notNull()
      .references(() => comunas.codigo),
  },
  table => [
    primaryKey({ columns: [table.professionalId, table.comunaCodigo] }),
    // La PK ya cubre "todas las comunas de un profesional" (professionalId es su columna líder). La
    // búsqueda necesita el sentido contrario: "qué profesionales declararon esta comuna" — sin este
    // índice, /api/search hace seq scan de toda la tabla en cada request.
    index('professional_comunas_comuna_codigo_idx').on(table.comunaCodigo),
  ],
)
