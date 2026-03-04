import { useState } from 'react';
import { AssetSourceProvider, ImgproxyConfigProvider } from '@verevoir/media';
import { UserProvider } from './context/UserContext';
import { Sidebar } from './components/Sidebar';
import { DocumentList } from './components/DocumentList';
import { DocumentEditor } from './components/DocumentEditor';
import { SettingsEditor } from './components/SettingsEditor';
import { AssetBrowser } from './components/AssetBrowser';
import { source, imgproxyConfig } from './assets';

export type Route =
  | { view: 'list'; blockType: string }
  | { view: 'new'; blockType: string }
  | { view: 'edit'; blockType: string; id: string };

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-xl)',
  maxWidth: 720,
};

export function App() {
  const [route, setRoute] = useState<Route>({
    view: 'list',
    blockType: 'article',
  });

  const navigate = (r: Route) => setRoute(r);

  let content: React.ReactNode;

  if (route.blockType === 'assets') {
    content = <AssetBrowser />;
  } else if (route.blockType === 'settings') {
    content = <SettingsEditor />;
  } else if (route.view === 'list') {
    content = (
      <DocumentList
        blockType={route.blockType}
        onNew={() => navigate({ view: 'new', blockType: route.blockType })}
        onEdit={(id) =>
          navigate({ view: 'edit', blockType: route.blockType, id })
        }
      />
    );
  } else {
    content = (
      <DocumentEditor
        blockType={route.blockType}
        documentId={route.view === 'edit' ? route.id : undefined}
        onBack={() => navigate({ view: 'list', blockType: route.blockType })}
      />
    );
  }

  return (
    <UserProvider>
      <AssetSourceProvider source={source}>
        <ImgproxyConfigProvider config={imgproxyConfig}>
          <div style={layoutStyle}>
            <Sidebar
              active={route.blockType}
              onNavigate={(blockType) => navigate({ view: 'list', blockType })}
            />
            <main style={mainStyle}>{content}</main>
          </div>
        </ImgproxyConfigProvider>
      </AssetSourceProvider>
    </UserProvider>
  );
}
