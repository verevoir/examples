# NextLake Examples

Two example apps demonstrating all six NextLake packages (`@nextlake/schema`, `@nextlake/storage`, `@nextlake/editor`, `@nextlake/access`, `@nextlake/assets`, `@nextlake/media`) working together end-to-end.

## Structure

```
examples/
  react/    — Vite + React SPA with useState-based routing
  nextjs/   — Next.js App Router with file-system routes
```

Both examples define the same three content blocks plus an asset management page:

- **Article** — text (.max), richText, select (draft/review/published/archived), boolean (.default), reference (→ author), reference (→ asset for hero image)
- **Author** — text (.max), text (.regex for email), richText (.optional), select (author/editor/admin)
- **Settings** — text, text (.optional), number (.int.min.max.default), boolean (.default)
- **Assets** — upload images/videos, set hotspots, view generated imgproxy URLs

Block definitions are intentionally duplicated (not shared) to mirror real user usage.

## Access Control Integration

Both examples integrate `@nextlake/access` for role-based access control and editorial workflows:

- **Mock auth** — role switcher dropdown in the sidebar (admin/editor/author/viewer)
- **Content policy** — CRUD permissions per role, with scope:own for author update/delete
- **Publishing workflow** — draft → review → published → archived with guard-protected transitions
- **StatusField override** — replaces the default select with a workflow-aware component showing transition buttons
- **Ownership tracking** — `data.createdBy` set on create, preserved on update, used for scope:own evaluation

## Asset + Media Integration

Both examples integrate `@nextlake/assets` and `@nextlake/media` for asset management:

- **AssetManager** — `MemoryBlobStore` + `MemoryAdapter` for in-memory asset storage
- **AssetSource** — bridges AssetManager to media components via `createAssetSource`
- **Object URLs** — `URL.createObjectURL()` for browser-side image preview (no real blob server)
- **Fake imgproxy** — `https://imgproxy.example.com` base URL; generated URLs shown as text
- **HeroImageField** — thin wrapper adapting `@nextlake/media`'s `ImageField` to the editor's `FieldEditorProps`
- **AssetBrowser** — upload, list, preview, hotspot editing via `HotspotOverlay`, imgproxy URL display
- **Providers** — `AssetSourceProvider` and `ImgproxyConfigProvider` wrap the app

## Integration Pattern

1. Schema Engine defines blocks
2. Editor renders forms and manages state via `useBlockForm`
3. Storage persists via `MemoryAdapter`
4. Access controls who can do what, and drives workflow transitions
5. Assets manages binary uploads and metadata
6. Media provides image display, URL building, and asset picker components

Settings uses a singleton pattern (one document). Article and Author use a collection pattern (list + create/edit).

## Setup

```bash
make install   # install deps for both examples
make build     # build both examples
make lint      # lint both examples
```

## Commands

- `make build` — build both examples
- `make lint` — lint both examples
- `make run` — prints instructions for running each example individually
