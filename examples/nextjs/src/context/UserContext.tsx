'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Identity } from '@nextlake/access';
import { ANONYMOUS, isAnonymous } from '@nextlake/access';
import { auth } from '@/access/auth';
import { contentPolicy } from '@/access/policy';
import { publishing } from '@/access/workflow';

interface UserContextValue {
  identity: Identity;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  can: (action: string, context?: { ownerId?: string }) => boolean;
  workflow: typeof publishing;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity>(ANONYMOUS);

  useEffect(() => {
    auth.resolve(token).then((id) => {
      if (id) setIdentity(id);
    });
  }, [token]);

  const signIn = useCallback((t: string) => setToken(t), []);
  const signOut = useCallback(() => {
    setToken(null);
    setIdentity(ANONYMOUS);
  }, []);

  const can = useCallback(
    (action: string, context?: { ownerId?: string }) =>
      contentPolicy.can(identity, action, context),
    [identity],
  );

  return (
    <UserContext.Provider
      value={{
        identity,
        isAuthenticated: !isAnonymous(identity),
        signIn,
        signOut,
        can,
        workflow: publishing,
      }}
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
