export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  const body = await readBody(event).catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''

  const [exists, verified] = await Promise.all([professionalExists(id), hasContactToken(id, token)])

  if (!exists) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  // Nunca se publica una reseña sin verificar primero que el token corresponde a un contacto real.
  if (!verified) {
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

  const [review, professional] = await Promise.all([
    upsertReview(id, token, { rating, comment, name }),
    findProfessionalNotificationInfo(id),
  ])

  // Sin email guardado (perfiles de antes de esta columna) o si sendEmail() falla, la reseña ya quedó
  // publicada igual — event.waitUntil evita que el aviso demore la respuesta, y el catch evita que un
  // fallo de Resend la haga fallar.
  if (professional?.email) {
    const { subject, html } = buildReviewNotificationEmail({
      displayName: professional.displayName,
      reviewerName: name,
      rating: review.rating,
      comment: review.comment,
      profileUrl: `${getRequestURL(event).origin}/profesionales/${id}`,
    })
    event.waitUntil(sendEmail({ to: professional.email, subject, html }).catch(() => {}))
  }

  return { review }
})
