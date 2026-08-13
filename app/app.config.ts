export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo-datealo',
      secondary: 'turquesa-datealo',
      neutral: 'gray',
      // DaisyUI usaba #10B981 para success. El "emerald" nativo de Tailwind v4 se ve parecido pero
      // no es el mismo hex (OKLCH corrió el tono a #00BC7D) — datealo-success es la escala propia
      // que reproduce el original exacto (main.css).
      success: 'datealo-success',
      // Mismo caso que success: el "red" nativo de Tailwind v4 quedó en #FB2C36, no en el #EF4444
      // que usaba DaisyUI para error.
      error: 'datealo-error',
    },
  },
})
