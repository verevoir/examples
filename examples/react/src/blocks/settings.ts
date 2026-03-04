import { defineBlock, text, number, boolean } from '@verevoir/schema';

export const settings = defineBlock({
  name: 'settings',
  fields: {
    siteName: text('Site Name'),
    tagline: text('Tagline').optional(),
    postsPerPage: number('Posts Per Page').int().min(1).max(100).default(10),
    maintenanceMode: boolean('Maintenance Mode').default(false),
  },
});
