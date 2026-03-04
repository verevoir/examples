# NextLake React Example

A Vite + React SPA demonstrating all six NextLake packages working together.

## What This Does

Renders a content management interface with three content types plus an asset manager:

- **Article** — collection of articles with title, body, status, hero image, and featured flag
- **Author** — collection of authors with name, email, bio, and role
- **Settings** — singleton site settings with name, tagline, posts per page, and maintenance mode
- **Assets** — upload images/videos, set hotspots, view generated imgproxy URLs

Data is stored in memory via `MemoryAdapter` (resets on page refresh).

## Architecture

- `src/blocks/` — Content model definitions using `@verevoir/schema`
- `src/storage.ts` — `MemoryAdapter` singleton from `@verevoir/storage`
- `src/assets.ts` — `AssetManager` + `MemoryBlobStore` singletons, `AssetSource` via `createAssetSource`, object URL mapping for browser preview, fake imgproxy config
- `src/access/auth.ts` — Mock auth adapter mapping role strings to Identity objects
- `src/access/policy.ts` — Content policy with admin/editor/author/viewer rules
- `src/access/workflow.ts` — Publishing workflow (draft → review → published → archived)
- `src/context/UserContext.tsx` — React context providing identity, role switching, `can()`, and workflow
- `src/components/StatusField.tsx` — Workflow-driven status badge + transition buttons (editor override)
- `src/components/HeroImageField.tsx` — `ImageField` wrapper adapting `@verevoir/media` to editor's `FieldEditorProps`
- `src/components/AssetBrowser.tsx` — Asset management page: upload, list, preview, hotspot editing, imgproxy URL display
- `src/components/DocumentEditor.tsx` — Where all six packages converge: schema defines the block, editor renders the form, storage persists the data, access gates actions, assets provides hero image selection, media provides image display
- `src/App.tsx` — `useState`-based routing (no react-router), wrapped in `UserProvider`, `AssetSourceProvider`, and `ImgproxyConfigProvider`

## Setup

```bash
npm install
make run        # starts Vite dev server on http://localhost:5173
```

## Commands

- `make build` — production build via Vite
- `make lint` — eslint + prettier check
- `make run` — start dev server
