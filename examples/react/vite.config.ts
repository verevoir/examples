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
  async list(blockType, options) {
    let results = [];
    for (const doc of this.store.values()) {
      if (doc.blockType === blockType) results.push(doc);
    }
    if (options?.where) {
      results = results.filter((doc) => {
        for (const [k, v] of Object.entries(options.where)) {
          const dv = k === 'createdAt' ? doc.createdAt : k === 'updatedAt' ? doc.updatedAt : doc.data[k];
          if (v && typeof v === 'object' && !(v instanceof Date)) {
            if (v.$contains && (typeof dv !== 'string' || !dv.toLowerCase().includes(v.$contains.toLowerCase()))) return false;
            if (v.$gt !== undefined && dv <= v.$gt) return false;
            if (v.$gte !== undefined && dv < v.$gte) return false;
            if (v.$lt !== undefined && dv >= v.$lt) return false;
            if (v.$lte !== undefined && dv > v.$lte) return false;
            if (v.$ne !== undefined && dv === v.$ne) return false;
          } else if (dv !== v) return false;
        }
        return true;
      });
    }
    if (options?.orderBy) {
      const entries = Object.entries(options.orderBy);
      results.sort((a, b) => {
        for (const [k, dir] of entries) {
          const av = k === 'createdAt' ? a.createdAt : k === 'updatedAt' ? a.updatedAt : a.data[k];
          const bv = k === 'createdAt' ? b.createdAt : k === 'updatedAt' ? b.updatedAt : b.data[k];
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
        }
        return 0;
      });
    }
    if (options?.offset) results = results.slice(options.offset);
    if (options?.limit) results = results.slice(0, options.limit);
    return results;
  }
  async getMany(ids) {
    const result = new Map();
    for (const id of ids) {
      const doc = this.store.get(id);
      if (doc) result.set(id, doc);
    }
    return result;
  }
}
`;
    },
  };
}

/**
 * `sharp` is a native Node module used by @nextlake/assets for image
 * dimension extraction. It cannot load in the browser. This plugin
 * provides a no-op shim so Vite's dev pre-bundling doesn't crash.
 */
function browserSharp(): Plugin {
  const VIRTUAL = '\0sharp';
  return {
    name: 'nextlake-browser-sharp',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'sharp') return VIRTUAL;
    },
    load(id) {
      if (id === VIRTUAL) return 'export default null;';
    },
  };
}

export default defineConfig({
  plugins: [react(), browserStorage(), browserSharp()],
});
