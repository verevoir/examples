import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // @nextlake/storage bundles PostgresAdapter alongside MemoryAdapter.
    // We only use MemoryAdapter, but webpack can't tree-shake the pg
    // dependency, so stub out the Node-only modules it requires.
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
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
