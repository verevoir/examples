#!/usr/bin/env bash
# Smoke test for the Next.js App Router example.
# Starts the dev server, checks all routes render with expected content.
set -euo pipefail

PORT=${PORT:-3000}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Starting Next.js dev server on port $PORT..."
npx next dev --port "$PORT" &>/dev/null &
SERVER_PID=$!

# Wait for server to be ready
for i in $(seq 1 60); do
  if curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "✗ Server failed to start within 60s"
    exit 1
  fi
  sleep 1
done

echo "Server ready."
PASS=0
FAIL=0

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

check_content() {
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

echo ""
echo "=== Route status checks ==="
check_status "GET /" "http://localhost:$PORT"
check_status "GET /article" "http://localhost:$PORT/article"
check_status "GET /author" "http://localhost:$PORT/author"
check_status "GET /settings" "http://localhost:$PORT/settings"
check_status "GET /article/new" "http://localhost:$PORT/article/new"
check_status "GET /author/new" "http://localhost:$PORT/author/new"
check_status "GET /article/fake-id" "http://localhost:$PORT/article/fake-id"

echo ""
echo "=== Content checks ==="
check_content "Home has NextLake branding" "http://localhost:$PORT" "NextLake"
check_content "Home has sidebar prompt" "http://localhost:$PORT" "Select a content"
check_content "Article list renders" "http://localhost:$PORT/article" "Articles"
check_content "Settings page renders" "http://localhost:$PORT/settings" "Settings"

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
