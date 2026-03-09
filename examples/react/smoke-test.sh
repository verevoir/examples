#!/usr/bin/env bash
# Smoke test for the React (Vite) example.
# Starts the dev server, checks routes, and exercises schema+storage+access logic.
set -euo pipefail

PORT=${PORT:-5173}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Starting Vite dev server on port $PORT..."
npx vite --port "$PORT" &>/dev/null &
SERVER_PID=$!

# Wait for server to be ready
for i in $(seq 1 30); do
  if curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "✗ Server failed to start within 30s"
    exit 1
  fi
  sleep 1
done

echo "Server ready."
PASS=0
FAIL=0

check() {
  local label="$1" url="$2" expect="$3"
  local body
  body=$(curl -sf "$url" 2>/dev/null || echo "")
  if echo "$body" | grep -q "$expect"; then
    echo "✓ $label"
    PASS=$((PASS + 1))
  else
    echo "✗ $label — expected '$expect' in response"
    FAIL=$((FAIL + 1))
  fi
}

check_status() {
  local label="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$code" = "200" ]; then
    echo "✓ $label → $code"
    PASS=$((PASS + 1))
  else
    echo "✗ $label → $code (expected 200)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== Route checks ==="
check_status "GET /" "http://localhost:$PORT"
check "Home page has app root" "http://localhost:$PORT" 'id="root"'

echo ""
echo "=== Node integration: schema + storage ==="
node --input-type=module << 'NODETEST'
import { defineBlock, text, richText, select, boolean, number } from '@verevoir/schema';
import { MemoryAdapter } from '@verevoir/storage';

const storage = new MemoryAdapter();

const article = defineBlock({
  name: 'article',
  fields: {
    title: text('Title').max(120),
    body: richText('Body'),
    status: select('Status', ['draft', 'review', 'published', 'archived']),
    featured: boolean('Featured').default(false),
  },
});

const author = defineBlock({
  name: 'author',
  fields: {
    name: text('Name').max(100),
    email: text('Email').regex(/^[\w.-]+@[\w.-]+\.\w+$/),
    bio: richText('Bio').optional(),
    role: select('Role', ['author', 'editor', 'admin']),
  },
});

const settings = defineBlock({
  name: 'settings',
  fields: {
    siteName: text('Site Name'),
    tagline: text('Tagline').optional(),
    postsPerPage: number('Posts Per Page').int().min(1).max(100).default(10),
    maintenanceMode: boolean('Maintenance Mode').default(false),
  },
});

// Create
const data = { title: 'Test', body: '<p>body</p>', status: 'draft', featured: false };
article.validate(data);
const doc = await storage.create('article', data);
console.log(`✓ Create article: "${doc.data.title}"`);

// List
const list = await storage.list('article');
console.log(`✓ List articles: ${list.length} found`);

// Update
const updated = await storage.update(doc.id, { ...data, title: 'Edited' });
console.log(`✓ Update article: "${updated.data.title}"`);

// Get
const fetched = await storage.get(doc.id);
console.log(`✓ Get article: "${fetched.data.title}"`);

// Author
const aData = { name: 'Jane', email: 'jane@test.com', role: 'author' };
author.validate(aData);
await storage.create('author', aData);
console.log('✓ Create author');

// Settings
const sData = { siteName: 'Test Site', postsPerPage: 10, maintenanceMode: false };
settings.validate(sData);
await storage.create('settings', sData);
console.log('✓ Create settings');

// Validation: reject bad email
try { author.validate({ name: 'X', email: 'bad', role: 'author' }); console.log('✗ Should reject bad email'); process.exit(1); }
catch { console.log('✓ Reject bad email'); }

// Validation: reject long title
try { article.validate({ title: 'x'.repeat(121), body: 'ok', status: 'draft' }); console.log('✗ Should reject long title'); process.exit(1); }
catch { console.log('✓ Reject title > max'); }

// Delete
await storage.delete(doc.id);
const after = await storage.list('article');
console.log(`✓ Delete article: ${after.length} remaining`);
NODETEST

