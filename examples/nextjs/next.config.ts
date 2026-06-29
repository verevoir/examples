import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // @verevoir/assets dynamically imports `sharp` for image dimension
      // extraction. Sharp is a native Node module unavailable in the browser.
      sharp: './src/shims/sharp.js',

      // @verevoir/storage bundles PostgresAdapter alongside MemoryAdapter.
      // Turbopack (unlike webpack) does not auto-stub Node.js built-ins for
      // browser bundles, so alias the modules pg pulls in to a no-op shim.
      dns: './src/shims/empty.js',
      fs: './src/shims/empty.js',
      net: './src/shims/empty.js',
      tls: './src/shims/empty.js',
      'util/types': './src/shims/empty.js',
      'pg-native': './src/shims/empty.js',
    },
  },
};

export default nextConfig;
