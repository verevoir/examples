'use client';

import { ClientShell } from '@/components/ClientShell';

export default function HomePage() {
  return (
    <ClientShell>
      <h1>NextLake</h1>
      <p
        style={{
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-md)',
        }}
      >
        Select a content type from the sidebar to get started.
      </p>
    </ClientShell>
  );
}
