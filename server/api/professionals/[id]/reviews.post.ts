export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  if (!(await professionalExists(id))) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const body = await readBody(event).catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''

  // F-001: nunca se publica una reseña sin verificar primero que el token corresponde a un contacto real.
  if (!(await hasContactToken(id, token))) {
    setResponseStatus(event, 403)
    return { error: 'not_verified' }
  }

  const rating = body?.rating
  if (!isValidRating(rating)) {
    return badRequest(event, 'invalid_rating')
  }

  const comment = typeof body?.comment === 'string' ? body.comment : undefined
  if (!isValidComment(comment)) {
    return badRequest(event, 'comment_too_long')
  }

  const name = typeof body?.name === 'string' ? body.name : undefined

  const review = await upsertReview(id, token, { rating, comment, name })
  return { review }
})
