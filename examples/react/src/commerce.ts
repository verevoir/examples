import type { Product, CommerceConfig } from '@verevoir/commerce';
import {
  money,
  percentageDiscountEngine,
  productTypeTaxEngine,
} from '@verevoir/commerce';
import type { Document } from '@verevoir/storage';

/** Map a stored product document to a commerce Product. */
export function toCommerceProduct(doc: Document): Product {
  const data = doc.data as Record<string, unknown>;
  return {
    id: doc.id,
    type: data.type as string,
    basePrice: money(data.price as number, data.currency as string),
  };
}

/** Default commerce configuration with 10% discount and UK VAT rates. */
export const defaultConfig: CommerceConfig = {
  pricingEngines: [percentageDiscountEngine(0.1)],
  taxEngine: productTypeTaxEngine(
    {
      food: 0,
      books: 0,
      clothing: 0.2,
      general: 0.2,
    },
    0.2,
  ),
};
