import { createRoleStore } from '@verevoir/access/role-store';
import { storage } from '@/storage';

export const roleStore = createRoleStore({
  storage,
  seedAdmin: {
    userId: 'google-114823947',
    roles: ['admin'],
  },
});
