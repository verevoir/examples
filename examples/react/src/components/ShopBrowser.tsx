import { useState, useEffect, useCallback } from 'react';
import type { Document } from '@verevoir/storage';
import type { Basket, Order, Product } from '@verevoir/commerce';
import {
  createBasket,
  addItem,
  removeItem,
  updateItemQuantity,
  basketTotal,
  convertToOrder,
  applyPayment,
  orderTotals,
  isFullyPaid,
  changeOwed,
  money,
} from '@verevoir/commerce';
import { storage } from '../storage';
import { toCommerceProduct, defaultConfig } from '../commerce';

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-lg)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--space-md)',
  marginBottom: 'var(--space-lg)',
};

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  background: 'var(--color-surface)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: 'var(--space-md)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-xs) var(--space-sm)',
  borderBottom: '2px solid var(--color-border)',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-xs) var(--space-sm)',
  borderBottom: '1px solid var(--color-border)',
};

const totalRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: 'var(--space-xs) 0',
};

const primaryBtnStyle: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
};

const dangerBtnStyle: React.CSSProperties = {
  background: 'var(--color-danger)',
  color: '#fff',
};

const qtyBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  padding: 0,
  fontSize: '1rem',
  lineHeight: 1,
};

const successStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  border: '1px solid var(--color-primary)',
  borderRadius: 'var(--radius)',
  background: 'var(--color-surface)',
};

function formatMoney(m: { amount: number; currency: string }): string {
  return `${m.currency} ${m.amount.toFixed(2)}`;
}

