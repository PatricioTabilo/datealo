export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  const [professional, reviewsSummary] = await Promise.all([
    findPublicProfessionalProfile(id),
    findReviewsForProfessional(id),
  ])

  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { professional: { ...professional, ...reviewsSummary } }
})
