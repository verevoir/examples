'use client';

import { use } from 'react';
import { ClientShell } from '@/components/ClientShell';
import { DocumentEditor } from '@/components/DocumentEditor';

export default function NewDocumentPage({
  params,
}: {
  params: Promise<{ blockType: string }>;
}) {
  const { blockType } = use(params);

  return (
    <ClientShell>
      <DocumentEditor blockType={blockType} />
    </ClientShell>
  );
}
