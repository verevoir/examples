import { createTestAuthAdapter } from '@verevoir/access/test-accounts';
import type { TestAccount } from '@verevoir/access/test-accounts';

const testAccounts: TestAccount[] = [
  { token: 'admin', identity: { id: 'user-admin', roles: ['admin'] } },
  { token: 'editor', identity: { id: 'user-editor', roles: ['editor'] } },
  { token: 'author', identity: { id: 'user-author', roles: ['author'] } },
  { token: 'viewer', identity: { id: 'user-viewer', roles: ['viewer'] } },
];

export type Role = (typeof testAccounts)[number]['token'];

export const roles: Role[] = testAccounts.map((a) => a.token);

export const auth = createTestAuthAdapter({ accounts: testAccounts });
