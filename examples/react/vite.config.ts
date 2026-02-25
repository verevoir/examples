import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @nextlake/storage bundles both MemoryAdapter and PostgresAdapter in a
 * single entry point. PostgresAdapter pulls in `pg`, which needs Node-only
 * globals (Buffer, process, events, net, etc.) and crashes in the browser.
 *
 * This plugin replaces the module at dev-time with a browser-safe version
 * that only provides MemoryAdapter. The production build (Rollup) can
 * tree-shake the unused PostgresAdapter, but Vite's dev pre-bundling
 * (esbuild) cannot — so this plugin is necessary for dev mode.
 */
function browserStorage(): Plugin {
  const VIRTUAL = '\0@nextlake/storage';
  return {
    name: 'nextlake-browser-storage',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@nextlake/storage') return VIRTUAL;
    },
    load(id) {
      if (id !== VIRTUAL) return;
      return `
export class MemoryAdapter {
  constructor() { this.store = new Map(); }
  async connect() {}
  async disconnect() { this.store.clear(); }
  async migrate() {}
  async create(blockType, data) {
    const now = new Date();
    const doc = {
      id: globalThis.crypto.randomUUID(),
      blockType,
      data,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(doc.id, doc);
    return doc;
  }
  async get(id) {
    return this.store.get(id) ?? null;
  }
  async update(id, data) {
    const existing = this.store.get(id);
    if (!existing) throw new Error("Document not found: " + id);
    const updated = { ...existing, data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id) {
    if (!this.store.has(id)) throw new Error("Document not found: " + id);
    this.store.delete(id);
  }
  async list(blockType) {
    const results = [];
    for (const doc of this.store.values()) {
      if (doc.blockType === blockType) results.push(doc);
    }
    return results;
  }
}
`;
    },
  };
}

export default defineConfig({
  plugins: [react(), browserStorage()],
});
