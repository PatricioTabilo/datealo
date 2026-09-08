export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const categoriaSlug = getRouterParam(event, 'slug') ?? ''

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const result = await removeProfessionalCategoria(professional.id, categoriaSlug)
  if (result === 'not_found') {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }
  if (result === 'last_category') {
    setResponseStatus(event, 409)
    return { error: 'last_category' }
  }

  return result
})
