import { CSSProperties } from 'react';
import { useUser, roles } from '../context/UserContext';

const sidebarStyle: CSSProperties = {
  width: 'var(--sidebar-width)',
  minHeight: '100vh',
  background: 'var(--color-surface)',
  borderRight: '1px solid var(--color-border)',
  padding: 'var(--space-md)',
  display: 'flex',
  flexDirection: 'column',
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

const roleSectionStyle: CSSProperties = {
  marginTop: 'auto',
  paddingTop: 'var(--space-md)',
  borderTop: '1px solid var(--color-border)',
};

const roleLabelStyle: CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-xs)',
};

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
  const { role, setRole } = useUser();

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
      <div style={roleSectionStyle}>
        <div style={roleLabelStyle}>Role</div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          style={{ width: '100%' }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
