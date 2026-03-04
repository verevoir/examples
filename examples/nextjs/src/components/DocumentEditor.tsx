'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BlockEditor,
  useBlockForm,
  ReferenceOptionsProvider,
} from '@verevoir/editor';
import type { ReferenceOptionsMap, FieldOverrides } from '@verevoir/editor';
import { storage } from '@/storage';
import { blocks } from '@/blocks';
import { useUser } from '@/context/UserContext';
import { StatusField } from './StatusField';
import { HeroImageField } from './HeroImageField';

interface DocumentEditorProps {
  blockType: string;
  documentId?: string;
}

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-sm)',
  marginBottom: 'var(--space-lg)',
};

const saveBtnStyle: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
};

const disabledBtnStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

const backBtnStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text)',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--color-danger)',
  fontSize: '0.875rem',
  marginBottom: 'var(--space-md)',
};

const articleOverrides: FieldOverrides = {
  status: StatusField,
  heroImage: HeroImageField,
};

export function DocumentEditor({ blockType, documentId }: DocumentEditorProps) {
  const router = useRouter();
  const block = blocks[blockType];
  const [loaded, setLoaded] = useState(false);
  const [state, actions] = useBlockForm(block, {});
  const [refOptions, setRefOptions] = useState<ReferenceOptionsMap>({});
  const [createdBy, setCreatedBy] = useState<string | undefined>(undefined);
  const { identity, can } = useUser();

  useEffect(() => {
    storage.list('author').then((authors) => {
      setRefOptions({
        author: authors.map((doc) => ({
          id: doc.id,
          label: (doc.data as Record<string, unknown>).name as string,
        })),
      });
    });
  }, []);

  useEffect(() => {
    if (documentId) {
      storage.get(documentId).then((doc) => {
        if (doc) {
          const data = doc.data as Record<string, unknown>;
          setCreatedBy(data.createdBy as string | undefined);
          actions.onChange(data);
        }
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const isNew = !documentId;
  const canSave = isNew ? can('create') : can('update', { ownerId: createdBy });

  const handleSave = async () => {
    if (!canSave) return;
    if (!actions.validate()) return;
    if (documentId) {
      await storage.update(documentId, { ...state.value, createdBy });
    } else {
      await storage.create(blockType, {
        ...state.value,
        createdBy: identity.id,
      });
    }
    router.push(`/${blockType}`);
  };

  if (!loaded) return null;

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1);
  const overrides = blockType === 'article' ? articleOverrides : undefined;

  return (
    <div>
      <h1>{documentId ? `Edit ${label}` : `New ${label}`}</h1>
      <div style={toolbarStyle}>
        <button
          style={backBtnStyle}
          onClick={() => router.push(`/${blockType}`)}
        >
          Back
        </button>
        <button
          style={canSave ? saveBtnStyle : disabledBtnStyle}
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </button>
      </div>
      {!state.valid && (
        <div style={errorStyle}>
          {Object.entries(state.errors).map(([field, msg]) => (
            <div key={field}>
              <strong>{field}</strong>: {msg}
            </div>
          ))}
        </div>
      )}
      <ReferenceOptionsProvider options={refOptions}>
        <BlockEditor
          block={block}
          value={state.value}
          onChange={actions.onChange}
          overrides={overrides}
        />
      </ReferenceOptionsProvider>
    </div>
  );
}
