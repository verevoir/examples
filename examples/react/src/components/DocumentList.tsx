import { useCallback, useEffect, useState } from 'react';
import type { Document } from '@verevoir/storage';
import { storage } from '../storage';
import { useUser } from '../context/UserContext';

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

const deleteBtnStyle: React.CSSProperties = {
  background: 'var(--color-danger)',
  color: '#fff',
  marginLeft: 'var(--space-xs)',
};

function displayName(doc: Document): string {
  const data = doc.data as Record<string, unknown>;
  const name = data.title ?? data.name ?? data.siteName;
  return typeof name === 'string' && name.length > 0 ? name : 'Untitled';
}

export function DocumentList({ blockType, onNew, onEdit }: DocumentListProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const { can } = useUser();

  const loadDocs = useCallback(() => {
    storage.list(blockType, { orderBy: { createdAt: 'desc' } }).then(setDocs);
  }, [blockType]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleDelete = async (doc: Document) => {
    await storage.delete(doc.id);
    loadDocs();
  };

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1) + 's';

  return (
    <div>
      <div style={headerStyle}>
        <h1>{label}</h1>
        {can('create') && (
          <button style={newBtnStyle} onClick={onNew}>
            New {blockType}
          </button>
        )}
      </div>
      {docs.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No {blockType}s yet. Create one to get started.
        </p>
      )}
      {docs.map((doc) => {
        const ownerId = (doc.data as Record<string, unknown>)
          .createdBy as string;
        return (
          <div key={doc.id} style={rowStyle}>
            <span>{displayName(doc)}</span>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <button
                style={{ background: 'var(--color-primary)', color: '#fff' }}
                onClick={() => onEdit(doc.id)}
              >
                Edit
              </button>
              {can('delete', { ownerId }) && (
                <button
                  style={deleteBtnStyle}
                  onClick={() => handleDelete(doc)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
