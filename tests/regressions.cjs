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
