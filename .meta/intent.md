# Intent — Verevoir Examples

## Purpose

Demonstrate all seven Verevoir packages working together end-to-end in realistic application contexts. The examples serve as both a proving ground for the library design and a starting point for developers evaluating Verevoir.

## Goals

- Show the full integration path: content models, storage, editing, access control, assets, media display, and commerce
- Cover two major React frameworks (Vite SPA and Next.js App Router) to prove framework flexibility
- Be runnable with zero infrastructure — in-memory adapters, no database, no external services
- Surface integration pain points early so the library APIs can be improved

## Non-goals

- Be production-ready templates — these are demos, not starters
- Share code between the two examples — intentional duplication mirrors real user experience
- Use real databases or blob stores — in-memory only keeps the examples self-contained
- Demonstrate every feature — focus on the common path, not edge cases

## Key design decisions

- **Two frameworks, not one.** React (Vite) and Next.js have different bundling, routing, and SSR stories. Testing both ensures the libraries work across the two most common React deployment targets and reveals bundler-specific issues (e.g. Vite eager evaluation of Node modules, Next.js webpack fallbacks).
- **Intentional duplication.** Block definitions are duplicated across examples rather than shared. This mirrors how a real user would define their content models and ensures each example is self-contained and independently understandable.
- **In-memory only.** No Docker, no Postgres, no S3. A developer can clone and run immediately. This also means the examples test the MemoryAdapter and MemoryBlobStore paths thoroughly.
- **Fake imgproxy.** A placeholder base URL (`https://imgproxy.example.com`) is used so generated URLs are visible and inspectable without running an imgproxy instance. Object URLs provide browser-side image preview.

## Constraints

- Both examples must build and pass smoke tests via `make test`
- No shared code between the React and Next.js examples
- Dependencies reference Verevoir packages via npm registry at exact pre-release versions
