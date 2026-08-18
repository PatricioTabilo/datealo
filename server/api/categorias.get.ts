// Catálogo de referencia, cambia solo a mano (D-001) — cachear la respuesta evita pegarle a la base en
// cada request de cada usuario. maxAge en segundos; swr sirve la versión vieja mientras revalida.
export default defineCachedEventHandler(
  async () => {
    return { categorias: await findActiveCategorias() }
  },
  { maxAge: 60 * 60, swr: true },
)
