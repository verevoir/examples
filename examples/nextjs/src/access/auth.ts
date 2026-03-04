import { createTestAuthAdapter } from '@verevoir/access/test-accounts';
import type { TestAccount } from '@verevoir/access/test-accounts';

// In production, replace this entire file with createGoogleAuthAdapter.
// See: docs/guides/access-control.md

const testAccounts: TestAccount[] = [
  {
    token: 'google-admin-token',
    identity: {
      id: 'google-114823947',
      roles: ['admin'],
      metadata: { email: 'admin@example.com', name: 'Alice Admin' },
    },
  },
  {
    token: 'google-editor-token',
    identity: {
      id: 'google-229384756',
      roles: ['editor'],
      metadata: { email: 'editor@example.com', name: 'Bob Editor' },
    },
  },
  {
    token: 'google-author-token',
    identity: {
      id: 'google-335847291',
      roles: ['author'],
      metadata: { email: 'author@example.com', name: 'Carol Author' },
    },
  },
];

export const auth = createTestAuthAdapter({ accounts: testAccounts });

export { testAccounts };
