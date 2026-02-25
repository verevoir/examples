import { CSSProperties } from 'react';

const sidebarStyle: CSSProperties = {
  width: 'var(--sidebar-width)',
  minHeight: '100vh',
  background: 'var(--color-surface)',
  borderRight: '1px solid var(--color-border)',
  padding: 'var(--space-md)',
};

const logoStyle: CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  marginBottom: 'var(--space-lg)',
};

const navItemStyle = (active: boolean): CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: 'var(--space-sm) var(--space-md)',
  marginBottom: 'var(--space-xs)',
  borderRadius: 'var(--radius)',
  background: active ? 'var(--color-primary)' : 'transparent',
  color: active ? '#fff' : 'var(--color-text)',
  border: 'none',
  fontWeight: active ? 600 : 400,
});

const blockTypes = [
  { key: 'article', label: 'Articles' },
  { key: 'author', label: 'Authors' },
  { key: 'settings', label: 'Settings' },
];

interface SidebarProps {
  active: string;
  onNavigate: (blockType: string) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <nav style={sidebarStyle}>
      <div style={logoStyle}>NextLake</div>
      {blockTypes.map(({ key, label }) => (
        <button
          key={key}
          style={navItemStyle(active === key)}
          onClick={() => onNavigate(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
