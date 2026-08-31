import { sql } from 'drizzle-orm'
import { check, foreignKey, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { professionalContactTokens } from './professional-contact-tokens'
import { professionals } from './professionals'

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'restrict' }),
    // Nunca sale en una respuesta pública — es el secreto de correlación con
    // professional_contact_tokens, no un dato de la reseña.
    token: uuid('token').notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    // NULL cuando quedó en blanco — el reemplazo por "un cliente de Datealo" ocurre al leer
    // (resolveReviewerName), no acá, para no tener que hacer un backfill si el copy cambia.
    name: text('name'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    // Un dispositivo (token) mantiene como máximo una reseña vigente por profesional.
    unique('reviews_professional_id_token_key').on(table.professionalId, table.token),
    // Sin esto, una reseña podría sobrevivir a un token que ya no existe en ningún lado y seguir
    // mostrándose "verificada por contacto" con la prueba ya desaparecida.
    foreignKey({
      columns: [table.professionalId, table.token],
      foreignColumns: [professionalContactTokens.professionalId, professionalContactTokens.token],
      name: 'reviews_professional_id_token_fk',
    }).onDelete('restrict'),
    check('reviews_rating_check', sql`${table.rating} between 1 and 5`),
    // char_length(NULL) es NULL, y NULL satisface cualquier check — un comentario ausente no choca.
    check('reviews_comment_length_check', sql`char_length(${table.comment}) <= 500`),
  ],
)
