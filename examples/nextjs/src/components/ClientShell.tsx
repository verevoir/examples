'use client';

import { AssetSourceProvider, ImgproxyConfigProvider } from '@verevoir/media';
import { UserProvider } from '@/context/UserContext';
import { Sidebar } from './Sidebar';
import { source, imgproxyConfig } from '@/assets';

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
    <UserProvider>
      <AssetSourceProvider source={source}>
        <ImgproxyConfigProvider config={imgproxyConfig}>
          <div style={layoutStyle}>
            <Sidebar />
            <main style={mainStyle}>{children}</main>
          </div>
        </ImgproxyConfigProvider>
      </AssetSourceProvider>
    </UserProvider>
  );
}
