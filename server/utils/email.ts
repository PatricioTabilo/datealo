import { Resend } from 'resend'

type SendEmailInput = {
  to: string
  subject: string
  html: string
}

type SendEmailResult = {
  id: string
}

type ResendCredentials = {
  resendApiKey: string
  emailFrom: string
}

// Segundo parámetro opcional: en producción cae al runtimeConfig real; en tests se pasa
// explícito para no depender del auto-import de Nitro fuera de un contexto Nuxt.
export async function sendEmail(
  { to, subject, html }: SendEmailInput,
  { resendApiKey, emailFrom }: ResendCredentials = useRuntimeConfig(),
): Promise<SendEmailResult> {
  const resend = new Resend(resendApiKey)

  const { data, error } = await resend.emails.send({ from: emailFrom, to, subject, html })

  // El mensaje original de Resend distingue dominio no verificado, rate limit y destinatario
  // inválido — envolverlo en un error genérico borraría esa distinción.
  if (error) {
    throw new Error(error.message)
  }

  return { id: data.id }
}
