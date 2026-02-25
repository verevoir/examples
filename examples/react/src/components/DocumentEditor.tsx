import { useEffect, useState } from 'react';
import { BlockEditor, useBlockForm } from '@nextlake/editor';
import { storage } from '../storage';
import { blocks } from '../blocks';

interface DocumentEditorProps {
  blockType: string;
  documentId?: string;
  onBack: () => void;
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

const backBtnStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text)',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--color-danger)',
  fontSize: '0.875rem',
  marginBottom: 'var(--space-md)',
};

export function DocumentEditor({
  blockType,
  documentId,
  onBack,
}: DocumentEditorProps) {
  const block = blocks[blockType];
  const [loaded, setLoaded] = useState(false);
  const [state, actions] = useBlockForm(block, {});

  useEffect(() => {
    if (documentId) {
      storage.get(documentId).then((doc) => {
        if (doc) {
          actions.onChange(doc.data as Record<string, unknown>);
        }
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleSave = async () => {
    if (!actions.validate()) return;
    if (documentId) {
      await storage.update(documentId, state.value);
    } else {
      await storage.create(blockType, state.value);
    }
    onBack();
  };

  if (!loaded) return null;

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1);

  return (
    <div>
      <h1>{documentId ? `Edit ${label}` : `New ${label}`}</h1>
      <div style={toolbarStyle}>
        <button style={backBtnStyle} onClick={onBack}>
          Back
        </button>
        <button style={saveBtnStyle} onClick={handleSave}>
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
      <BlockEditor
        block={block}
        value={state.value}
        onChange={actions.onChange}
      />
    </div>
  );
}
