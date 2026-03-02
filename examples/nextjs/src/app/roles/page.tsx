'use client';

import { ClientShell } from '@/components/ClientShell';
import { RoleBrowser } from '@/components/RoleBrowser';

export default function RolesPage() {
  return (
    <ClientShell>
      <RoleBrowser />
    </ClientShell>
  );
}
