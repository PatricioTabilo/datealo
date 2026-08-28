import { createBrowserClient } from '@supabase/ssr'

// Excepción de A-001: Auth es lo único que el browser habla directo con Supabase. createBrowserClient
// (no createClient de @supabase/supabase-js) para que la sesión quede en la cookie que el servidor
// sabe leer, no en localStorage.
export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig()
  const supabase = createBrowserClient(pub.supabaseUrl, pub.supabaseKey)
  return { provide: { supabase } }
})