export function ShopBrowser() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [productMap, setProductMap] = useState<Map<string, Product>>(new Map());
  const [basket, setBasket] = useState<Basket>(createBasket('basket-1'));
  const [order, setOrder] = useState<Order | null>(null);

  const loadProducts = useCallback(() => {
    storage.list('product', { orderBy: { createdAt: 'desc' } }).then((list) => {
      setDocs(list);
      const map = new Map<string, Product>();
      for (const doc of list) {
        const data = doc.data as Record<string, unknown>;
        if (data.available) {
          map.set(doc.id, toCommerceProduct(doc));
        }
      }
      setProductMap(map);
    });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAdd = (productId: string) => {
    const product = productMap.get(productId);
    if (!product) return;
    setBasket((b) => addItem(b, product, 1, defaultConfig));
  };

  const handleRemove = (productId: string) => {
    setBasket((b) => removeItem(b, productId));
  };

  const handleQuantity = (productId: string, delta: number) => {
    const product = productMap.get(productId);
    if (!product) return;
    setBasket((b) => {
      const item = b.items.find((i) => i.productId === productId);
      if (!item) return b;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return removeItem(b, productId);
      return updateItemQuantity(b, productId, newQty, product, defaultConfig);
    });
  };

  const handleCheckout = () => {
    if (basket.items.length === 0) return;
    const ord = convertToOrder(basket, `order-${Date.now()}`);
    setOrder(ord);
    setBasket(createBasket(`basket-${Date.now()}`));
  };

  const handlePay = () => {
    if (!order) return;
    const totals = orderTotals(order);
    const paid = applyPayment(order, {
      id: `pay-${Date.now()}`,
      amount: money(totals.total.amount, totals.total.currency),
      status: 'confirmed',
    });
    setOrder(paid);
  };

  const handleNewOrder = () => {
    setOrder(null);
  };

  const totals = basketTotal(basket);

  const availableProducts = docs.filter((doc) => {
    const data = doc.data as Record<string, unknown>;
    return data.available;
  });

  return (
    <div>
      <h1>Shop</h1>

      {order ? (
        <div style={sectionStyle}>
          <h2>Order {order.id}</h2>
          {isFullyPaid(order) ? (
            <div style={successStyle}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                Payment confirmed
              </p>
              {changeOwed(order).amount > 0 && (
                <p>Change owed: {formatMoney(changeOwed(order))}</p>
              )}
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Unit</th>
                    <th style={thStyle}>Tax</th>
                    <th style={thStyle}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td style={tdStyle}>{item.productType}</td>
                      <td style={tdStyle}>{item.quantity}</td>
                      <td style={tdStyle}>{formatMoney(item.unitPrice)}</td>
                      <td style={tdStyle}>{formatMoney(item.tax)}</td>
                      <td style={tdStyle}>{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={primaryBtnStyle} onClick={handleNewOrder}>
                New Order
              </button>
            </div>
          ) : (
            <div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Unit</th>
                    <th style={thStyle}>Tax</th>
                    <th style={thStyle}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td style={tdStyle}>{item.productType}</td>
                      <td style={tdStyle}>{item.quantity}</td>
                      <td style={tdStyle}>{formatMoney(item.unitPrice)}</td>
                      <td style={tdStyle}>{formatMoney(item.tax)}</td>
                      <td style={tdStyle}>{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(() => {
                const t = orderTotals(order);
                return (
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={totalRowStyle}>
                      <span>Subtotal</span>
                      <span>{formatMoney(t.subtotal)}</span>
                    </div>
                    <div style={totalRowStyle}>
                      <span>Tax</span>
                      <span>{formatMoney(t.tax)}</span>
                    </div>
                    <div
                      style={{
                        ...totalRowStyle,
                        fontWeight: 700,
                        borderTop: '2px solid var(--color-border)',
                        paddingTop: 'var(--space-sm)',
                      }}
                    >
                      <span>Balance Due</span>
                      <span>{formatMoney(order.balance)}</span>
                    </div>
                  </div>
                );
              })()}
              <button style={primaryBtnStyle} onClick={handlePay}>
                Simulate Payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={sectionStyle}>
            <h2>Products</h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-md)',
              }}
            >
              10% discount applied. Tax: 0% on food/books, 20% on
              general/clothing.
            </p>
            {availableProducts.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>
                No products yet. Create some via the Products content type.
              </p>
            ) : (
              <div style={gridStyle}>
                {availableProducts.map((doc) => {
                  const data = doc.data as Record<string, unknown>;
                  const inBasket = basket.items.find(
                    (i) => i.productId === doc.id,
                  );
                  return (
                    <div key={doc.id} style={cardStyle}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {data.name as string}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          marginBottom: 4,
                        }}
                      >
                        {data.type as string}
                      </div>
                      <div style={{ marginBottom: 'var(--space-sm)' }}>
                        {data.currency as string}{' '}
                        {(data.price as number).toFixed(2)}
                      </div>
                      {inBasket ? (
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {inBasket.quantity} in basket
                        </span>
                      ) : (
                        <button
                          style={primaryBtnStyle}
                          onClick={() => handleAdd(doc.id)}
                        >
                          Add to Basket
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {basket.items.length > 0 && (
            <div style={sectionStyle}>
              <h2>Basket</h2>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Unit</th>
                    <th style={thStyle}>Tax</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {basket.items.map((item) => (
                    <tr key={item.productId}>
                      <td style={tdStyle}>{item.productType}</td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <button
                            style={qtyBtnStyle}
                            onClick={() => handleQuantity(item.productId, -1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            style={qtyBtnStyle}
                            onClick={() => handleQuantity(item.productId, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={tdStyle}>{formatMoney(item.unitPrice)}</td>
                      <td style={tdStyle}>{formatMoney(item.tax)}</td>
                      <td style={tdStyle}>{formatMoney(item.lineTotal)}</td>
                      <td style={tdStyle}>
                        <button
                          style={dangerBtnStyle}
                          onClick={() => handleRemove(item.productId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totals && (
                <div>
                  <div style={totalRowStyle}>
                    <span>Subtotal</span>
                    <span>{formatMoney(totals.subtotal)}</span>
                  </div>
                  <div style={totalRowStyle}>
                    <span>Tax</span>
                    <span>{formatMoney(totals.tax)}</span>
                  </div>
                  <div
                    style={{
                      ...totalRowStyle,
                      fontWeight: 700,
                      borderTop: '2px solid var(--color-border)',
                      paddingTop: 'var(--space-sm)',
                    }}
                  >
                    <span>Total</span>
                    <span>{formatMoney(totals.total)}</span>
                  </div>
                  <button
                    style={{ ...primaryBtnStyle, marginTop: 'var(--space-md)' }}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
