export const LANDING_HERO = {
  tagline: 'lo bueno se recomienda',
  headline: 'Deja de buscar en grupos de Facebook.',
  headlineAccent: 'Encuentra profesionales reales, cerca de ti.',
  subheadline: 'datealo conecta a personas con profesionales verificados de su zona. Gasfiter, electricista, peluquera — a un click. Estamos por lanzar.',
  cta: 'Quiero acceso anticipado',
  emailPlaceholder: 'Tu email',
  trust: ['Gratis', 'Sin spam', 'Te avisamos cuando lancemos'],
  heroImage: {
    src: 'https://images.pexels.com/photos/5493672/pexels-photo-5493672.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1100&fit=crop',
    alt: 'Trabajador sonriendo mientras usa un taladro en renovación de hogar',
  },
} as const

export const LANDING_PROBLEM = {
  title: 'Buscar un buen profesional hoy es un caos',
  subtitle: 'Todos hemos pasado por esto. Y siempre termina igual.',
  items: [
    {
      icon: 'MessageCircle' as const,
      color: 'red' as const,
      title: 'El grupo de WhatsApp',
      description: '"¿Alguien cacha un gasfiter bueno?" — 47 respuestas, ninguna confiable, el hilo se perdió entre memes.',
    },
    {
      icon: 'Clock' as const,
      color: 'amber' as const,
      title: 'El maestro fantasma',
      description: 'Te dice que llega a las 10. A las 12 no contesta. La próxima semana tampoco.',
    },
    {
      icon: 'ShieldAlert' as const,
      color: 'orange' as const,
      title: 'La ruleta de la confianza',
      description: 'No sabes si es bueno hasta que ya le pagaste. Y ahí ya es tarde para reclamar.',
    },
    {
      icon: 'Globe' as const,
      color: 'slate' as const,
      title: 'Google y las páginas amarillas',
      description: 'Buscas "gasfiter santiago" y aparecen páginas de 2010 con teléfonos que ya no existen.',
    },
  ],
} as const

export const LANDING_SOLUTION = {
  title: 'Imagina un lugar donde encontrar al profesional correcto es fácil',
  subtitle: 'Eso es datealo. Un buscador de profesionales verificados, con reseñas reales, cerca de ti.',
  features: [
    {
      icon: 'ShieldCheck' as const,
      title: 'Profesionales verificados',
      description: 'Cada profesional pasa por un proceso de verificación. Sabes que es real antes de contactarlo.',
    },
    {
      icon: 'Star' as const,
      title: 'Reseñas de vecinos reales',
      description: 'Opiniones de personas de tu misma zona que ya contrataron el servicio. Sin reseñas inventadas.',
    },
    {
      icon: 'MapPin' as const,
      title: 'Los más cerca de ti',
      description: 'Resultados ordenados por cercanía. El profesional que necesitas puede estar a cuadras de tu casa.',
    },
    {
      icon: 'MessageCircle' as const,
      title: 'Contacto directo',
      description: 'WhatsApp o teléfono, directo con el profesional. Sin intermediarios, sin formularios, sin esperar.',
    },
  ],
} as const

export const LANDING_CATEGORIES = {
  title: '¿Qué estás buscando?',
  subtitle: 'Y muchos más — estamos sumando profesionales cada día',
  items: [
    { icon: 'Wrench' as const, name: 'Gasfitería', query: 'Gasfiter en Providencia', image: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'Zap' as const, name: 'Electricidad', query: 'Electricista para mi depa', image: 'https://images.pexels.com/photos/7859953/pexels-photo-7859953.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'Scissors' as const, name: 'Peluquería', query: 'Peluquera a domicilio', image: 'https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'Sparkles' as const, name: 'Limpieza', query: 'Aseo profundo departamento', image: 'https://images.pexels.com/photos/6195273/pexels-photo-6195273.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'Truck' as const, name: 'Mudanzas', query: 'Mudanza dentro de Santiago', image: 'https://images.pexels.com/photos/7464244/pexels-photo-7464244.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'Paintbrush' as const, name: 'Pintura', query: 'Pintar living y dormitorio', image: 'https://images.pexels.com/photos/5691597/pexels-photo-5691597.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'KeyRound' as const, name: 'Cerrajería', query: 'Cerrajero urgente en Ñuñoa', image: 'https://images.pexels.com/photos/792034/pexels-photo-792034.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
    { icon: 'Flower2' as const, name: 'Jardinería', query: 'Mantención de jardín', image: 'https://images.pexels.com/photos/5231048/pexels-photo-5231048.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop' },
  ],
} as const

export const LANDING_FOR_PROFESSIONALS = {
  headline: '¿Eres profesional y dependes del boca a boca?',
  agitate: 'Tus clientes te buscan, pero no te encuentran. Cada día sin presencia online son clientes que terminan llamando a otro.',
  solution: 'Crea tu perfil en datealo y deja que los clientes lleguen a ti.',
  image: { src: 'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop', alt: 'Profesional de servicios con herramientas de trabajo' },
  benefits: [
    { icon: 'Eye' as const, text: 'Perfil público con fotos de tus trabajos' },
    { icon: 'Star' as const, text: 'Reseñas que construyen tu reputación' },
    { icon: 'Phone' as const, text: 'Clientes de tu zona te contactan directo' },
  ],
  cta: 'Quiero unirme',
  ctaContext: 'Gratis · Menos de 1 minuto',
} as const

export const LANDING_FINAL_CTA = {
  headline: 'No te lo cuenten —',
  headlineAccent: 'datealo',
  subheadline: 'Estamos sumando los mejores profesionales de Chile. Sé de los primeros en probar la plataforma.',
  cta: 'Reservar mi lugar',
  goalGradient: 'Ya estás aquí — solo falta tu email',
  trust: ['Gratis', 'Sin spam', 'Acceso antes que todos'],
} as const
