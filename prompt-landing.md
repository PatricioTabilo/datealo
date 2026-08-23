Eres un experto en marketing digital, copywriting de conversión y diseño frontend senior. Tu trabajo NO es construir una app — es construir una **máquina de captura de leads** que convenza a la gente de dejar su email antes de que el producto exista.

Esta es una página de **WAITLIST PRE-LANZAMIENTO**. No hay producto funcional. No hay buscador. No hay perfiles. La ÚNICA métrica que importa es: **emails capturados**.

---

## Paso 0: Leer skills de marketing (OBLIGATORIO antes de cualquier cosa)

Lee estos archivos COMPLETOS antes de escribir una sola línea de código o copy. Cada uno contiene frameworks que DEBES aplicar:

1. **Marketing Psychology** — Lee `.claude/skills/marketing-psychology/SKILL.md` completo. Aplica estos modelos específicos en la página:
   - **Jobs to Be Done**: El copy vende el JOB ("encontrar un gasfiter confiable en 5 min"), no el producto
   - **Mimetic Desire**: Waitlist = exclusividad. "Otros ya se anotaron" genera deseo
   - **Commitment & Consistency**: Micro-compromiso (email) → mayor probabilidad de usar el producto
   - **Loss Aversion**: "No te quedes fuera" > "Únete gratis"
   - **Goal-Gradient Effect**: "Ya estás aquí — solo falta tu email" para acercar al CTA
   - **Scarcity / Urgency**: Acceso anticipado limitado, no fecha falsa
   - **EAST Framework**: Easy (un campo), Attractive (diseño premium), Social (otros se anotan), Timely (pre-lanzamiento)

2. **Copywriting** — Lee `.claude/skills/copywriting/SKILL.md` completo. Aplica:
   - **AIDA** como estructura macro de la página: Attention (hero) → Interest (problema) → Desire (solución + visión) → Action (waitlist CTA)
   - **PAS** para la sección del problema: Problem → Agitate → Solution
   - **Fórmula de CTA**: [Verbo de acción] + [Qué obtienen] + [Facilidad]. Ej: "Reserva tu acceso — es gratis"
   - **Headline con The Promise o The Question**: "¿Cansado de buscar al weon correcto para arreglar la casa?" o "El profesional que necesitas, a un click"
   - **Emotional triggers**: Frustración (buscar en redes es un caos), esperanza (un lugar confiable), ease (sin esfuerzo)
   - **Objection handling** cerca del CTA: "Sin spam", "Gratis", "Te avisamos cuando lancemos"

3. **Page CRO** — Lee `.claude/skills/page-cro/SKILL.md` completo. Aplica:
   - **Un solo goal de conversión**: email signup. No hay segundo CTA compitiendo
   - **5-second test**: En 5 seg debe quedar claro QUÉ es datealo y POR QUÉ darles tu email
   - **CTA visible above the fold** Y repetido al final
   - **Friction mínima**: UN solo campo (email). Nada de nombre, teléfono, seleccionar categoría
   - **Trust signals**: No stats inventados, pero sí: "Verificaremos a cada profesional", "Tu email está seguro"
   - **Visual hierarchy**: El email input es EL protagonista visual del hero

4. **Content Strategy** — Lee `.claude/skills/content-strategy/SKILL.md`. Aplica:
   - Copy orientado a **búsquedas reales** que haría alguien con el problema: "buscar gasfiter cerca", "encontrar electricista confiable"
   - **Lenguaje del cliente**, no jerga de producto: "profesional" no "proveedor de servicios"

5. **AI SEO** — Lee `.claude/skills/ai-seo/SKILL.md`. Aplica:
   - Contenido **extractable por LLMs**: estructura clara, oraciones declarativas sobre qué es datealo
   - **Schema.org** Organization + WebSite
   - Meta description que responda la query "¿qué es datealo?"

