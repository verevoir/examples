import type { FieldEditorProps } from '@verevoir/editor';
import { useUser } from '../context/UserContext';

const badgeColors: Record<string, React.CSSProperties> = {
  draft: { background: '#e5e7eb', color: '#374151' },
  review: { background: '#fef3c7', color: '#92400e' },
  published: { background: '#d1fae5', color: '#065f46' },
  archived: { background: '#f3f4f6', color: '#6b7280' },
};

const badgeStyle = (status: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  ...(badgeColors[status] ?? badgeColors.draft),
});

const transitionBtnStyle: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
  fontSize: '0.8125rem',
};

export function StatusField({ value, onChange }: FieldEditorProps<string>) {
  const { identity, workflow } = useUser();
  const current = (value as string) || 'draft';
  const transitions = workflow.availableTransitions(current, identity);

  return (
    <div data-field style={{ marginBottom: 'var(--space-md)' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: 'var(--space-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-muted)',
        }}
      >
        Status
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          flexWrap: 'wrap',
        }}
      >
        <span style={badgeStyle(current)}>{current}</span>
        {transitions.map((t) => (
          <button
            key={t.to}
            type="button"
            style={transitionBtnStyle}
            onClick={() => onChange(t.to)}
          >
            → {t.to}
          </button>
        ))}
      </div>
    </div>
  );
}
