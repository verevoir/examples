import { defineBlock, text, richText, select, boolean } from '@nextlake/schema';

export const article = defineBlock({
  name: 'article',
  fields: {
    title: text('Title').max(120),
    body: richText('Body'),
    status: select('Status', ['draft', 'published', 'archived']),
    featured: boolean('Featured').default(false),
  },
});
