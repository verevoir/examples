import { defineAuthAdapter, ANONYMOUS } from '@nextlake/access';
import type { Identity } from '@nextlake/access';

// Simulated Google accounts for demonstration.
// In production, replace with createGoogleAuthAdapter from '@nextlake/access/google':
//
//   import { createGoogleAuthAdapter } from '@nextlake/access/google';
//   import { OAuth2Client } from 'google-auth-library';
//
//   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//   export const auth = createGoogleAuthAdapter({
//     client,
//     allowedClientIds: [process.env.GOOGLE_CLIENT_ID!],
//     hostedDomain: 'yourcompany.com',
//     mapRoles: (payload) => payload.hd === 'yourcompany.com' ? ['editor'] : ['viewer'],
//   });

const simulatedAccounts: Record<string, Identity> = {
  'google-admin-token': {
    id: 'google-114823947',
    roles: ['admin'],
    metadata: { email: 'admin@example.com', name: 'Alice Admin' },
  },
  'google-editor-token': {
    id: 'google-229384756',
    roles: ['editor'],
    metadata: { email: 'editor@example.com', name: 'Bob Editor' },
  },
  'google-author-token': {
    id: 'google-335847291',
    roles: ['author'],
    metadata: { email: 'author@example.com', name: 'Carol Author' },
  },
};

export const auth = defineAuthAdapter({
  resolve: async (token) => {
    if (!token) return ANONYMOUS;
    return simulatedAccounts[token as string] ?? ANONYMOUS;
  },
});

export const mockAccounts = Object.entries(simulatedAccounts).map(
  ([token, identity]) => ({
    token,
    name: identity.metadata?.name as string,
    email: identity.metadata?.email as string,
    role: identity.roles[0],
  }),
);
