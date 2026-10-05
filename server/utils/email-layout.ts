// Estilos inline y tablas en vez de CSS moderno: Gmail descarta <style> en varios clientes y Outlook no
// entiende flex ni grid. El único <style> es la media query de celular, que si se pierde deja la versión
// de escritorio, igual legible.
const COLORS = {
  primary: '#423ED0',
  accent: '#3ECBD7',
  text: '#1F2937',
  muted: '#6B7280',
  background: '#F3F4F6',
  callout: '#F0EFFA',
  border: '#E5E7EB',
  starFilled: '#F59E0B',
  starEmpty: '#D1D5DB',
} as const

// Google Fonts solo carga en Apple Mail y algunos clientes más; el resto cae a la fuente del sistema.
const HEADING_FONT = `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
const BODY_FONT = `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

export type EmailLayoutInput = {
  title: string
  preheader: string
  heading: string
  bodyHtml: string
  cta: { label: string, url: string }
  afterCtaHtml?: string
  footerNote: string
}

export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;">${html}</p>`
}

export function emailMutedParagraph(html: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${html}</p>`
}

export function emailNote(html: string): string {
  return `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${COLORS.muted};">${html}</p>`
}

export function emailCallout(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;background:${COLORS.callout};border-radius:12px;">
  <tr><td style="padding:18px 20px;font-size:15px;line-height:1.6;color:${COLORS.text};">${html}</td></tr>
</table>`
}

export function emailCheckItem(text: string): string {
  return `<span style="color:${COLORS.primary};font-weight:700;">✓</span>&nbsp; ${text}`
}

export function emailStars(rating: number): string {
  return `<div role="img" aria-label="${rating} de 5 estrellas" style="font-size:22px;letter-spacing:3px;line-height:1;">`
    + `<span style="color:${COLORS.starFilled};">${'★'.repeat(rating)}</span>`
    + `<span style="color:${COLORS.starEmpty};">${'★'.repeat(5 - rating)}</span></div>`
}

export function emailLinkFallback(url: string): string {
  return `<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${COLORS.border};font-size:13px;line-height:1.6;color:${COLORS.muted};">
  ¿El botón no funciona? Copia y pega este enlace en tu navegador:<br>
  <a href="${url}" style="color:${COLORS.primary};word-break:break-all;">${url}</a>
</p>`
}

// Todo el texto que llega acá ya viene escapado por quien arma el correo: el layout inserta HTML tal cual.
export function renderEmailLayout({ title, preheader, heading, bodyHtml, cta, afterCtaHtml = '', footerNote }: EmailLayoutInput): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Plus+Jakarta+Sans:wght@800&display=swap" rel="stylesheet">
<style>
  @media (max-width: 480px) {
    .card { padding: 28px 22px !important; border-radius: 0 !important; }
    .outer { padding: 20px 0 24px !important; }
    .brand, .foot { padding-left: 22px !important; padding-right: 22px !important; }
    .btn { width: 100% !important; }
    .btn a { display: block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.background};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.background};">
  <tr><td class="outer" align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
      <tr><td class="brand" style="padding:0 4px 20px;font-family:${HEADING_FONT};font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1;">
        <span style="color:${COLORS.primary};">datea</span><span style="color:${COLORS.accent};">lo</span>
      </td></tr>
      <tr><td class="card" style="background:#FFFFFF;border-radius:16px;padding:36px 36px 32px;font-family:${BODY_FONT};color:${COLORS.text};">
        <h1 style="margin:0 0 16px;font-family:${HEADING_FONT};font-size:24px;line-height:1.3;font-weight:800;color:${COLORS.text};">${heading}</h1>
        ${bodyHtml}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn" style="margin:28px 0 0;">
          <tr><td style="border-radius:12px;background:${COLORS.primary};text-align:center;">
            <a href="${cta.url}" style="display:inline-block;padding:15px 28px;font-family:${BODY_FONT};font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:12px;">${cta.label}</a>
          </td></tr>
        </table>
        ${afterCtaHtml}
      </td></tr>
      <tr><td class="foot" style="padding:24px 4px 0;font-family:${BODY_FONT};font-size:13px;line-height:1.6;color:${COLORS.muted};">
        ${footerNote}<br>
        Datealo · Encuentra al profesional que necesitas, cerca de ti.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
