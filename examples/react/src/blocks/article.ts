import {
  defineBlock,
  text,
  richText,
  select,
  boolean,
  reference,
} from '@nextlake/schema';

export const article = defineBlock({
  name: 'article',
  fields: {
    title: text('Title').max(120),
    author: reference('Author', 'author'),
    body: richText('Body'),
    status: select('Status', ['draft', 'published', 'archived']),
    featured: boolean('Featured').default(false),
  },
});
