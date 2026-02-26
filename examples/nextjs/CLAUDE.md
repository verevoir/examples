# NextLake Next.js Example

A Next.js App Router app demonstrating all three NextLake v1 packages working together.

## What This Does

Renders a content management interface with three content types:

- **Article** — collection of articles with title, body, status, and featured flag
- **Author** — collection of authors with name, email, bio, and role
- **Settings** — singleton site settings with name, tagline, posts per page, and maintenance mode

Data is stored in memory via `MemoryAdapter` (resets on server restart).

## Architecture

- `src/blocks/` — Content model definitions using `@nextlake/schema`
- `src/storage.ts` — `MemoryAdapter` singleton from `@nextlake/storage`
- `src/components/DocumentEditor.tsx` — Where all three packages converge
- `src/app/[blockType]/` — Dynamic routes for each content type
- `src/components/ClientShell.tsx` — Client boundary wrapping sidebar + content

Layout is a server component. All page components and interactive components are `'use client'`.

## Setup

```bash
npm install
make run        # starts Next.js dev server on http://localhost:3000
```

## Commands

- `make build` — production build via Next.js
- `make lint` — eslint + prettier check
- `make run` — start dev server