echo ""
echo "=== Node integration: assets + media ==="
node --input-type=module << 'ASSETTEST'
import { AssetManager, MemoryBlobStore } from '@verevoir/assets';
import { MemoryAdapter } from '@verevoir/storage';
import { createAssetSource, buildImageUrl } from '@verevoir/media';

const storage = new MemoryAdapter();
const blobStore = new MemoryBlobStore();
const manager = new AssetManager({ storage, blobStore });

// Upload a minimal file
const data = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
const asset = await manager.upload({
  data,
  filename: 'test.png',
  contentType: 'image/png',
  createdBy: 'user-admin',
});
if (asset.id && asset.filename === 'test.png' && asset.contentType === 'image/png' && asset.blobKey) {
  console.log('✓ Upload asset');
} else { console.log('✗ Upload asset'); process.exit(1); }

// Update metadata with hotspot
const updated = await manager.updateMetadata(asset.id, { hotspot: { x: 0.5, y: 0.3 } });
if (updated.hotspot && updated.hotspot.x === 0.5 && updated.hotspot.y === 0.3) {
  console.log('✓ Set hotspot');
} else { console.log('✗ Set hotspot'); process.exit(1); }

// Create AssetSource and get asset info
const source = createAssetSource({
  manager,
  blobUrl: (key) => `http://localhost/${key}`,
});
const info = await source.getAsset(asset.id);
if (info && info.id === asset.id && info.filename === 'test.png' && info.hotspot) {
  console.log('✓ AssetSource getAsset');
} else { console.log('✗ AssetSource getAsset'); process.exit(1); }

// Build imgproxy URL
const url = buildImageUrl(info, { width: 400, height: 300 }, { baseUrl: 'https://imgproxy.example.com' });
if (url.startsWith('https://imgproxy.example.com/') && url.includes('400') && url.includes('300')) {
  console.log('✓ buildImageUrl');
} else { console.log('✗ buildImageUrl: ' + url); process.exit(1); }

// List assets
const list = await manager.list();
if (list.length === 1 && list[0].id === asset.id) {
  console.log('✓ List assets');
} else { console.log('✗ List assets'); process.exit(1); }

// Delete asset
await manager.delete(asset.id);
const afterDelete = await manager.list();
if (afterDelete.length === 0) {
  console.log('✓ Delete asset');
} else { console.log('✗ Delete asset'); process.exit(1); }
ASSETTEST

echo ""
echo "=== Node integration: commerce ==="
node --input-type=module << 'COMMERCETEST'
import {
  money, createBasket, addItem, removeItem, updateItemQuantity,
  basketTotal, convertToOrder, applyPayment, updatePaymentStatus,
  isFullyPaid, changeOwed, orderTotals,
  percentageDiscountEngine, productTypeTaxEngine,
} from '@verevoir/commerce';

// Money helpers
const price = money(25, 'GBP');
if (price.amount !== 25 || price.currency !== 'GBP') { console.log('✗ money()'); process.exit(1); }
console.log('✓ money()');

// Product
const book = { id: 'p1', type: 'books', basePrice: money(30, 'GBP') };
const shirt = { id: 'p2', type: 'clothing', basePrice: money(25, 'GBP') };

// Config with 10% discount + UK VAT
const config = {
  pricingEngines: [percentageDiscountEngine(0.1)],
  taxEngine: productTypeTaxEngine({ books: 0, clothing: 0.2, general: 0.2 }, 0.2),
};

// Basket
let basket = createBasket('b1');
basket = addItem(basket, book, 2, config);
basket = addItem(basket, shirt, 1, config);
if (basket.items.length !== 2) { console.log('✗ addItem'); process.exit(1); }
console.log('✓ addItem — 2 line items');

// Book: 30 * 0.9 = 27, 0% tax, line = 27 * 2 = 54
const bookItem = basket.items.find(i => i.productId === 'p1');
if (bookItem.unitPrice.amount !== 27 || bookItem.tax.amount !== 0) { console.log('✗ book pricing'); process.exit(1); }
console.log('✓ Book pricing: £27.00, 0% tax');

