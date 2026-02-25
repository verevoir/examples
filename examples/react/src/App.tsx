import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DocumentList } from './components/DocumentList';
import { DocumentEditor } from './components/DocumentEditor';
import { SettingsEditor } from './components/SettingsEditor';
import styles from './App.module.css';

export type Route =
  | { view: 'list'; blockType: string }
  | { view: 'new'; blockType: string }
  | { view: 'edit'; blockType: string; id: string };

export function App() {
  const [route, setRoute] = useState<Route>({
    view: 'list',
    blockType: 'article',
  });

  const navigate = (r: Route) => setRoute(r);

  let content: React.ReactNode;

  if (route.blockType === 'settings') {
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
    <div className={styles.layout}>
      <Sidebar
        active={route.blockType}
        onNavigate={(blockType) => navigate({ view: 'list', blockType })}
      />
      <main className={styles.main}>{content}</main>
    </div>
  );
}
