# Mockups de misión

Un flujo escrito se lee bien y aun así no se sostiene en pantalla. El mockup es lo que convierte "cada
estado tiene contenido concreto" en algo verificable: muestra cuánta información compite por el mismo
espacio y si la acción principal queda sobre el pliegue.

Cuándo es obligatorio hacer uno, qué debe contener y cómo se itera está en el skill `discovery-ux`. Este
documento es solo el cómo mecánico.

## Dónde viven

```
docs/missions/NN-slug/design-mockups/{pantalla}.html
```

Un archivo por vista. Los modos y estados de esa vista son frames dentro del mismo archivo, en el orden en
que el usuario los recorre — así el archivo se lee como camino, no como galería. Revisar un diseño no
debería obligar a abrir cinco pestañas.

## Esqueleto

```html
<!doctype html>
<html lang="es-CL" data-theme="datealo">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>V-002 Resultados de búsqueda — misión 01</title>

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5/daisyui.css" rel="stylesheet" />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../../../design/datealo-mockup-kit.css" />
  </head>

  <body>
    <div class="frames">
      <section class="frame frame-mobile">
        <div class="frame-label">
          V-002 · modo lista
          <small>ronda 2 — con el selector de comuna arriba</small>
        </div>
        <div class="frame-viewport">
          <div class="status-bar"><span>9:41</span><span>▮▮▮</span></div>
          <!-- Contenido real de la pantalla, con DaisyUI y utilidades de Tailwind -->
        </div>
      </section>

      <section class="frame frame-mobile">
        <div class="frame-label">V-002 · estado vacío</div>
        <div class="frame-viewport"><!-- ... --></div>
      </section>
    </div>
  </body>
</html>
```

Tres detalles que importan:

- **El `data-theme="datealo"` va en el `<html>`**, igual que en la app real (`nuxt.config.ts`). Sin eso los
  componentes de DaisyUI salen con el tema por defecto y el mockup miente sobre el color.
- **El kit se carga después de DaisyUI.** Define los tokens del tema y los marcos; los componentes los pone
  DaisyUI.
- **Requiere internet.** Tailwind, DaisyUI y las tipografías vienen por CDN. Si vas a trabajar sin
  conexión, descarga los dos archivos a `docs/design/vendor/` y apunta los `src`/`href` ahí.

## Cómo verlo

Abrir el `.html` directo en el navegador basta. Para revisarlo en el chat, publicarlo como Artifact — en
ese caso hay que inlinear el CSS del kit y las fuentes, porque los Artifacts bloquean cualquier petición a
un host externo.

## Marcos disponibles

| Clase                        | Qué es                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `frame frame-mobile`         | 390 × 844 px. El caso principal de Datealo: siempre va             |
| `frame frame-desktop`        | 1280 × 800 px. Solo si la pantalla también vive en desktop         |
| `frame-viewport is-auto`     | Alto libre, para revisar una pantalla larga completa sin scroll    |
| `frame-label` + `<small>`    | Rótulo del frame; el `<small>` lleva la ronda y qué cambió         |
| `status-bar`                 | Barra de estado decorativa, marca dónde empieza el contenido real  |
| `fold`                       | Línea del pliegue: lo que queda debajo no se ve sin scroll         |
| `safe-bottom`                | Área segura inferior, donde vive el CTA fijo en móvil              |

## Reglas de contenido

- **Datos reales, nunca placeholders.** "Marcela Fuentes · Peluquería a domicilio · Ñuñoa · 4,8 (23
  reseñas)" revela los desbordes de texto que "Profesional 1" esconde.
- **Vocabulario chileno y los términos decididos en `producto.md`.** Un mockup con jerga distinta a la del
  documento reabre discusiones ya cerradas.
- **Los tokens los pone el kit.** Un color hexadecimal escrito a mano en el mockup queda desactualizado sin
  que nadie lo note.
- **JS puro solo si el flujo se evalúa mejor moviéndolo** — abrir un bottom sheet, cambiar de tab. Un
  mockup no valida ni persiste nada.

## Sincronizar el kit

`datealo-mockup-kit.css` espeja los tokens de `app/assets/css/main.css`. No hay script: son unas veinte
líneas y se copian a mano cuando el tema cambia. Si tocas el tema de la app y no el kit, los mockups
siguientes describirán un producto que ya no existe.
