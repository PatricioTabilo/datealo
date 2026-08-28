export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { professional }
})
