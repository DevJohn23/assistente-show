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
