import { definePolicy } from '@verevoir/access';

export const contentPolicy = definePolicy({
  rules: [
    { role: 'admin', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'editor', actions: ['create', 'read', 'update'] },
    { role: 'author', actions: ['create', 'read'] },
    { role: 'author', actions: ['update', 'delete'], scope: 'own' },
    { role: 'viewer', actions: ['read'] },
  ],
});
