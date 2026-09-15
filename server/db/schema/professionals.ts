import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const professionals = pgTable('professionals', {
  // id propio, distinto de userId: evita exponer el id de auth.users en la URL pública futura
  // del perfil.
  id: uuid('id').primaryKey().defaultRandom(),
  // Sin foreign key formal a auth.users: esa tabla la gestiona Supabase, no Drizzle.
  userId: uuid('user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  contact: text('contact').notNull(),
  // Copia de auth.users.email al momento del registro, nunca leída en vivo desde ahí — dato interno
  // para el correo de aviso de reseña nueva, jamás parte de la forma pública del profesional.
  email: text('email'),
  // Paths dentro del bucket professional-photos, nunca URLs completas — la URL pública se
  // calcula al responder, no se guarda.
  photoPaths: text('photo_paths').array().notNull().default([]),
  // Un solo path, a diferencia de photoPaths: nunca hay más de una foto de perfil vigente.
  // Mismo bucket y patrón de path que las fotos de trabajo (misión 08).
  avatarPath: text('avatar_path'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
