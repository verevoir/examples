'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';

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

const authSectionStyle: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: 'var(--space-md)',
  borderTop: '1px solid var(--color-border)',
};

const blockTypes = [
  { key: 'article', label: 'Articles' },
  { key: 'author', label: 'Authors' },
  { key: 'product', label: 'Products' },
  { key: 'shop', label: 'Shop' },
  { key: 'assets', label: 'Assets' },
  { key: 'settings', label: 'Settings' },
  { key: 'roles', label: 'Roles' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav style={sidebarStyle}>
      <div style={logoStyle}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Verevoir
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
      <div style={authSectionStyle}>
        <AuthButton />
      </div>
    </nav>
  );
}
