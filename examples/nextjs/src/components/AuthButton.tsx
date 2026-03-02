'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { mockAccounts } from '@/access/auth';

const signInBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
};

const signOutBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'var(--color-border)',
  color: 'var(--color-text)',
  border: 'none',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  fontSize: '0.8125rem',
};

const accountListStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  marginBottom: 'var(--space-xs)',
  overflow: 'hidden',
};

const accountBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--color-border)',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '0.8125rem',
};

const userInfoStyle: React.CSSProperties = {
  marginBottom: 'var(--space-sm)',
  fontSize: '0.8125rem',
  lineHeight: 1.4,
};

const roleTagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  background: 'var(--color-primary)',
  color: '#fff',
  borderRadius: '3px',
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

export function AuthButton() {
  const { identity, isAuthenticated, signIn, signOut } = useUser();
  const [showPicker, setShowPicker] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={{ position: 'relative' }}>
        {showPicker && (
          <div style={accountListStyle}>
            {mockAccounts.map((account) => (
              <button
                key={account.token}
                style={accountBtnStyle}
                onClick={() => {
                  signIn(account.token);
                  setShowPicker(false);
                }}
              >
                <div style={{ fontWeight: 600 }}>{account.name}</div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  {account.email} &middot; {account.role}
                </div>
              </button>
            ))}
          </div>
        )}
        <button
          style={signInBtnStyle}
          onClick={() => setShowPicker(!showPicker)}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={userInfoStyle}>
        <div style={{ fontWeight: 600 }}>
          {(identity.metadata?.name as string) ?? identity.id}
        </div>
        <div style={{ color: 'var(--color-text-muted)' }}>
          {identity.metadata?.email as string}
        </div>
        <div style={{ marginTop: '2px' }}>
          <span style={roleTagStyle}>{identity.roles[0]}</span>
        </div>
      </div>
      <button style={signOutBtnStyle} onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
