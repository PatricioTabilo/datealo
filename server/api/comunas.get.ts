// Catálogo de referencia, cambia solo a mano (D-002) — cachear la respuesta evita pegarle a la base en
// cada request de cada usuario. maxAge en segundos; swr sirve la versión vieja mientras revalida.
export default defineCachedEventHandler(
  async () => {
    return { comunas: await findActiveComunas() }
  },
  { maxAge: 60 * 60, swr: true },
)
