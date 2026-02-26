'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, roles } from '@/context/UserContext';

const sidebarStyle: React.CSSProperties = {
  width: 'var(--sidebar-width)',
  minHeight: '100vh',
  background: 'var(--color-surface)',
  borderRight: '1px solid var(--color-border)',
  padding: 'var(--space-md)',
  display: 'flex',
  flexDirection: 'column',
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  marginBottom: 'var(--space-lg)',
};

const roleSectionStyle: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: 'var(--space-md)',
  borderTop: '1px solid var(--color-border)',
};

const roleLabelStyle: React.CSSProperties = {
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

export function Sidebar() {
  const pathname = usePathname();
  const { role, setRole } = useUser();

  return (
    <nav style={sidebarStyle}>
      <div style={logoStyle}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          NextLake
        </Link>
      </div>
      {blockTypes.map(({ key, label }) => {
        const active = pathname.startsWith(`/${key}`);
        return (
          <Link
            key={key}
            href={`/${key}`}
            style={{
              display: 'block',
              padding: 'var(--space-sm) var(--space-md)',
              marginBottom: 'var(--space-xs)',
              borderRadius: 'var(--radius)',
              background: active ? 'var(--color-primary)' : 'transparent',
              color: active ? '#fff' : 'var(--color-text)',
              fontWeight: active ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        );
      })}
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
