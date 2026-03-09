# Verevoir Next.js Example

A Next.js App Router app demonstrating all seven Verevoir packages working together.

## What This Does

Renders a content management interface with four content types, an asset manager, a shop, and role management:

- **Article** — collection of articles with title, body, status, hero image, and featured flag
- **Author** — collection of authors with name, email, bio, and role
- **Product** — collection of products with name, description, category, price, currency, and availability
- **Settings** — singleton site settings with name, tagline, posts per page, and maintenance mode
- **Assets** — upload images/videos, set hotspots, view generated imgproxy URLs
- **Shop** — browse products, add to basket with pricing/tax engines, checkout, and simulate payment
- **Roles** — admin-only role assignment management page

Data is stored in memory via `MemoryAdapter` (resets on server restart).

## Architecture

- `src/blocks/` — Content model definitions using `@verevoir/schema` (article, author, product, settings)
- `src/storage.ts` — `MemoryAdapter` singleton from `@verevoir/storage`
- `src/commerce.ts` — Commerce configuration: `toCommerceProduct` mapper, `defaultConfig` with 10% discount engine and UK VAT tax engine
- `src/assets.ts` — `AssetManager` + `MemoryBlobStore` singletons, `AssetSource` via `createAssetSource`, object URL mapping for browser preview, fake imgproxy config
- `src/access/auth.ts` — Simulated Google auth adapter with three mock accounts; falls back to `ANONYMOUS` for unauthenticated requests
- `src/access/policy.ts` — Content policy with admin/editor/author/viewer rules
- `src/access/workflow.ts` — Publishing workflow (draft → review → published → archived)
- `src/access/roles.ts` — `roleStore` singleton via `createRoleStore` from `@verevoir/access/role-store`, with seed admin for first deploy
- `src/context/UserContext.tsx` — React context providing identity, signIn/signOut, `can()`, and workflow
- `src/components/AuthButton.tsx` — Sign in (account picker) / sign out button with user info display
- `src/components/StatusField.tsx` — Workflow-driven status badge + transition buttons (editor override)
- `src/components/HeroImageField.tsx` — `ImageField` wrapper adapting `@verevoir/media` to editor's `FieldEditorProps`
- `src/components/AssetBrowser.tsx` — Asset management page: upload, list, preview, hotspot editing, imgproxy URL display
- `src/components/ShopBrowser.tsx` — Shop page: product catalog from storage, basket with quantity controls, pricing/tax totals, checkout to order, payment simulation
- `src/components/RoleBrowser.tsx` — Admin-gated role management page: list, assign, and remove user→role mappings
- `src/components/DocumentEditor.tsx` — Where all seven packages converge
- `src/app/assets/` — Static route for asset management (takes priority over `[blockType]` dynamic route)
- `src/app/shop/` — Static route for shop page (takes priority over `[blockType]` dynamic route)
- `src/app/roles/` — Static route for role management (admin-only, takes priority over `[blockType]` dynamic route)
- `src/app/[blockType]/` — Dynamic routes for each content type
- `src/components/ClientShell.tsx` — Client boundary wrapping sidebar + content, wrapped in `UserProvider`, `AssetSourceProvider`, and `ImgproxyConfigProvider`

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
