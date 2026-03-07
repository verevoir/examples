import { defineBlock, text, richText, select } from '@verevoir/schema';

export const author = defineBlock({
  name: 'author',
  fields: {
    name: text('Name').max(100),
    email: text('Email').regex(/^[\w.-]+@[\w.-]+\.\w+$/),
    bio: richText('Bio')
      .hint('Third person, 2-3 sentences. Mention role and expertise.')
      .optional(),
    role: select('Role', ['author', 'editor', 'admin']),
  },
});
