import { article } from './article';
import { author } from './author';
import { settings } from './settings';
import type { BlockDefinition, FieldRecord } from '@verevoir/schema';

export { article, author, settings };

export const blocks: Record<string, BlockDefinition<FieldRecord>> = {
  article,
  author,
  settings,
};
