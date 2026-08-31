type ProfessionalWithReviews = PublicProfessionalProfile & ReviewsSummary

export default defineEventHandler(async (event): Promise<{ professional: ProfessionalWithReviews } | { error: string }> => {
  const id = getRouterParam(event, 'id') ?? ''

  const professional = await findPublicProfessionalProfile(id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const reviewsSummary = await findReviewsForProfessional(id)
  return { professional: { ...professional, ...reviewsSummary } }
})
