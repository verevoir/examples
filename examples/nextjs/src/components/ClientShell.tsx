'use client';

import { Sidebar } from './Sidebar';

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-xl)',
  maxWidth: 720,
};

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={mainStyle}>{children}</main>
    </div>
  );
}