// Shirt: 25 * 0.9 = 22.5, 20% tax = 4.5, line = (22.5 + 4.5) * 1 = 27
const shirtItem = basket.items.find(i => i.productId === 'p2');
if (shirtItem.unitPrice.amount !== 22.5 || shirtItem.tax.amount !== 4.5) { console.log('✗ shirt pricing'); process.exit(1); }
console.log('✓ Shirt pricing: £22.50, £4.50 tax');

// Basket totals
const totals = basketTotal(basket);
if (!totals || totals.subtotal.amount !== 76.5 || totals.tax.amount !== 4.5 || totals.total.amount !== 81) {
  console.log('✗ basketTotal'); process.exit(1);
}
console.log('✓ basketTotal: subtotal=76.50, tax=4.50, total=81.00');

// Update quantity
basket = updateItemQuantity(basket, 'p2', 3, shirt, config);
const updated = basket.items.find(i => i.productId === 'p2');
if (updated.quantity !== 3) { console.log('✗ updateItemQuantity'); process.exit(1); }
console.log('✓ updateItemQuantity');

// Remove item
basket = removeItem(basket, 'p2');
if (basket.items.length !== 1) { console.log('✗ removeItem'); process.exit(1); }
console.log('✓ removeItem');

// Re-add for order test
basket = addItem(basket, shirt, 1, config);

// Convert to order
const order = convertToOrder(basket, 'ord-1');
if (order.items.length !== 2 || order.balance.amount !== 81) { console.log('✗ convertToOrder'); process.exit(1); }
console.log('✓ convertToOrder: balance=81.00');

// Apply payment
let paid = applyPayment(order, { id: 'pay-1', amount: money(81, 'GBP'), status: 'confirmed' });
if (!isFullyPaid(paid) || paid.balance.amount !== 0) { console.log('✗ applyPayment'); process.exit(1); }
console.log('✓ applyPayment: fully paid');

// Overpayment / change
let over = applyPayment(order, { id: 'pay-2', amount: money(100, 'GBP'), status: 'confirmed' });
if (!isFullyPaid(over) || changeOwed(over).amount !== 19) { console.log('✗ changeOwed'); process.exit(1); }
console.log('✓ changeOwed: £19.00');

// Payment status update
let pending = applyPayment(order, { id: 'pay-3', amount: money(81, 'GBP'), status: 'pending' });
if (isFullyPaid(pending)) { console.log('✗ pending should not be paid'); process.exit(1); }
pending = updatePaymentStatus(pending, 'pay-3', 'confirmed');
if (!isFullyPaid(pending)) { console.log('✗ confirmed should be paid'); process.exit(1); }
console.log('✓ updatePaymentStatus: pending → confirmed');
COMMERCETEST

echo ""
echo "=== Node integration: access control ==="
node --input-type=module << 'ACCESSTEST'
import { defineAuthAdapter, definePolicy, defineWorkflow, hasRole, or, ANONYMOUS, isAnonymous } from '@verevoir/access';

// Auth adapter
const auth = defineAuthAdapter({
  resolve: async (token) => {
    const users = {
      admin: { id: 'user-admin', roles: ['admin'] },
      editor: { id: 'user-editor', roles: ['editor'] },
      author: { id: 'user-author', roles: ['author'] },
      viewer: { id: 'user-viewer', roles: ['viewer'] },
    };
    return users[token] ?? null;
  },
});

const admin = await auth.resolve('admin');
const editor = await auth.resolve('editor');
const authorUser = await auth.resolve('author');
const viewer = await auth.resolve('viewer');
const unknown = await auth.resolve('unknown');

if (admin && editor && authorUser && viewer && !unknown) {
  console.log('✓ Auth adapter resolves all roles');
} else {
  console.log('✗ Auth adapter failed'); process.exit(1);
}

