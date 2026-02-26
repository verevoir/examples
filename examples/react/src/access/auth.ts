import { defineAuthAdapter } from '@nextlake/access';
import type { Identity } from '@nextlake/access';

const users: Record<string, Identity> = {
  admin: { id: 'user-admin', roles: ['admin'] },
  editor: { id: 'user-editor', roles: ['editor'] },
  author: { id: 'user-author', roles: ['author'] },
  viewer: { id: 'user-viewer', roles: ['viewer'] },
};

export type Role = keyof typeof users;

export const roles: Role[] = ['admin', 'editor', 'author', 'viewer'];

export const auth = defineAuthAdapter({
  resolve: async (token) => users[token as string] ?? null,
});
