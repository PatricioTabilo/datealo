export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const registered = await registerProfessionalContact(id)

  if (!registered) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  setResponseStatus(event, 204)
  return null
})
