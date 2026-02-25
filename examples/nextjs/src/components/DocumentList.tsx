'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Document } from '@nextlake/storage';
import { storage } from '@/storage';

interface DocumentListProps {
  blockType: string;
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-lg)',
};

const newBtnStyle: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
  textDecoration: 'none',
  padding: 'var(--space-sm) var(--space-md)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  marginBottom: 'var(--space-sm)',
};

function displayName(doc: Document): string {
  const data = doc.data as Record<string, unknown>;
  const name = data.title ?? data.name ?? data.siteName;
  return typeof name === 'string' && name.length > 0 ? name : 'Untitled';
}

export function DocumentList({ blockType }: DocumentListProps) {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    storage.list(blockType).then(setDocs);
  }, [blockType]);

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1) + 's';

  return (
    <div>
      <div style={headerStyle}>
        <h1>{label}</h1>
        <Link href={`/${blockType}/new`} style={newBtnStyle}>
          New {blockType}
        </Link>
      </div>
      {docs.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No {blockType}s yet. Create one to get started.
        </p>
      )}
      {docs.map((doc) => (
        <div key={doc.id} style={rowStyle}>
          <span>{displayName(doc)}</span>
          <Link
            href={`/${blockType}/${doc.id}`}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              textDecoration: 'none',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Edit
          </Link>
        </div>
      ))}
    </div>
  );
}
