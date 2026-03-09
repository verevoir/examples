'use client';

import { ClientShell } from '@/components/ClientShell';
import { ShopBrowser } from '@/components/ShopBrowser';

export default function ShopPage() {
  return (
    <ClientShell>
      <ShopBrowser />
    </ClientShell>
  );
}
