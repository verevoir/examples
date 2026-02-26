import { defineWorkflow, hasRole, or } from '@nextlake/access';

export const publishing = defineWorkflow({
  name: 'publishing',
  states: ['draft', 'review', 'published', 'archived'],
  initial: 'draft',
  transitions: [
    {
      from: 'draft',
      to: 'review',
      guard: or(hasRole('author'), hasRole('editor'), hasRole('admin')),
    },
    {
      from: 'review',
      to: 'published',
      guard: or(hasRole('editor'), hasRole('admin')),
    },
    {
      from: 'review',
      to: 'draft',
      guard: or(hasRole('author'), hasRole('editor'), hasRole('admin')),
    },
    { from: 'published', to: 'archived', guard: hasRole('admin') },
  ],
});
