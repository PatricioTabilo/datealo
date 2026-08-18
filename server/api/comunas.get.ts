export default defineEventHandler(async () => {
  return { comunas: await findActiveComunas() }
})
