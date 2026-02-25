'use client';

import { use } from 'react';
import { ClientShell } from '@/components/ClientShell';
import { DocumentList } from '@/components/DocumentList';
import { SettingsEditor } from '@/components/SettingsEditor';

export default function BlockTypePage({
  params,
}: {
  params: Promise<{ blockType: string }>;
}) {
  const { blockType } = use(params);

  return (
    <ClientShell>
      {blockType === 'settings' ? (
        <SettingsEditor />
      ) : (
        <DocumentList blockType={blockType} />
      )}
    </ClientShell>
  );
}
