import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // @nextlake/storage bundles PostgresAdapter alongside MemoryAdapter.
    // We only use MemoryAdapter, but webpack can't tree-shake the pg
    // dependency, so stub out the Node-only modules it requires.
    //
    // @nextlake/assets dynamically imports `sharp` for image dimension
    // extraction. Sharp is a native Node module that pulls in
    // child_process, crypto, os, etc. — all unavailable in the browser.
    // We alias it to a no-op shim so webpack doesn't try to bundle it.
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          sharp: path.join(__dirname, 'src', 'shims', 'sharp.js'),
        },
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          dns: false,
          net: false,
          tls: false,
          'pg-native': false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
