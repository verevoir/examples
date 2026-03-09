import { article } from './article';
import { author } from './author';
import { product } from './product';
import { settings } from './settings';
import type { BlockDefinition, FieldRecord } from '@verevoir/schema';

export { article, author, product, settings };

export const blocks: Record<string, BlockDefinition<FieldRecord>> = {
  article,
  author,
  product,
  settings,
};
