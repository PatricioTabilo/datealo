# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Instalar dependencias:

```bash
npm install
```

Copiar `.env.example` a `.env` y completar las credenciales de Supabase y Resend (el detalle de cada
variable está en los comentarios del propio archivo).

Levantar la base de datos — aplica las migraciones, las políticas RLS y siembra taxonomía y comuna-vecinas,
en ese orden, con un solo comando:

```bash
npm run db:setup
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
