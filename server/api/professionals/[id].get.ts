export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const professional = await findPublicProfessionalProfile(id)

  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { professional }
})
