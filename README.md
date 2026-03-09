# Verevoir Examples

Two example apps demonstrating all seven Verevoir v1 packages working together end-to-end.

| Example | Stack | Routing |
|---------|-------|---------|
| `examples/react/` | Vite + React SPA | `useState`-based |
| `examples/nextjs/` | Next.js App Router | File-system routes |

Both examples define the same content blocks (Article, Author, Product, Settings), an asset manager, and a shop. Data is stored in memory via `MemoryAdapter`.

## Quick Start

```bash
make install   # install deps for both examples
make build     # build both examples
make lint      # lint both examples
```

Run individually:

```bash
cd examples/react && make run    # Vite dev server
cd examples/nextjs && make run   # Next.js dev server
```
