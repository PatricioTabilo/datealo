// UXF-001: las tres pantallas de V-001 son estados de un solo flujo, no rutas separadas — así el email
// ya escrito sobrevive a un error de formato o a un reenvío sin que el usuario lo vuelva a tipear.
export type MagicLinkStep = 'email' | 'revisa-correo' | 'enlace-invalido'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// "Después de un minuto sin nada" — experiencia.md, UXF-001, Variantes y recuperación.
const RESEND_HINT_DELAY_MS = 60_000

export function useMagicLink() {
  const { $supabase } = useNuxtApp()
  const route = useRoute()

  const step = useState<MagicLinkStep>('magic-link-step', () =>
    route.query.error === 'enlace_invalido' ? 'enlace-invalido' : 'email',
  )
  const email = useState('magic-link-email', () => '')
  const emailError = useState<string | null>('magic-link-email-error', () => null)
  const loading = useState('magic-link-loading', () => false)
  const resendHintVisible = useState('magic-link-resend-hint', () => false)

  let resendHintTimer: ReturnType<typeof setTimeout> | undefined

  function clearResendHintTimer() {
    clearTimeout(resendHintTimer)
    resendHintTimer = undefined
  }

  async function sendLink() {
    const trimmed = email.value.trim()
    if (!EMAIL_REGEX.test(trimmed)) {
      emailError.value = 'Ese correo no parece válido. Falta arroba o dominio, ej: hector@gmail.com.'
      return
    }

    emailError.value = null
    loading.value = true

    try {
      const { error } = await $supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: `${useRequestURL().origin}/auth/confirm` },
      })

      if (error) {
        emailError.value = 'No pudimos enviar el enlace. Intenta de nuevo.'
        return
      }

      step.value = 'revisa-correo'
      resendHintVisible.value = false
      clearResendHintTimer()
      resendHintTimer = setTimeout(() => {
        resendHintVisible.value = true
      }, RESEND_HINT_DELAY_MS)
    } finally {
      loading.value = false
    }
  }

  function startOver() {
    clearResendHintTimer()
    step.value = 'email'
    email.value = ''
    emailError.value = null
    resendHintVisible.value = false
  }

  onUnmounted(clearResendHintTimer)

  return { step, email, emailError, loading, resendHintVisible, sendLink, startOver }
}