// Policy
const policy = definePolicy({
  rules: [
    { role: 'admin', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'editor', actions: ['create', 'read', 'update'] },
    { role: 'author', actions: ['create', 'read'] },
    { role: 'author', actions: ['update', 'delete'], scope: 'own' },
    { role: 'viewer', actions: ['read'] },
  ],
});

// Admin can do everything
if (policy.can(admin, 'delete')) {
  console.log('✓ Admin can delete');
} else { console.log('✗ Admin should delete'); process.exit(1); }

// Editor cannot delete
if (!policy.can(editor, 'delete')) {
  console.log('✓ Editor cannot delete');
} else { console.log('✗ Editor should not delete'); process.exit(1); }

// Author can update own
if (policy.can(authorUser, 'update', { ownerId: 'user-author' })) {
  console.log('✓ Author can update own');
} else { console.log('✗ Author should update own'); process.exit(1); }

// Author cannot update others
if (!policy.can(authorUser, 'update', { ownerId: 'user-admin' })) {
  console.log('✓ Author cannot update others');
} else { console.log('✗ Author should not update others'); process.exit(1); }

// Viewer can only read
if (policy.can(viewer, 'read') && !policy.can(viewer, 'create')) {
  console.log('✓ Viewer can read only');
} else { console.log('✗ Viewer permissions wrong'); process.exit(1); }

// Workflow
const publishing = defineWorkflow({
  name: 'publishing',
  states: ['draft', 'review', 'published', 'archived'],
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'review', guard: or(hasRole('author'), hasRole('editor'), hasRole('admin')) },
    { from: 'review', to: 'published', guard: or(hasRole('editor'), hasRole('admin')) },
    { from: 'review', to: 'draft', guard: or(hasRole('author'), hasRole('editor'), hasRole('admin')) },
    { from: 'published', to: 'archived', guard: hasRole('admin') },
  ],
});

// Author can submit for review
if (publishing.canTransition('draft', 'review', authorUser)) {
  console.log('✓ Author can submit for review');
} else { console.log('✗ Author should submit for review'); process.exit(1); }

// Author cannot publish
if (!publishing.canTransition('review', 'published', authorUser)) {
  console.log('✓ Author cannot publish');
} else { console.log('✗ Author should not publish'); process.exit(1); }

// Editor can publish
if (publishing.canTransition('review', 'published', editor)) {
  console.log('✓ Editor can publish');
} else { console.log('✗ Editor should publish'); process.exit(1); }

// Admin can archive
if (publishing.canTransition('published', 'archived', admin)) {
  console.log('✓ Admin can archive');
} else { console.log('✗ Admin should archive'); process.exit(1); }

// Viewer has no transitions from draft
const viewerTransitions = publishing.availableTransitions('draft', viewer);
if (viewerTransitions.length === 0) {
  console.log('✓ Viewer has no workflow transitions');
} else { console.log('✗ Viewer should have no transitions'); process.exit(1); }

// Anonymous identity
if (isAnonymous(ANONYMOUS)) {
  console.log('✓ isAnonymous(ANONYMOUS) === true');
} else { console.log('✗ isAnonymous should be true for ANONYMOUS'); process.exit(1); }

if (policy.can(ANONYMOUS, 'read')) {
  console.log('✓ ANONYMOUS can read');
} else { console.log('✗ ANONYMOUS should be able to read'); process.exit(1); }

if (!policy.can(ANONYMOUS, 'create')) {
  console.log('✓ ANONYMOUS cannot create');
} else { console.log('✗ ANONYMOUS should not create'); process.exit(1); }

const anonTransitions = publishing.availableTransitions('draft', ANONYMOUS);
if (anonTransitions.length === 0) {
  console.log('✓ ANONYMOUS has no workflow transitions');
} else { console.log('✗ ANONYMOUS should have no transitions'); process.exit(1); }
ACCESSTEST

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "Done: $PASS passed, $FAIL failed"
  exit 1
else
  echo "Done: $PASS passed, all checks OK"
fi
