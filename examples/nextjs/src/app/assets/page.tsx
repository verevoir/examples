'use client';

import { ClientShell } from '@/components/ClientShell';
import { AssetBrowser } from '@/components/AssetBrowser';

export default function AssetsPage() {
  return (
    <ClientShell>
      <AssetBrowser />
    </ClientShell>
  );
}
