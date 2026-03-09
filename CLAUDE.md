# Verevoir Examples

Two example apps demonstrating all seven Verevoir packages (`@verevoir/schema`, `@verevoir/storage`, `@verevoir/editor`, `@verevoir/access`, `@verevoir/assets`, `@verevoir/media`, `@verevoir/commerce`) working together end-to-end.

## Structure

```
examples/
  react/    — Vite + React SPA with useState-based routing
  nextjs/   — Next.js App Router with file-system routes
```

Both examples define the same four content blocks plus asset management and a shop:

- **Article** — text (.max), richText, select (draft/review/published/archived), boolean (.default), reference (→ author), reference (→ asset for hero image)
- **Author** — text (.max), text (.regex for email), richText (.optional), select (author/editor/admin)
- **Product** — text (.max), text (.optional), select (general/food/books/clothing), number (.min.default), select (GBP/USD/EUR), boolean (.default)
- **Settings** — text, text (.optional), number (.int.min.max.default), boolean (.default)
- **Assets** — upload images/videos, set hotspots, view generated imgproxy URLs
- **Shop** — browse available products, basket with pricing/tax, checkout to order, payment simulation

Block definitions are intentionally duplicated (not shared) to mirror real user usage.

## Access Control Integration

Both examples integrate `@verevoir/access` for role-based access control and editorial workflows:

- **React** — mock auth with role switcher dropdown in the sidebar (admin/editor/author/viewer)
- **Next.js** — simulated Google auth with sign in/out; starts anonymous (read-only), sign in to get editing controls
- **Content policy** — CRUD permissions per role, with scope:own for author update/delete
- **Publishing workflow** — draft → review → published → archived with guard-protected transitions
- **StatusField override** — replaces the default select with a workflow-aware component showing transition buttons
- **Ownership tracking** — `data.createdBy` set on create, preserved on update, used for scope:own evaluation
- **Anonymous identity** — `ANONYMOUS` from `@verevoir/access` used as the default unauthenticated state in Next.js
- **Role store** — Next.js example uses `createRoleStore` from `@verevoir/access/role-store` for persistent role assignments, with a `/roles` admin page for managing user→role mappings

## Asset + Media Integration

Both examples integrate `@verevoir/assets` and `@verevoir/media` for asset management:

- **AssetManager** — `MemoryBlobStore` + `MemoryAdapter` for in-memory asset storage
- **AssetSource** — bridges AssetManager to media components via `createAssetSource`
- **Object URLs** — `URL.createObjectURL()` for browser-side image preview (no real blob server)
- **Fake imgproxy** — `https://imgproxy.example.com` base URL; generated URLs shown as text
- **HeroImageField** — thin wrapper adapting `@verevoir/media`'s `ImageField` to the editor's `FieldEditorProps`
- **AssetBrowser** — upload, list, preview, hotspot editing via `HotspotOverlay`, imgproxy URL display
- **Providers** — `AssetSourceProvider` and `ImgproxyConfigProvider` wrap the app

## Commerce Integration

Both examples integrate `@verevoir/commerce` for shopping and checkout:

- **Product content type** — content-managed products stored via `MemoryAdapter`, edited via `BlockEditor`
- **Commerce configuration** — `toCommerceProduct` maps stored documents to commerce `Product` interface, `defaultConfig` provides 10% discount pricing engine and UK VAT tax engine (0% food/books, 20% general/clothing)
- **ShopBrowser** — product catalog from storage, basket with quantity controls, subtotal/tax/total display, checkout to order, simulated payment confirmation
- **Functional state** — basket and order state managed via React `useState`, all operations return new objects (no mutation)

## Integration Pattern

1. Schema Engine defines blocks
2. Editor renders forms and manages state via `useBlockForm`
3. Storage persists via `MemoryAdapter`
4. Access controls who can do what, and drives workflow transitions
5. Assets manages binary uploads and metadata
6. Media provides image display, URL building, and asset picker components
7. Commerce provides basket/order logic with pluggable pricing and tax engines

Settings uses a singleton pattern (one document). Article, Author, and Product use a collection pattern (list + create/edit).

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
