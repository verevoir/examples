import { defineBlock, text, number, select, boolean } from '@verevoir/schema';

export const product = defineBlock({
  name: 'product',
  fields: {
    name: text('Product Name').max(200),
    description: text('Description').optional(),
    type: select('Category', ['general', 'food', 'books', 'clothing']).default(
      'general',
    ),
    price: number('Price').min(0).default(0),
    currency: select('Currency', ['GBP', 'USD', 'EUR']).default('GBP'),
    available: boolean('Available').default(true),
  },
});