6. **Frontend Design** — Lee `.claude/skills/frontend-design/SKILL.md`. Aplica anti-AI-slop: sin Inter, sin gradientes genéricos, sin layouts predecibles.

7. **UI/UX Pro Max** — Lee `.claude/skills/ui-ux-pro-max/SKILL.md` y ejecuta:
   ```bash
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "waitlist pre-launch landing page service marketplace" --design-system -p "Datealo"
   ```

8. **Web Design Guidelines** — Lee `.claude/skills/web-design-guidelines/SKILL.md` y sigue su instrucción de fetch. Aplícalas como checklist al final.

**NO empieces a implementar hasta haber leído los 8 skills.**

---

## Contexto del producto

**Datealo**: buscador de profesionales y servicios para el hogar en Chile.
Conecta gente que necesita resolver algo (gasfiter, electricista, peluquera, mudanza, limpieza) con profesionales verificados de su zona.

- **Nombre**: datealo (minúscula). Logo: "datea" (blanco) + "lo" (#3ECBD7) sobre fondo #423ED0
- **Tagline**: "lo bueno se recomienda"
- **Estado**: PRE-LANZAMIENTO. No hay producto funcional. Solo waitlist.
- **Target Chile**: Tono cercano, directo, coloquial pero no vulgar. Se puede tutear.
- **Flujo futuro**: buscar → explorar resultados → ver perfil → contactar

---

## Objetivo de la página

| Prioridad | Objetivo | Métrica |
|-----------|----------|---------|
| 1 (único) | Capturar emails para waitlist | # signups |
| 2 (pasivo) | Posicionar marca en la mente | Tiempo en página |
| 3 (pasivo) | SEO fundacional | Indexación + Schema.org |

**Regla CRO #1**: TODO en la página debe llevar al input de email. Si una sección no contribuye a que alguien deje su email, no debería existir.

---

## Estructura persuasiva de la página (AIDA)

La página sigue el framework AIDA como estructura macro. Cada sección tiene un job psicológico:

### 1. HERO — Attention + primer CTA
**Job**: Captar atención en 3 seg, comunicar qué es datealo, y presentar el email input.

- Headline con **The Promise** o **The Question** (copywriting skill)
- Sub-headline que explica en 1 oración qué es datealo
- Tagline "lo bueno se recomienda" como eyebrow text en accent
- **Email input prominente** — este ES el hero, no un buscador
  - Un campo: email
  - Botón CTA: fórmula [Verbo] + [Beneficio] + [Ease]. Ej: "Quiero acceso anticipado"
  - Micro-copy debajo: "Gratis · Sin spam · Te avisamos cuando lancemos"
- Fondo sólido #423ED0, tipografía expresiva
- NO: buscador, stats inventados, gradientes

### 2. PROBLEMA — Interest (PAS: Problem + Agitate)
**Job**: Hacer que el visitante sienta el dolor de buscar profesionales hoy. Generar el "sí, eso me pasa".

- 3-4 situaciones frustrantes reales y reconocibles:
  - Pedir recomendaciones en grupos de Facebook/WhatsApp y recibir 50 respuestas contradictorias
  - Llamar al "maestro" que nunca llega o cobra el doble
  - No saber si un profesional es confiable hasta que ya le pagaste
  - Buscar en Google y encontrar páginas amarillas de 2010
- Tono: empático con un toque de humor chileno (sin forzar)
- **Psychology**: Availability Heuristic (hacer que recuerden la última vez que les pasó), Frustration trigger
- Visual: ilustraciones o iconos que representen el caos, NO stock photos

### 3. SOLUCIÓN + VISIÓN — Desire (PAS: Solution)
**Job**: Mostrar cómo será datealo cuando lance. Pintar el futuro deseable.

- **Jobs to Be Done**: No vendas features, vende outcomes:
  - "Busca → Encontra → Contrata. En 5 minutos."
  - "Profesionales verificados con reseñas reales de tu barrio"
  - "Contacto directo por WhatsApp, sin intermediarios"
- Mostrar 3-4 beneficios como cards o bloques visuales (NO una lista plana):
  - Profesionales verificados ✓
  - Reseñas reales de vecinos ✓
  - Filtro por cercanía (los más cerca de ti) ✓
  - Contacto directo (WhatsApp, teléfono) ✓
- **Mimetic Desire**: Hacer que suene como algo que todos van a querer. "El lugar donde encuentras lo que necesitas" tipo Google Maps pero para oficios
- Visual: Mockup abstracto/estilizado de la futura UI (NO un screenshot funcional — esto es pre-lanzamiento). Puede ser formas geométricas sugiriendo cards de profesionales

### 4. CATEGORÍAS — Desire (refuerzo)
**Job**: Hacer tangible la amplitud del servicio. "Esto cubre lo que YO necesito."

- Bento grid irregular con categorías populares:
  - Gasfitería, Electricidad, Peluquería/Belleza, Mudanzas, Limpieza, Cerrajería, Pintura, Jardinería
- Una categoría highlighted (más grande, fondo primary)
- Iconos lucide, NO emojis
- Micro-copy: "Y muchos más — estamos sumando profesionales cada día"
- **Psychology**: Cuando el visitante ve SU necesidad en la lista, se activa el "esto es para mí"

### 5. PARA PROFESIONALES — Desire (segundo público)
**Job**: Hablar al profesional que también puede estar visitando. Doble captura.

- **PAS mini**:
  - Problem: "¿Eres profesional y dependes del boca a boca o de publicar en redes?"
  - Agitate: "Tus clientes te buscan pero no te encuentran"
  - Solution: "Crea tu perfil en datealo y recibe clientes de tu zona"
- Beneficios para profesionales:
  - Perfil público con fotos de trabajos
  - Reseñas que construyen reputación
  - Clientes que llegan solos buscándote
- CTA secundario: "Registra tu interés como profesional" → mismo form de email con un toggle o radio
- **Psychology**: Loss Aversion ("Cada día sin perfil son clientes que no te encuentran")

### 6. CTA FINAL — Action
**Job**: Último empujón. Repetir el CTA de email para los que scrollearon todo.

- Fondo #423ED0 (repite el ritmo visual del hero)
- Headline de cierre fuerte: tipo "No te lo cuenten — datealo" (juego con el nombre)
- **Repetir el email input** idéntico al hero
- **Objection handling**: 3 micro-cosas: "✓ Gratis", "✓ Sin spam", "✓ Acceso antes que todos"
- **Commitment & Consistency**: Ya leyeron toda la página — el micro-compromiso de dejar el email es coherente
- **Goal-Gradient**: "Ya estás aquí — solo falta tu email"

### 7. FOOTER — Cierre
- Logo datealo
- "lo bueno se recomienda"
- Links: futuro blog, redes sociales (si hay), contacto
- © 2025 datealo

---

## Paleta de marca

| Rol | Hex | Uso |
|-----|-----|-----|
| Primary | #423ED0 | Hero bg, CTA final bg, botón CTA principal |
| Accent | #3ECBD7 | Highlights, hover, eyebrow text, focus rings, botón CTA |
| Background | #FAFAFA | Fondo general secciones claras |
| Surface | #F3F4F6 | Cards, secciones alternas, bento items |
| Text | #1F2937 | Cuerpo de texto sobre fondo claro |
| Text secondary | #6B7280 | Subtítulos, descripciones, micro-copy |
| Text on primary | #FFFFFF | Sobre fondos #423ED0 |
| Success | #10B981 | Checkmarks, confirmación post-signup |

Configurar como tema DaisyUI custom. No usar temas default.

---

## Tipografía

NO usar: Inter, Roboto, Arial, system fonts genéricos.
Elegir combinación con personalidad:
- **Headings**: Plus Jakarta Sans, Outfit, Satoshi, o Clash Display — algo bold y moderno
- **Body**: DM Sans, Outfit, o la misma de headings si funciona en ambos pesos
- Body ≥ 16px, line-height 1.6. Headings tracking -0.02em.

---

## Stack

Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS v4 + DaisyUI v5 + lucide-vue-next

---

## Razonamiento previo (OBLIGATORIO)

Antes de escribir cualquier código, razona en voz alta:

1. **PSICOLOGÍA**: ¿Qué modelos mentales de marketing-psychology aplico en cada sección? Lista al menos 5 y dónde van.
2. **COPY**: ¿Cuál es el pain point #1 del público? ¿Qué headline (PAS o AIDA) lo captura mejor? Escribe 3 opciones de headline y elige la mejor justificando.
3. **CRO**: ¿Cómo aseguro que el email input sea lo más prominente de la página? ¿Pasa el 5-second test?
4. **DISEÑO**: ¿Cómo creo ritmo visual sin que parezca un template de Framer? ¿Dónde uso fondo primary, dónde blanco, dónde surface?
5. **ANTI-PATRONES**: Lista 3 decisiones que descartaste y por qué se verían genéricas o de IA.
6. **ACCESIBILIDAD**: ¿#3ECBD7 pasa contraste 4.5:1 sobre blanco? (No — planifica dónde SÍ y dónde NO usarlo como texto).
7. **EMOCIONES**: ¿Qué emoción dominante quiero en cada sección? (Hero: esperanza/curiosidad, Problema: frustración/reconocimiento, Solución: alivio/deseo, CTA: urgencia/FOMO)

Después del razonamiento, implementa.

---

## Ejemplos de calidad esperada vs rechazada

### HERO WAITLIST — Rechazado ❌

```html
<!-- Genérico: centrado, sin emoción, buscador que no funciona -->
<section class="bg-gradient-to-r from-purple-600 to-blue-500 text-center py-20">
  <span class="badge">⭐ Trusted by 10,000+ users</span>
  <h1 class="text-4xl font-bold">Find the best professionals</h1>
  <p class="text-lg">Search, compare, and hire top-rated pros near you</p>
  <input placeholder="Search for a service..." class="input" />
</section>
```

Problemas: gradiente genérico, stats inventados, BUSCADOR (no hay producto), inglés, sin emoción, layout predecible, sin copy persuasivo, sin urgencia de waitlist.

### HERO WAITLIST — Aceptado ✅

```html
<section class="bg-[#423ED0] min-h-[85vh] relative overflow-hidden">
  <div class="max-w-5xl mx-auto px-6 pt-28 pb-20 flex flex-col items-start gap-8">
    <p class="text-[#3ECBD7] font-semibold tracking-wide text-sm uppercase">
      lo bueno se recomienda
    </p>
    <h1 class="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl">
      Deja de buscar en grupos de Facebook.<br />
      <span class="text-[#3ECBD7]">Encuentra profesionales reales, cerca de ti.</span>
    </h1>
    <p class="text-white/80 text-lg max-w-xl leading-relaxed">
      datealo conecta a personas con profesionales verificados de su zona.
      Gasfiter, electricista, peluquera — a un click. Estamos por lanzar.
    </p>
    <form class="flex flex-col sm:flex-row gap-3 w-full max-w-lg mt-4">
      <input
        type="email"
        required
        placeholder="Tu email"
        class="flex-1 py-4 px-6 rounded-2xl text-lg bg-white/95 text-gray-800
               placeholder:text-gray-400 focus:outline-none focus:ring-2
               focus:ring-[#3ECBD7] shadow-xl"
      />
      <button
        type="submit"
        class="bg-[#3ECBD7] text-[#1F2937] font-bold py-4 px-8 rounded-2xl
               text-lg hover:bg-[#35b5c0] transition-colors shadow-lg
               whitespace-nowrap"
      >
        Quiero acceso anticipado
      </button>
    </form>
    <p class="text-white/50 text-sm">
      Gratis · Sin spam · Te avisamos cuando lancemos
    </p>
  </div>
</section>
```

Aciertos: color sólido (no gradiente), copy con dolor real (Facebook groups), headline en español chileno, email input (NO buscador), CTA con verbo + beneficio, micro-copy que maneja objeciones (gratis, sin spam), sin stats inventados, tagline como eyebrow, text-left (no centrado genérico).

### SECCIÓN PROBLEMA — Rechazado ❌

```html
<section class="py-16 text-center">
  <h2>Why choose us?</h2>
  <div class="grid grid-cols-3 gap-4">
    <div class="card">✅ Verified professionals</div>
    <div class="card">✅ Best prices</div>
    <div class="card">✅ Fast service</div>
  </div>
</section>
```

Problemas: NO hay sección de problema. Va directo a solución. Sin empatía. Sin PAS. Inglés. Beneficios genéricos. Checkmarks de marketing vacío.

### SECCIÓN PROBLEMA — Aceptado ✅

```html
<section class="bg-[#FAFAFA] py-20 lg:py-28">
  <div class="max-w-4xl mx-auto px-6">
    <h2 class="text-[#1F2937] text-3xl lg:text-4xl font-bold mb-4">
      Buscar un buen profesional hoy es un caos
    </h2>
    <p class="text-[#6B7280] text-lg mb-12 max-w-2xl">
      Todos hemos pasado por esto. Y siempre termina igual.
    </p>
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
          <MessageCircle class="w-6 h-6 text-red-400" />
        </div>
        <h3 class="font-semibold text-[#1F2937] mb-2">El grupo de WhatsApp</h3>
        <p class="text-[#6B7280] text-sm leading-relaxed">
          "¿Alguien cacha un gasfiter bueno?" — 47 respuestas, ninguna
          confiable, el hilo se perdió entre memes.
        </p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
          <Clock class="w-6 h-6 text-amber-400" />
        </div>
        <h3 class="font-semibold text-[#1F2937] mb-2">El maestro fantasma</h3>
        <p class="text-[#6B7280] text-sm leading-relaxed">
          Te dice que llega a las 10. A las 12 no contesta.
          La próxima semana tampoco.
        </p>
      </div>
      <!-- 2 cards más con situaciones reales -->
    </div>
  </div>
</section>
```

Aciertos: PAS en acción (Problem + Agitate), situaciones ultra-reconocibles, lenguaje chileno natural, humor empático sin forzar, iconos lucide (no emojis), cards con personalidad, fondo FAFAFA alternando ritmo.

### CTA FINAL — Rechazado ❌

```html
<section class="bg-blue-600 py-16 text-center text-white">
  <h2>Ready to get started?</h2>
  <button>Sign up now</button>
</section>
```

### CTA FINAL — Aceptado ✅

```html
<section class="bg-[#423ED0] py-20 lg:py-28">
  <div class="max-w-3xl mx-auto px-6 text-center">
    <h2 class="text-white text-3xl lg:text-4xl font-bold mb-4">
      No te lo cuenten — <span class="text-[#3ECBD7]">datealo</span>
    </h2>
    <p class="text-white/70 text-lg mb-8 max-w-lg mx-auto">
      Estamos sumando los mejores profesionales de Chile.
      Sé de los primeros en probar la plataforma.
    </p>
    <!-- Repetir formulario idéntico al hero -->
    <form class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
      <input type="email" required placeholder="Tu email"
        class="flex-1 py-4 px-6 rounded-2xl text-lg bg-white/95
               text-gray-800 placeholder:text-gray-400
               focus:outline-none focus:ring-2 focus:ring-[#3ECBD7] shadow-xl" />
      <button type="submit"
        class="bg-[#3ECBD7] text-[#1F2937] font-bold py-4 px-8 rounded-2xl
               text-lg hover:bg-[#35b5c0] transition-colors shadow-lg
               whitespace-nowrap">
        Reservar mi lugar
      </button>
    </form>
    <div class="flex items-center justify-center gap-6 mt-6 text-white/50 text-sm">
      <span>✓ Gratis</span>
      <span>✓ Sin spam</span>
      <span>✓ Acceso antes que todos</span>
    </div>
  </div>
</section>
```

Aciertos: Juego de palabras con el nombre de marca, repetición del CTA (CRO), objection handling, Goal-Gradient ("ya estás aquí"), micro-copy con checkmarks de confianza, NO stats inventados.

---

## Anti-patrones (PROHIBIDO)

1. **NO buscador** — no hay producto. El hero es un email input, NO un search bar
2. **NO stats inventados** — no "Únete a 10,000+", no "+500 profesionales", no estrellas de rating inventadas
3. **NO emojis como iconos** — solo lucide-vue-next
4. **NO gradientes purple-to-blue** — primary sólido #423ED0
5. **NO cards todas iguales** — bento, asimetría, tamaños variados
6. **NO Inter/Roboto/Arial**
7. **NO placeholder images con URLs externas**
8. **NO layout 100% centrado simétrico en TODAS las secciones** — variar alineación
9. **NO padding uniforme** — variar ritmo entre secciones
10. **NO ir directo a "features"** sin pasar por el PROBLEMA primero — la estructura es AIDA/PAS, no feature-list
11. **NO copy en inglés** — todo en español chileno
12. **NO "funcionalidades" inventadas que no existen** — vende la VISIÓN, no screenshots de algo que no hay
13. **NO múltiples CTAs compitiendo** — el CTA es UNO: dejar email. El de profesionales es secundario

---

## Directivas de diseño

### Lo que SÍ debe tener

1. **El email input es el héroe** — Grande, prominente, above the fold, imposible de ignorar. Es LO MÁS IMPORTANTE de toda la página.
2. **Personalidad desde el primer scroll** — Headline que golpea un pain point real, tipografía expresiva, fondo sólido #423ED0.
3. **Ritmo visual** — Alternar: #423ED0 (hero) → #FAFAFA (problema) → blanco (solución) → #F3F4F6 (categorías) → blanco (profesionales) → #423ED0 (CTA final).
4. **Espaciado generoso** — Padding vertical mínimo 80px desktop, 48px móvil.
5. **Micro-interacciones** — Hover cards scale(1.02) + shadow. Scroll-triggered fade-in con IntersectionObserver. Duración 150-300ms.
6. **Copy que vende, no que describe** — Cada headline debe responder "¿por qué me importa?" desde la perspectiva del visitante.
7. **Bento grid para categorías** — Una categoría destacada más grande, las demás en grid irregular.
8. **Sección profesionales con PAS mini** — Segundo público, segundo angle de captura.

### Accesibilidad (obligatorio)

- Contraste mínimo 4.5:1 — #FFFFFF sobre #423ED0 pasa. #3ECBD7 sobre blanco NO pasa para texto pequeño — usar solo decorativo, badges grandes, o sobre fondo oscuro.
- Touch targets ≥ 44x44px
- Focus rings visibles con #3ECBD7
- Semántica: section, h1/h2/h3 jerárquico, nav, main, footer
- aria-label en botones con solo icono
- prefers-reduced-motion para animaciones
- El form de email necesita label (puede ser sr-only) + validación HTML nativa

### SEO + AI SEO

- definePageMeta con title: "datealo — Encuentra profesionales verificados cerca de ti" y description que responda "¿qué es datealo?"
- Un solo h1 en toda la página (en el hero)
- Schema.org Organization + WebSite
- Meta tags Open Graph con imagen branded
- Oraciones declarativas extractables por LLMs: "datealo es un buscador de profesionales y servicios para el hogar en Chile"
- Contenido estructurado con headings descriptivos para AI answer engines

---

## Estructura de archivos

```
app/
├── pages/index.vue                       # Orquestadora ≤ 60 LOC
├── components/landing/
│   ├── LandingHero.vue                   # Hero + email input + tagline
│   ├── LandingProblem.vue                # Dolor de buscar profesionales (PAS)
│   ├── LandingSolution.vue               # Visión de datealo + beneficios
│   ├── LandingCategories.vue             # Bento grid de categorías
│   ├── LandingForProfessionals.vue       # PAS mini para profesionales
│   └── LandingFinalCta.vue              # CTA cierre con email repetido
└── constants/landing.ts                  # Contenido tipado as const
```

**Cada componente ≤ 200 LOC**. Si se pasa, extraer sub-componente.

---

## Email signup

El formulario de email debe:
- Capturar el email en un `useState` reactivo (para reutilizar entre hero y CTA final)
- Mostrar estado de **éxito** inline después del submit: "¡Listo! Te avisaremos cuando lancemos 🎉" (reemplaza el form, no redirect)
- Mostrar estado de **error** si el email es inválido
- Validación HTML nativa (`type="email" required`) + validación visual
- El submit NO necesita backend real aún — puede hacer `console.log` del email o guardar en localStorage como placeholder. Implementa el UX completo asumiendo que el backend viene después.
- Si quieres, crea un composable `useWaitlist()` que maneje el estado: email, loading, submitted, error.

---

## Verificación post-implementación (OBLIGATORIO)

### Marketing / CRO
- [ ] ¿La página pasa el 5-second test? (¿Se entiende qué es datealo y por qué dar tu email?)
- [ ] ¿El email input es lo más prominente del hero?
- [ ] ¿NO hay buscador en ninguna parte? (No hay producto)
- [ ] ¿Hay sección de PROBLEMA antes de la solución? (PAS)
- [ ] ¿La estructura sigue AIDA? (Attention → Interest → Desire → Action)
- [ ] ¿El CTA se repite al final de la página?
- [ ] ¿Hay solo 1 email input field? (no nombre, no teléfono)
- [ ] ¿Hay objection handling cerca de cada CTA? (gratis, sin spam)
- [ ] ¿NO hay stats inventados en ningún lugar?
- [ ] ¿El copy está en español chileno natural?

### Psicología aplicada
- [ ] ¿Se aplica Loss Aversion? ("No te quedes fuera" o equivalente)
- [ ] ¿Se aplica Jobs to Be Done? (Vende el outcome, no features)
- [ ] ¿Se aplica Mimetic Desire / Scarcity? (Waitlist = exclusividad, acceso anticipado)
- [ ] ¿Se aplica Goal-Gradient? (Cerca del CTA final)
- [ ] ¿Se aplica PAS en la sección de problema?
- [ ] ¿Las emociones son coherentes? (Frustración → Alivio → Deseo → Urgencia)

### Diseño / Técnico
- [ ] ¿La página se ve distinta a un template de Framer/Vercel genérico?
- [ ] ¿La tipografía NO es Inter/Roboto/Arial?
- [ ] ¿Cada componente ≤ 200 LOC?
- [ ] ¿Contraste #FFFFFF sobre #423ED0 pasa 4.5:1?
- [ ] ¿#3ECBD7 NO se usa como texto pequeño sobre blanco?
- [ ] ¿Touch targets ≥ 44x44px?
- [ ] ¿Focus rings visibles?
- [ ] ¿Un solo h1 en toda la página?
- [ ] ¿Hay prefers-reduced-motion para animaciones?
- [ ] ¿definePageMeta con title y description?
- [ ] ¿Schema.org Organization + WebSite?
- [ ] ¿Estado de éxito post-signup se ve bonito y branded?

Si algún check falla, **corrige antes de entregar**.

## Restricciones técnicas

- NO composables innecesarios — contenido estático
- NO fetch ni API calls
- NO dependencias nuevas
- NO any, NO alert(), NO console.log
- useState() si necesitas estado, no ref()
