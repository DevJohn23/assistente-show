const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');

// Execute the real TypeScript modules with an isolated HTTP transport.
function load(relativePath, overrides = {}) {
  const filename = path.resolve(relativePath);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  const localRequire = (id) => {
    if (id in overrides) return overrides[id];
    if (id.startsWith('.')) return load(path.resolve(path.dirname(filename), id + '.ts'), overrides);
    return require(id);
  };
  new Function('require', 'module', 'exports', js)(localRequire, mod, mod.exports);
  return mod.exports;
}
const { getMonthlyCommissionSummary } = load('src/lib/dashboardSummary.ts');
test('quote storage isolates owners, rejects anonymous writes and removes only legacy drafts', () => {
  const previous = global.localStorage;
  const values = new Map([['assistente_show_cart', 'legacy'], ['assistente_show_theme', 'dark']]);
  global.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) };
  try {
    const storage = load('src/lib/quoteStorage.ts');
    storage.writeQuoteValue('A', 'assistente_show_cart', 'draft A');
    assert.equal(storage.readQuoteValue('B', 'assistente_show_cart'), null);
    storage.writeQuoteValue('B', 'assistente_show_cart', 'draft B');
    storage.writeQuoteValue('', 'assistente_show_cart', 'anonymous');
    storage.clearLegacyQuote();
    assert.equal(storage.readQuoteValue('A', 'assistente_show_cart'), 'draft A');
    assert.equal(storage.readQuoteValue('B', 'assistente_show_cart'), 'draft B');
    assert.equal(storage.readQuoteValue('', 'assistente_show_cart'), null);
    assert.equal(values.has('assistente_show_cart'), false);
    assert.equal(values.get('assistente_show_theme'), 'dark');
    global.localStorage = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); }, removeItem() { throw Error('denied'); } };
    assert.equal(storage.readQuoteValue('A', 'cart'), null);
    assert.doesNotThrow(() => storage.writeQuoteValue('A', 'cart', '[]'));
    assert.doesNotThrow(() => storage.clearLegacyQuote());
  } finally { global.localStorage = previous; }
});

test('cron fails closed in development and production, ignores URL credentials and needs service configuration', async () => {
  const original = { ...process.env };
  let clients = 0, emails = 0;
  const { GET } = load('src/app/api/cron/weekly-report/route.ts', {
    '@/lib/dateUtils': { getLocalDateString: () => '2026-10-01' },
    '@/lib/emailServices': { sendWeeklyReportEmail: async () => { emails++; } },
    '@supabase/supabase-js': { createClient: () => { clients++; return {
      from: () => ({ select: async () => ({ data: [], error: null }) }),
      auth: { admin: { listUsers: async () => ({ data: { users: [] }, error: null }) } },
    }; } },
  });
  const request = (header, query = '') => new Request('http://localhost/api/cron/weekly-report' + query, { headers: header ? { authorization: header } : {} });
  try {
    for (const env of ['development', 'production']) {
      process.env.NODE_ENV = env;
      delete process.env.CRON_SECRET;
      assert.equal((await GET(request('Bearer undefined'))).status, 401);
      process.env.CRON_SECRET = 'test-secret-only';
      assert.equal((await GET(request())).status, 401);
      assert.equal((await GET(request('Bearer wrong'))).status, 401);
      assert.equal((await GET(request(null, '?secret=test-secret-only&email=other@example.invalid'))).status, 401);
    }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid';
    process.env.RESEND_API_KEY = 'test-only';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal((await GET(request('Bearer test-secret-only'))).status, 503);
    assert.equal(clients, 0);
    assert.equal(emails, 0);
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-only';
    const result = await GET(request('Bearer test-secret-only'));
    assert.equal(result.status, 200);
    assert.equal((await result.json()).success, true);
    assert.equal(clients, 1);
    assert.equal(emails, 0);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
const records = [
  { sale_date: '2026-09-30', commission_amount: 900 },
  { sale_date: '2026-10-01', commission_amount: 100 },
  { sale_date: '2026-10-31', commission_amount: 200 },
  { sale_date: '2026-11-01', commission_amount: 800 },
  { sale_date: '2025-10-01', commission_amount: 700 },
];
test('dashboard includes only the current month and year', () => {
  assert.deepEqual(getMonthlyCommissionSummary(records, new Date(2026, 9, 10)), { salesCount: 2, expectedCommission: 300 });
});
test('dashboard uses local date at UTC month rollover', () => {
  process.env.TZ = 'America/Sao_Paulo';
  assert.deepEqual(getMonthlyCommissionSummary(records, new Date('2026-11-01T01:30:00Z')), { salesCount: 2, expectedCommission: 300 });
});
test('dashboard handles an empty month and year rollover', () => {
  assert.deepEqual(getMonthlyCommissionSummary(records, new Date(2027, 0, 1)), { salesCount: 0, expectedCommission: 0 });
});
function serviceFor(status, body, networkFailure = false) {
  const supabase = createClient('https://example.invalid', 'test-publishable-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async () => {
      if (networkFailure) throw new Error('Simulated connection loss');
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    } },
  });
  return load('src/lib/supabaseServices.ts', { './supabase': { supabase } });
}
for (const fn of ['updateOpportunity','deleteOpportunity','updateCommission','deleteCommission','updateQuoteTemplate','deleteQuoteTemplate','createSeller']) {
  test(`${fn}: confirmed row succeeds, permissions/zero rows/network failure do not`, async () => {
    const args = fn === 'createSeller' ? ['user-test', 'Test Seller'] : ['id-test', {}];
    assert.equal(await serviceFor(200, { id: 'id-test' })[fn](...args), true);
    assert.equal(await serviceFor(403, { message: 'permission denied', code: '42501' })[fn](...args), false);
    assert.equal(await serviceFor(406, { message: '0 rows', code: 'PGRST116' })[fn](...args), false);
    assert.equal(await serviceFor(200, null, true)[fn](...args), false);
  });
}
for (const fn of ['fetchOpportunities','fetchCommissions','fetchSellers','fetchQuoteTemplates']) {
  test(`${fn}: distinguishes empty results from failed reads`, async () => {
    assert.deepEqual(await serviceFor(200, [])[fn]('user-test'), []);
    await assert.rejects(serviceFor(403, { message: 'permission denied', code: '42501' })[fn]('user-test'));
    await assert.rejects(serviceFor(200, null, true)[fn]('user-test'));
  });
}


test('catalog keeps featured products first after photo edits and reordered responses', () => {
  const { orderCatalogProducts } = load('src/lib/catalogOrder.ts');
  const original = [1, 2, 3, 10, 11].map(n => ({ id: `prod-${n}`, name: `Produto ${n}`, image_url: 'before.png' }));
  const updated = [{ ...original[4] }, { ...original[2] }, { ...original[1] }, { ...original[3] }, { ...original[0], image_url: 'after.png', name: 'Nome editado', default_price: 123 }];
  const inputOrder = updated.map(p => p.id);
  assert.deepEqual(orderCatalogProducts(updated).map(p => p.id), original.map(p => p.id));
  assert.deepEqual(updated.map(p => p.id), inputOrder);
  assert.equal(orderCatalogProducts(updated)[0].image_url, 'after.png');
  assert.deepEqual(orderCatalogProducts([{ id: 'prod-10' }, { id: 'prod-3' }]).map(p => p.id), ['prod-3', 'prod-10']);
});
