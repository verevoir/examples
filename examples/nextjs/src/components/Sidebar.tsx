'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarStyle: React.CSSProperties = {
  width: 'var(--sidebar-width)',
  minHeight: '100vh',
  background: 'var(--color-surface)',
  borderRight: '1px solid var(--color-border)',
  padding: 'var(--space-md)',
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  marginBottom: 'var(--space-lg)',
};

const blockTypes = [
  { key: 'article', label: 'Articles' },
  { key: 'author', label: 'Authors' },
  { key: 'settings', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

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
    </nav>
  );
}
