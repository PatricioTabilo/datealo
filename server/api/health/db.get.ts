import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const result = await useDb().execute(sql`select 1 as ok`)
  return { ok: result[0]?.ok === 1 }
})
