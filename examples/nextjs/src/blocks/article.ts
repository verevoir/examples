import {
  defineBlock,
  text,
  richText,
  select,
  boolean,
  reference,
} from '@verevoir/schema';

export const article = defineBlock({
  name: 'article',
  fields: {
    title: text('Title').max(120),
    author: reference('Author', 'author'),
    body: richText('Body').hint(
      'Engaging and informative. Short paragraphs, active voice.',
    ),
    status: select('Status', ['draft', 'review', 'published', 'archived']),
    heroImage: reference('Hero Image', 'asset'),
    featured: boolean('Featured').default(false),
  },
});
