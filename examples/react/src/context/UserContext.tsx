import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Identity } from '@nextlake/access';
import { auth, roles } from '../access/auth';
import type { Role } from '../access/auth';
import { contentPolicy } from '../access/policy';
import { publishing } from '../access/workflow';

interface UserContextValue {
  identity: Identity;
  role: Role;
  setRole: (role: Role) => void;
  can: (action: string, context?: { ownerId?: string }) => boolean;
  workflow: typeof publishing;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [identity, setIdentity] = useState<Identity>({
    id: 'user-admin',
    roles: ['admin'],
  });

  useEffect(() => {
    auth.resolve(role).then((id) => {
      if (id) setIdentity(id);
    });
  }, [role]);

  const can = useCallback(
    (action: string, context?: { ownerId?: string }) =>
      contentPolicy.can(identity, action, context),
    [identity],
  );

  return (
    <UserContext.Provider
      value={{ identity, role, setRole, can, workflow: publishing }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}

export { roles };
