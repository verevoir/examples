# NextLake Examples

Two example apps demonstrating all three NextLake v1 packages (`@nextlake/schema`, `@nextlake/storage`, `@nextlake/editor`) working together end-to-end.

## Structure

```
examples/
  react/    — Vite + React SPA with useState-based routing
  nextjs/   — Next.js App Router with file-system routes
```

Both examples define the same three content blocks:

- **Article** — text (.max), richText, select (draft/published/archived), boolean (.default)
- **Author** — text (.max), text (.regex for email), richText (.optional), select (author/editor/admin)
- **Settings** — text, text (.optional), number (.int.min.max.default), boolean (.default)

Block definitions are intentionally duplicated (not shared) to mirror real user usage.

## Integration Pattern

1. Schema Engine defines blocks
2. Editor renders forms and manages state via `useBlockForm`
3. Storage persists via `MemoryAdapter`

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
