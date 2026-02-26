import { useEffect, useState } from 'react';
import type { Document } from '@nextlake/storage';
import { storage } from '../storage';

interface DocumentListProps {
  blockType: string;
  onNew: () => void;
  onEdit: (id: string) => void;
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

export function DocumentList({ blockType, onNew, onEdit }: DocumentListProps) {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    storage.list(blockType, { orderBy: { createdAt: 'desc' } }).then(setDocs);
  }, [blockType]);

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1) + 's';

  return (
    <div>
      <div style={headerStyle}>
        <h1>{label}</h1>
        <button style={newBtnStyle} onClick={onNew}>
          New {blockType}
        </button>
      </div>
      {docs.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No {blockType}s yet. Create one to get started.
        </p>
      )}
      {docs.map((doc) => (
        <div key={doc.id} style={rowStyle}>
          <span>{displayName(doc)}</span>
          <button
            style={{ background: 'var(--color-primary)', color: '#fff' }}
            onClick={() => onEdit(doc.id)}
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}
