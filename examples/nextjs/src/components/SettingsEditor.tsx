'use client';

import { useEffect, useState } from 'react';
import { BlockEditor, useBlockForm } from '@nextlake/editor';
import { storage } from '@/storage';
import { settings } from '@/blocks';

const saveBtnStyle: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
  marginBottom: 'var(--space-lg)',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--color-danger)',
  fontSize: '0.875rem',
  marginBottom: 'var(--space-md)',
};

const savedStyle: React.CSSProperties = {
  color: 'var(--color-primary)',
  fontSize: '0.875rem',
  marginLeft: 'var(--space-sm)',
};

export function SettingsEditor() {
  const [docId, setDocId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [state, actions] = useBlockForm(settings, {});

  useEffect(() => {
    storage.list('settings').then((docs) => {
      if (docs.length > 0) {
        setDocId(docs[0].id);
        actions.onChange(docs[0].data as Record<string, unknown>);
      }
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!actions.validate()) return;
    if (docId) {
      await storage.update(docId, state.value);
    } else {
      const doc = await storage.create('settings', state.value);
      setDocId(doc.id);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) return null;

  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button style={saveBtnStyle} onClick={handleSave}>
          Save
        </button>
        {saved && <span style={savedStyle}>Saved</span>}
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
        block={settings}
        value={state.value}
        onChange={actions.onChange}
      />
    </div>
  );
}
