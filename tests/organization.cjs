const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} }; new Function('require', 'module', 'exports', code)(require, module, module.exports); return module.exports;
}
const org = load('src/lib/organization.ts');
const layout = load('src/lib/organizationLayout.ts');
const make = (id, manager_id = null, extra = {}) => ({ id, name: id, manager_id, job_title: 'Consultor', status: 'active', department_id: 'sales', unit: '', email: '', phone: '', responsibilities: '', serves: [], ...extra });
const people = [make('director'), make('manager', 'director'), make('analyst', 'manager'), make('other', 'director', { department_id: 'tech' })];
test('leadership validation rejects self, descendants and inactive managers', () => {
  assert.ok(org.validateEmployee({ id: 'manager', manager_id: 'manager', status: 'active' }, people));
  assert.ok(org.validateEmployee({ id: 'director', manager_id: 'analyst', status: 'active' }, people));
  assert.ok(org.validateEmployee({ id: 'manager', manager_id: null, status: 'inactive' }, people));
  assert.equal(org.validateEmployee({ id: 'analyst', manager_id: 'other', status: 'active' }, people), null);
  assert.deepEqual(org.ancestorsOf('analyst', people), ['manager', 'director']);
});
test('collapsed branches, focus and department filters preserve actual hierarchy', () => {
  assert.deepEqual(org.visibleEmployees(people, new Set(['director']), null, '', '', new Map()).map(e => e.id), ['director', 'manager', 'other']);
  assert.deepEqual(org.visibleEmployees(people, new Set(), 'manager', '', '', new Map()).map(e => e.id), ['director', 'manager', 'analyst']);
  assert.deepEqual(org.visibleEmployees(people, new Set(), null, 'tech', '', new Map()).map(e => e.id), ['director', 'other']);
  assert.equal(org.matchesEmployee(make('João', null, { responsibilities: 'Negociação de contratos' }), 'negociacao'), true);
});
test('a large direct team uses compact columns with unique non-overlapping cards', async () => {
  const team = [make('manager'), ...Array.from({ length: 19 }, (_, i) => make('person-' + i, 'manager'))];
  const positions = await layout.layoutOrganization(team);
  assert.equal(positions.size, 20);
  const entries = [...positions.values()];
  for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
    const a = entries[i], b = entries[j];
    assert.ok(a.x + layout.CARD_WIDTH <= b.x || b.x + layout.CARD_WIDTH <= a.x || a.y + layout.CARD_HEIGHT <= b.y || b.y + layout.CARD_HEIGHT <= a.y);
  }
  assert.ok(Math.max(...entries.map(p => p.x)) < 1000);
  assert.equal(entries.filter(p => p.compact).length, 19);
});

const { OrganizationPhotoCache } = load('src/lib/organizationPhotoCache.ts');
test('photo cache retries missing photos and coalesces successful reads', async () => {
  const cache = new OrganizationPhotoCache();
  assert.equal(await cache.load('new', async () => null), '');
  let reads = 0;
  const fetch = async () => { reads++; return new Blob(['photo']); };
  const [a, b] = await Promise.all([cache.load('new', fetch), cache.load('new', fetch)]);
  assert.ok(a.startsWith('blob:')); assert.equal(a, b); assert.equal(reads, 1);
  cache.dispose();
});
test('confirmed photo preview wins over an older in-flight request', async () => {
  const cache = new OrganizationPhotoCache();
  let resolve;
  const pending = cache.load('person', () => new Promise(r => { resolve = r; }));
  await Promise.resolve();
  cache.prime('person', new Blob(['new']));
  resolve(new Blob(['old']));
  assert.equal(await pending, await cache.load('person', () => { throw Error('unexpected fetch'); }));
  cache.dispose();
});
test('sign-out discards in-flight photo reads', async () => {
  const cache = new OrganizationPhotoCache();
  let resolve;
  const pending = cache.load('person', () => new Promise(r => { resolve = r; }));
  await Promise.resolve(); cache.dispose(); resolve(new Blob(['photo']));
  assert.equal(await pending, '');
});
test('thumbnail constrains size and preserves source bytes', async () => {
  const sharp = require('sharp');
  const { organizationThumbnail } = load('src/lib/organizationThumbnail.ts');
  const original = await sharp({ create: { width: 1200, height: 1600, channels: 3, background: '#aabbcc' } }).png().toBuffer();
  const copy = Buffer.from(original);
  const thumbnail = await organizationThumbnail(original.buffer.slice(original.byteOffset, original.byteOffset + original.byteLength));
  const metadata = await sharp(thumbnail).metadata();
  assert.equal(metadata.format, 'webp'); assert.equal(metadata.height, 384); assert.equal(metadata.width, 288);
  assert.deepEqual(original, copy); assert.ok(thumbnail.length < original.length);
});

