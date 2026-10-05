// Regenera las plantillas de Supabase Auth en supabase/templates/ a partir del mismo layout que usan los
// correos de Resend, para que todos los correos de Datealo se vean iguales. Supabase no lee estos
// archivos: después de correrlo (`npm run emails:auth`), cada plantilla y su asunto se pegan a mano en el
// dashboard (Authentication → Emails → Templates).

import { mkdirSync, writeFileSync } from 'node:fs'
import { emailLinkFallback, emailMutedParagraph, emailParagraph, renderEmailLayout } from '../server/utils/email-layout'

// Variables de plantilla de Supabase (Go templates), que Supabase reemplaza al enviar. RedirectTo es el
// emailRedirectTo que pasa useMagicLink, ya validado contra la allowlist de redirect URLs del proyecto;
// token_hash y type son los dos parámetros que espera server/routes/auth/confirm.get.ts.
const CONFIRM_URL = '{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email'
// Repite a mano el OTP expiry de Supabase Auth: si ese valor cambia en el dashboard, esta frase también.
const EXPIRY_NOTE = emailMutedParagraph('El enlace funciona una sola vez y vence en 1&nbsp;hora.')

const TEMPLATES = [
  {
    file: 'magic-link',
    subject: 'Tu enlace para entrar a Datealo',
    preheader: 'Toca el botón y entras directo, sin contraseña. El enlace vence en 1 hora.',
    heading: 'Entra a tu perfil',
    bodyHtml: emailParagraph('Toca el botón y entras directo a Datealo, sin contraseña.') + EXPIRY_NOTE,
    ctaLabel: 'Entrar a Datealo',
    footerNote: 'Si no pediste este enlace, ignora este correo. Sin él, nadie puede entrar a tu cuenta.',
  },
  {
    file: 'confirm-signup',
    subject: 'Confirma tu correo para crear tu perfil',
    preheader: 'Un toque y sigues con tu perfil: son 4 datos y quedas publicado.',
    heading: 'Confirma tu correo',
    bodyHtml: emailParagraph(
      'Toca el botón para confirmar que este correo es tuyo. Después completas 4 datos y tu perfil queda publicado en Datealo.',
    ) + EXPIRY_NOTE,
    ctaLabel: 'Confirmar y crear mi perfil',
    footerNote: 'Si no intentaste crear un perfil en Datealo, ignora este correo.',
  },
]

mkdirSync('supabase/templates', { recursive: true })
for (const { file, subject, ctaLabel, ...content } of TEMPLATES) {
  const html = renderEmailLayout({
    ...content,
    title: subject,
    cta: { label: ctaLabel, url: CONFIRM_URL },
    afterCtaHtml: emailLinkFallback(CONFIRM_URL),
  })
  writeFileSync(`supabase/templates/${file}.html`, `${html}\n`)
  console.info(`supabase/templates/${file}.html · asunto: "${subject}"`)
}
