import { describe, expect, it, vi } from 'vitest'

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send } }
  }),
}))

const { sendEmail } = await import('./email')

const credentials = { resendApiKey: 're_test_key', emailFrom: 'noreply@pulze.cl' }

describe('sendEmail', () => {
  it('envía el payload con la forma que espera la API de Resend', async () => {
    send.mockResolvedValueOnce({ data: { id: 'email_123' }, error: null })

    const result = await sendEmail(
      { to: 'destinatario@example.com', subject: 'Asunto', html: '<p>Hola</p>' },
      credentials,
    )

    expect(send).toHaveBeenCalledWith({
      from: 'noreply@pulze.cl',
      to: 'destinatario@example.com',
      subject: 'Asunto',
      html: '<p>Hola</p>',
    })
    expect(result).toEqual({ id: 'email_123' })
  })

  it('propaga el mensaje original cuando el dominio no está verificado', async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: 'validation_error', statusCode: 403, message: 'domain is not verified' },
    })

    await expect(
      sendEmail({ to: 'a@example.com', subject: 's', html: 'h' }, credentials),
    ).rejects.toThrow('domain is not verified')
  })

  it('propaga el mensaje original cuando se excede el rate limit', async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: 'rate_limit_exceeded', statusCode: 429, message: 'Too many requests' },
    })

    await expect(
      sendEmail({ to: 'a@example.com', subject: 's', html: 'h' }, credentials),
    ).rejects.toThrow('Too many requests')
  })

  it('propaga el mensaje original cuando el destinatario es inválido', async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: 'validation_error', statusCode: 422, message: 'Invalid `to` field' },
    })

    await expect(
      sendEmail({ to: 'no-es-un-correo', subject: 's', html: 'h' }, credentials),
    ).rejects.toThrow('Invalid `to` field')
  })
})