test('photo endpoint authenticates, versions images and keeps errors out of cache', async () => {
  const { NextRequest, NextResponse } = require('next/server');
  const { organizationPhotoVersion } = load('src/lib/organizationPhotoCache.ts');
  let authenticated = true, downloads = 0;
  const client = { auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'user' } : null } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { photo_path: 'uploads/new.png' } }) }) }) }),
    storage: { from: () => ({ download: async () => { downloads++; return { data: new Blob(['source']) }; } }) } };
  const code = ts.transpileModule(fs.readFileSync('src/app/api/organograma/fotos/[id]/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  const mockRequire = name => name === 'next/server' ? { NextRequest, NextResponse } : name === '@supabase/supabase-js' ? { createClient: () => client } : name.endsWith('organizationThumbnail') ? { organizationThumbnail: async () => Buffer.from('webp') } : { organizationPhotoVersion };
  new Function('require', 'module', 'exports', code)(mockRequire, module, module.exports);
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL, oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid'; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test';
  try {
    const get = (version, token = true) => module.exports.GET(new NextRequest('https://example.invalid/api/photo' + (version ? '?v=' + encodeURIComponent(version) : ''), { headers: token ? { Authorization: 'Bearer test' } : {} }), { params: { id: 'person' } });
    assert.equal((await get(null, false)).status, 401);
    authenticated = false; assert.equal((await get()).status, 401); authenticated = true;
    const stale = await get('avatar-384-v1:uploads/old.png'); assert.equal(stale.status, 409); assert.match(stale.headers.get('Cache-Control'), /no-store/); assert.equal(downloads, 0);
    const valid = await get(organizationPhotoVersion('uploads/new.png'));
    assert.equal(valid.status, 200); assert.equal(valid.headers.get('Content-Type'), 'image/webp');
    assert.equal(valid.headers.get('Cache-Control'), 'private, max-age=300'); assert.equal(valid.headers.get('Vary'), 'Authorization');
    assert.match((await get()).headers.get('Cache-Control'), /no-store/);
  } finally {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  }
});

const { organizationTransition } = load('src/lib/organizationTransition.ts');
test('organization animation interpolates cards, fades exits and settles exactly', () => {
  const node = (id, x) => ({ id, position: { x, y: 0 }, data: {} });
  const before = [node('manager', 0), node('removed', 100)];
  const after = [node('manager', 200), node('added', 300)];
  const sample = organizationTransition(before, after, [], []);
  const middle = sample(.5);
  assert.ok(middle.nodes[0].position.x > 0 && middle.nodes[0].position.x < 200);
  assert.ok(middle.nodes.find(n => n.id === 'added').style.opacity > 0);
  const removed = middle.nodes.find(n => n.id === 'removed');
  assert.equal(removed.style.pointerEvents, 'none'); assert.equal(removed.focusable, false);
  assert.deepEqual(sample(1).nodes, after);
  assert.equal(before[0].position.x, 0);
  const reversed = organizationTransition(middle.nodes, before, [], []);
  assert.equal(reversed(0).nodes[0].position.x, middle.nodes[0].position.x);
  assert.deepEqual(reversed(1).nodes, before);
});
test('organization animation retains exiting edges and interpolates compact routing', () => {
  const old = [{ id: 'edge', source: 'a', target: 'b', data: { busY: 10 } }, { id: 'gone', source: 'a', target: 'c' }];
  const next = [{ id: 'edge', source: 'a', target: 'b', data: { busY: 110 } }];
  const frame = organizationTransition([], [], old, next);
  assert.ok(frame(.5).edges[0].data.busY > 10 && frame(.5).edges[0].data.busY < 110);
  assert.equal(frame(.5).edges.length, 2);
  assert.deepEqual(frame(1).edges, next);
});
