import { defineBlock, text, richText, select } from '@verevoir/schema';

export const author = defineBlock({
  name: 'author',
  fields: {
    name: text('Name').max(100),
    email: text('Email').regex(/^[\w.-]+@[\w.-]+\.\w+$/),
    bio: richText('Bio').optional(),
    role: select('Role', ['author', 'editor', 'admin']),
  },
});
