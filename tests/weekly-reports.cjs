const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const XLSX = require('xlsx');
function load(file, mocks = {}) {
  const mod = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', js)(id => id in mocks ? mocks[id] : id.startsWith('.') ? load(path.resolve(path.dirname(file), id + '.ts'), mocks) : require(id), mod, mod.exports);
  return mod.exports;
}
const { weeklyReportPeriod } = load('src/lib/weeklyReportPeriod.ts');
test('closed week uses São Paulo calendar at midnight, year rollover and Sunday boundary', () => {
  assert.deepEqual(weeklyReportPeriod(new Date('2026-10-18T02:59:00Z')), { start: '2026-10-04', end: '2026-10-11' });
  assert.deepEqual(weeklyReportPeriod(new Date('2026-10-18T23:00:00Z')), { start: '2026-10-11', end: '2026-10-18' });
  assert.deepEqual(weeklyReportPeriod(new Date('2027-01-03T23:00:00Z')), { start: '2026-12-27', end: '2027-01-03' });
});
const email = load('src/lib/emailServices.ts');
test('sender rejects shared domains and accepts a custom domain', () => {
  for (const s of ['', 'x', 'onboarding@resend.dev', 'Site <x@site.vercel.app>']) assert.equal(email.validReportSender(s), false);
  assert.equal(email.validReportSender('Assistente <relatorios@example.com>'), true);
});
test('empty Excel contains both report tabs and headers; user text remains literal', () => {
  const empty = XLSX.read(email.generateWeeklyExcelBuffer([]), { type: 'buffer' });
  assert.deepEqual(empty.SheetNames, ['Comissões', 'Oportunidades']);
  assert.equal(empty.Sheets['Comissões'].A1.v, 'Cliente');
  const wb = XLSX.read(email.generateWeeklyExcelBuffer([{ client_name: '=1+1', sale_amount: 100, commission_amount: 10, installer_option: 'me', registration_type: 'own', sale_date: '2026-10-12', status: 'pending' }]), { type: 'buffer' });
  assert.equal(wb.Sheets['Comissões'].A2.t, 's');
  assert.equal(wb.Sheets['Comissões'].A2.f, undefined);
  assert.equal(wb.Sheets['Comissões'].F2.v, 'Eu');
});
test('Resend rejection is not success and recipient HTML is escaped', async () => {
  const previous = { key: process.env.RESEND_API_KEY, from: process.env.WEEKLY_REPORT_FROM };
  process.env.RESEND_API_KEY = 'test'; process.env.WEEKLY_REPORT_FROM = 'reports@example.com';
  let payload;
  const service = load('src/lib/emailServices.ts', { resend: { Resend: class { emails = { send: async p => { payload = p; return { error: { message: 'Forbidden' }, data: null }; } }; } } });
  try {
    await assert.rejects(service.sendWeeklyReportEmail('test@example.com', '<script>x</script>', [], [], { start: '2026-10-11', end: '2026-10-18' }, 'user'), /provider/);
    assert.ok(!payload.html.includes('<script>'));
    assert.match(payload.html, /&lt;script&gt;/);
    assert.match(payload.text, /Não houve movimentação/);
  } finally {
    for (const [env, value] of [['RESEND_API_KEY', previous.key], ['WEEKLY_REPORT_FROM', previous.from]]) {
      if (value === undefined) delete process.env[env]; else process.env[env] = value;
    }
  }
});
test('cron paginates users and data, isolates owners, includes empty reports and deduplicates reruns', async () => {
  const original = { ...process.env };
  Object.assign(process.env, { CRON_SECRET: 'test', NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test', RESEND_API_KEY: 'test', WEEKLY_REPORT_FROM: 'reports@example.com' });
  const ledger = new Map(), sent = [], pages = [], queries = [];
  const users = Array.from({ length: 101 }, (_, i) => ({ id: `user${i}`, email: `user${i}@example.com` }));
  const db = {
    auth: { admin: { listUsers: async ({ page, perPage }) => { pages.push(page); return { data: { users: users.slice((page - 1) * perPage, page * perPage) } }; } } },
    from(table) {
      let action = 'select', payload, filters = {}, cursor;
      const q = {
        select() { return q; }, eq(k, v) { filters[k] = v; return q; },
        in(k, v) { filters.statuses = v; return q; },
        gte(k, v) { filters.start = v; return q; }, lt(k, v) { filters.end = v; return q; },
        order() { return q; }, limit() { return q; }, gt(k, v) { cursor = v; return q; },
        insert(v) { action = 'insert'; payload = v; return q; },
        update(v) { action = 'update'; payload = v; return q; },
        maybeSingle() { return q; }, single() { return q; },
        then(resolve, reject) {
          try {
            if (table === 'weekly_report_deliveries') {
              const key = (payload?.user_id || filters.user_id) + ':' + (payload?.period_start || filters.period_start);
              if (action === 'insert') {
                if (ledger.has(key)) return Promise.resolve({ error: { code: '23505' } }).then(resolve);
                ledger.set(key, payload);
              } else if (action === 'update') ledger.set(key, { ...ledger.get(key), ...payload });
              return Promise.resolve({ data: ledger.get(key) || null }).then(resolve);
            }
            assert.ok(filters.user_id);
            if (table === 'commissions') { assert.equal(filters.start, '2026-10-11'); assert.equal(filters.end, '2026-10-18'); }
            else { assert.deepEqual(filters.statuses, ['active', 'renewed', 'expired']); assert.equal(filters.start, undefined); }
            queries.push({ table, user: filters.user_id, cursor });
            const data = table === 'commissions' && filters.user_id === 'user0'
              ? Array.from({ length: cursor ? 1 : 500 }, (_, i) => ({ id: String(i), user_id: filters.user_id })) : [];
            return Promise.resolve({ data }).then(resolve);
          } catch (err) { return Promise.reject(err).then(resolve, reject); }
        },
      };
      return q;
    },
  };
  const mocks = {
    '@supabase/supabase-js': { createClient: () => db },
    '@/lib/weeklyReportPeriod': { weeklyReportPeriod: () => ({ start: '2026-10-11', end: '2026-10-18' }) },
    '@/lib/emailServices': { reportEmailConfigured: () => true, sendWeeklyReportEmail: async (to, name, commissions, opportunities, period, id) => {
      assert.ok(commissions.every(c => c.user_id === id)); sent.push({ id, count: commissions.length }); return `provider-${id}`;
    } },
  };
  const mod = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync('src/app/api/cron/weekly-report/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', 'setTimeout', js)(id => mocks[id] || require(id), mod, mod.exports, fn => fn());
  try {
    const req = new Request('https://example.invalid', { headers: { authorization: 'Bearer test' } });
    assert.equal((await mod.exports.GET(req)).status, 200);
    assert.equal(sent.length, 101); assert.equal(sent[0].count, 501); assert.equal(sent[1].count, 0);
    assert.deepEqual(pages, [1, 2]);
    assert.equal((await mod.exports.GET(req)).status, 200); assert.equal(sent.length, 101);
    ledger.set('user0:2026-10-11', { status: 'needs_review' });
    assert.equal((await mod.exports.GET(req)).status, 503); assert.equal(sent.length, 101);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
test('Gmail uses TLS, authenticated sender and rejects unconfirmed recipients', async () => {
  const original = { ...process.env };
  Object.assign(process.env, { WEEKLY_REPORT_PROVIDER: 'gmail', GMAIL_USER: 'test@gmail.com', GMAIL_APP_PASSWORD: 'aaaa bbbb cccc dddd' });
  delete process.env.RESEND_API_KEY;
  let settings, message, rejected = false, closed = 0;
  const service = load('src/lib/emailServices.ts', { nodemailer: { createTransport: options => {
    settings = options;
    return { close: () => closed++, sendMail: async p => { message = p; return { messageId: 'test-id', accepted: rejected ? [] : ['recipient@example.com'], rejected: rejected ? ['recipient@example.com'] : [] }; } };
  } } });
  try {
    assert.equal(service.reportEmailConfigured(), true);
    const args = ['recipient@example.com', 'Teste', [], [], { start: '2026-10-11', end: '2026-10-18' }, 'test'];
    assert.equal(await service.sendWeeklyReportEmail(...args), 'test-id');
    assert.equal(settings.secure, true);
    assert.equal(settings.host, 'smtp.gmail.com');
    assert.equal(settings.auth.pass, 'aaaabbbbccccdddd');
    assert.equal(message.from.address, 'test@gmail.com');
    assert.equal(message.from.name, 'Assistente Omnilink — Relatórios');
    rejected = true;
    await assert.rejects(service.sendWeeklyReportEmail(...args), /unconfirmed/);
    assert.equal(closed, 2);
    process.env.GMAIL_APP_PASSWORD = '';
    assert.equal(service.reportEmailConfigured(), false);
    process.env.WEEKLY_REPORT_PROVIDER = 'invalid';
    assert.equal(service.reportEmailConfigured(), false);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
test('portfolio includes old open leads, excludes closed leads and uses inclusive next Monday–Sunday boundaries', () => {
  const { summarizeOpportunities } = load('src/lib/reportOpportunities.ts');
  const lead = (id, date, status = 'active') => ({ id, client_name: id, expiration_date: date, status, registration_date: '2025-01-01' });
  const summary = summarizeOpportunities([
    lead('next-Monday', '2026-10-26'), lead('Sunday', '2026-10-25'), lead('Monday', '2026-10-19', 'renewed'),
    lead('won', '2026-10-20', 'won'), lead('lost', '2026-10-21', 'lost'), lead('overdue', '2026-10-17'), lead('today', '2026-10-18'),
  ], '2026-10-18');
  assert.deepEqual(summary.upcoming.map(x => x.id), ['Monday', 'Sunday']);
  assert.deepEqual(summary.overdue.map(x => x.id), ['overdue']);
  assert.deepEqual(summary.today.map(x => x.id), ['today']);
  assert.equal(summary.all.length, 5);
  assert.equal(summary.daysRemaining('2026-10-19'), 1);
  const year = summarizeOpportunities([lead('new-year', '2027-01-03')], '2026-12-27');
  assert.equal(year.upcoming.length, 1);
});
test('diagnostic endpoint requires cron authorization before any database or sending operation', async () => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'diagnostic-test';
  const { POST } = load('src/app/api/cron/weekly-report/test/route.ts', {
    '@supabase/supabase-js': { createClient: () => { throw new Error('Unexpected database access'); } },
    '@/lib/emailServices': {}, '@/lib/weeklyReportPeriod': {}, '@/lib/reportOpportunities': {},
  });
  try {
    assert.equal((await POST(new Request('https://example.invalid', { method: 'POST' }))).status, 401);
  } finally { if (previous === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = previous; }
});
