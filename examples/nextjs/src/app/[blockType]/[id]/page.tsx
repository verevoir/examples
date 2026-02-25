'use client';

import { use } from 'react';
import { ClientShell } from '@/components/ClientShell';
import { DocumentEditor } from '@/components/DocumentEditor';

export default function EditDocumentPage({
  params,
}: {
  params: Promise<{ blockType: string; id: string }>;
}) {
  const { blockType, id } = use(params);

  return (
    <ClientShell>
      <DocumentEditor blockType={blockType} documentId={id} />
    </ClientShell>
  );
}
