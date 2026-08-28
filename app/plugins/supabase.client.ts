import { createBrowserClient } from '@supabase/ssr'

// Auth es lo único que el browser habla directo con Supabase, sin pasar por /api/. createBrowserClient
// (no createClient de @supabase/supabase-js) deja la sesión en una cookie que el servidor sabe leer,
// no en localStorage.
export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig()
  const supabase = createBrowserClient(pub.supabaseUrl, pub.supabaseKey)
  return { provide: { supabase } }
})
