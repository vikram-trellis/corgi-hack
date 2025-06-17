# Corgi Insurance Frontend

This is the frontend for the Corgi Insurance application. It's built with Next.js and includes a dashboard, claims management, and policyholders management.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting

If you're experiencing issues with Tailwind not working, try the following:

1. Make sure all dependencies are installed:
```bash
npm install
```

2. If styling is still not working, try cleaning the Next.js cache:
```bash
rm -rf .next
npm run dev
```

3. If that doesn't work, check that postcss.config.js and tailwind.config.js exist and have the correct configuration.

4. Make sure globals.css is properly imported in src/app/layout.tsx.

## Project Structure

- `src/app` - Main application pages
- `src/components` - Reusable components
  - `src/components/ui` - UI components from shadcn/ui
  - `src/components/layout` - Layout components like sidebar
- `src/lib` - Utility functions and helpers
- `src/hooks` - Custom React hooks

## Features

- Dashboard with key metrics
- Claims management
- Policyholders management
- Responsive sidebar navigation