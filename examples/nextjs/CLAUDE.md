# NextLake Next.js Example

A Next.js App Router app demonstrating all four NextLake v1 packages working together.

## What This Does

Renders a content management interface with three content types:

- **Article** — collection of articles with title, body, status, and featured flag
- **Author** — collection of authors with name, email, bio, and role
- **Settings** — singleton site settings with name, tagline, posts per page, and maintenance mode

Data is stored in memory via `MemoryAdapter` (resets on server restart).

## Architecture

- `src/blocks/` — Content model definitions using `@nextlake/schema`
- `src/storage.ts` — `MemoryAdapter` singleton from `@nextlake/storage`
- `src/access/auth.ts` — Mock auth adapter mapping role strings to Identity objects
- `src/access/policy.ts` — Content policy with admin/editor/author/viewer rules
- `src/access/workflow.ts` — Publishing workflow (draft → review → published → archived)
- `src/context/UserContext.tsx` — React context providing identity, role switching, `can()`, and workflow
- `src/components/StatusField.tsx` — Workflow-driven status badge + transition buttons (editor override)
- `src/components/DocumentEditor.tsx` — Where all four packages converge
- `src/app/[blockType]/` — Dynamic routes for each content type
- `src/components/ClientShell.tsx` — Client boundary wrapping sidebar + content, wrapped in `UserProvider`

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
