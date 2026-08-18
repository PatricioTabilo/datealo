export default defineEventHandler(async () => {
  return { categorias: await findActiveCategorias() }
})
