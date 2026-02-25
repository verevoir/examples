#!/usr/bin/env bash
# Smoke test for the React (Vite) example.
# Starts the dev server, checks routes, and exercises schema+storage logic.
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
import { defineBlock, text, richText, select, boolean, number } from '@nextlake/schema';
import { MemoryAdapter } from '@nextlake/storage';

const storage = new MemoryAdapter();

const article = defineBlock({
  name: 'article',
  fields: {
    title: text('Title').max(120),
    body: richText('Body'),
    status: select('Status', ['draft', 'published', 'archived']),
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
if [ "$FAIL" -gt 0 ]; then
  echo "Done: $PASS passed, $FAIL failed"
  exit 1
else
  echo "Done: $PASS passed, all checks OK"
fi
