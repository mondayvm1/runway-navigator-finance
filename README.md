# Pathline VIP

Pathline VIP is a Vite + React + TypeScript application for personal finance
planning and runway analysis.

## Local development

Requirements:

- Node.js 18+
- npm

Setup:

```sh
npm install
npm run dev
```

The app runs locally with hot reload through Vite.

## Build and preview

```sh
npm run build
npm run preview
```

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase

## Environment

Create a local `.env` with:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Deployment

Deploy the production build to your preferred hosting provider and configure
your custom domain (for example, `pathline.vip`) in that provider's DNS and
domain settings.

For Vercel + standalone Supabase migration steps, use:

- `docs/vercel-supabase-migration.md`
