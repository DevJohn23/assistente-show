// Browser interaction tests with isolated Supabase transport; never modify live data.
// Optional ORG_FIXTURE supplies a private local import preview; default data is fictional.
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const userId = '00000000-0000-4000-8000-000000000099';
let admin = true, failWrites = false, writes = 0;
let uploads = 0, earlyPhotoReads = 0, retryPhotoReads = 0, transientPhotoFailure = false;
const testPhoto = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const fixture = process.env.ORG_FIXTURE ? JSON.parse(fs.readFileSync(process.env.ORG_FIXTURE)) : Array.from({ length: 20 }, (_, i) => ({ id: i ? `person-${i}` : 'manager', name: i ? `Colaborador ${i}` : 'Gestor Teste', job_title: i ? 'Consultor de vendas' : 'Gestão de Vendas', department_id: 'comercial', manager_id: i ? 'manager' : null, phone: '', email: '', unit: '', responsibilities: '', serves: [], photo_path: '', is_example: false, status: 'active', sort_order: i }));
let people = fixture.map(p => ({ extension: '', ...p, created_at: '2026-10-13T12:00:00Z', updated_at: '2026-10-13T12:00:00Z' }));
let departments = [{ id: 'comercial', name: 'Comercial', color: '#2563eb' }];
const manager = people[0], target = people[3];
(async () => {
 const browser = await chromium.launch({ headless: true, executablePath: process.env.TEST_BROWSER_EXECUTABLE || '/opt/brave.com/brave/brave', args: ['--no-sandbox'] });
 let page;
 try {
 const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, timezoneId: 'America/Sao_Paulo' });
 await context.addInitScript(({ userId }) => {
   const user = { id: userId, email: 'org-test@example.invalid', user_metadata: { full_name: 'Administrador Teste' }, aud: 'authenticated', role: 'authenticated' };
   const exp = Math.floor(Date.now()/1000) + 3600;
   const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: userId, exp, role: 'authenticated' })) + '.test';
   localStorage.setItem('sb-nwuheljjsviakffyeqmx-auth-token', JSON.stringify({ access_token: token, refresh_token: 'test', token_type: 'bearer', expires_at: exp, expires_in: 3600, user }));
   localStorage.setItem('omnilink_sidebar_collapsed', 'true');
 }, { userId });
 await context.route('**/*', async route => {
   const request = route.request(), url = new URL(request.url());
   if (url.pathname.startsWith('/api/organograma/fotos/')) {
     const id = decodeURIComponent(url.pathname.split('/').pop());
     if (!process.env.ORG_FIXTURE) {
       const employee = people.find(p => p.id === id);
       if (!employee?.photo_path) { earlyPhotoReads++; return route.fulfill({ status: 404 }); }
       assert.equal(url.searchParams.get('v'), 'avatar-384-v1:' + employee.photo_path);
       retryPhotoReads++;
       if (transientPhotoFailure) { transientPhotoFailure = false; return route.fulfill({ status: 503 }); }
       return route.fulfill({ contentType: 'image/png', body: testPhoto });
     }
     const manifest = JSON.parse(fs.readFileSync('assets/organization/manifest.json'));
     return manifest[id] ? route.fulfill({ contentType: 'image/png', body: fs.readFileSync('assets/organization/' + manifest[id]) }) : route.fulfill({ status: 404 });
   }
   if (url.hostname === '127.0.0.1') return route.continue();
   if (!url.hostname.endsWith('.supabase.co')) return route.abort();
   const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
   if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
   if (url.pathname.startsWith('/storage/v1/object/') && request.method() === 'POST') { uploads++; return json(200, { Key: url.pathname.split('/object/')[1] }); }
   const table = url.pathname.split('/').pop();
   if (table === 'can_manage_organization') return json(200, admin);
   if (request.method() === 'GET') {
     if (table === 'admin_users') return json(200, admin ? { email: 'org-test@example.invalid' } : null);
     if (table === 'org_history') return json(200, []);
     if (table === 'org_employees') return json(200, people);
     if (table === 'org_departments') return json(200, departments);
     return json(200, []);
   }
   if (!['org_employees', 'org_departments'].includes(table)) return json(200, {});
   writes++;
   await new Promise(r => setTimeout(r, 100));
   if (!admin || failWrites) return json(403, { code: '42501', message: 'Rejected' });
   let body = request.postDataJSON(); if (Array.isArray(body)) body = body[0];
   const items = table === 'org_employees' ? people : departments;
   const id = url.searchParams.get('id')?.replace('eq.', '');
   if (request.method() === 'POST') { const row = { ...body, id: 'new-' + writes, updated_at: new Date().toISOString() }; items.push(row); return json(201, row); }
   const index = items.findIndex(p => p.id === id);
   if (index < 0) return json(406, { code: 'PGRST116' });
   if (request.method() === 'DELETE') items.splice(index, 1);
   else items[index] = { ...items[index], ...body, updated_at: new Date().toISOString() };
   return json(200, items[index] || { id });
 });
 page = await context.newPage(); page.setDefaultTimeout(20000); page.setDefaultNavigationTimeout(120000);
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto(base + '/organograma');
 await page.getByRole('heading', { name: 'Organograma', exact: true }).waitFor();
 await page.locator('.react-flow__node').first().waitFor();
 await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length === 20);
 await page.locator('.react-flow__node').first().focus();
 await page.keyboard.press('Enter');
 await page.getByRole('heading', { name: manager.name, exact: true }).waitFor();
 await page.getByRole('button', { name: 'Fechar perfil' }).click();
 assert.equal((await context.request.get(base + '/api/organograma/fotos/' + manager.id)).status(), 401);
 await page.waitForTimeout(500);
 await page.screenshot({ path: '/tmp/org-overview.png', fullPage: true });
 const before = await page.locator('.react-flow__viewport').getAttribute('style');
 await page.getByLabel('Buscar pessoa, cargo ou atribuição').fill(target.name);
 await page.locator('.org-search-results').getByRole('button').filter({ hasText: target.name }).click();
 await page.getByRole('heading', { name: target.name, exact: true }).waitFor();
 await page.waitForTimeout(600);
 assert.notEqual(await page.locator('.react-flow__viewport').getAttribute('style'), before);
 await page.screenshot({ path: '/tmp/org-profile.png', fullPage: true });
 await page.getByRole('button', { name: 'Focar nesta pessoa', exact: true }).click();
 await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length === 2);
 await page.getByRole('button', { name: 'Voltar', exact: true }).click();
 await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length === 20);
 await page.getByRole('button', { name: 'Fechar perfil' }).click();
 await page.getByRole('button', { name: 'Lista', exact: true }).click();
 assert.equal(await page.locator('.org-directory-person').count(), 20);
 await page.getByRole('button', { name: 'Áreas', exact: true }).click();
 await page.locator('.org-area h2').waitFor();
 await page.getByRole('link', { name: 'Gerenciar', exact: true }).click();
 await page.getByRole('heading', { name: 'Gestão da organização' }).waitFor();
 await page.screenshot({ path: '/tmp/org-admin.png', fullPage: true });
 await page.getByRole('button', { name: 'Editar ' + manager.name, exact: true }).click();
 let dialog = page.getByRole('dialog');
 await dialog.getByLabel('Situação', { exact: true }).selectOption('inactive');
 await dialog.getByRole('button', { name: 'Salvar colaborador', exact: true }).click();
 await dialog.getByRole('alert').filter({ hasText: 'Reatribua' }).waitFor();
 await dialog.getByLabel('Situação', { exact: true }).selectOption('active');
 await dialog.getByLabel('Atribuições', { exact: true }).fill('Gerir a equipe e acompanhar metas.');
 await page.screenshot({ path: '/tmp/org-editor.png' });
 failWrites = true; const count = writes;
 await dialog.getByRole('button', { name: 'Salvar colaborador' }).evaluate(b => { b.click(); b.click(); });
 await dialog.getByRole('alert').filter({ hasText: 'permissão' }).waitFor(); assert.equal(writes, count + 1);
 assert.equal(await dialog.getByLabel('Atribuições', { exact: true }).inputValue(), 'Gerir a equipe e acompanhar metas.');
 failWrites = false; await dialog.getByRole('button', { name: 'Salvar colaborador' }).click(); await dialog.waitFor({ state: 'hidden' });
 assert.equal(people[0].responsibilities, 'Gerir a equipe e acompanhar metas.');
 await page.getByRole('button', { name: 'Novo colaborador', exact: true }).click(); dialog = page.getByRole('dialog');
 await dialog.getByLabel('Nome completo', { exact: true }).fill('Pessoa Teste');
 await dialog.getByLabel('Cargo', { exact: true }).fill('Analista');
 await dialog.getByLabel('Responde a', { exact: true }).selectOption(manager.id);
 await dialog.getByRole('button', { name: 'Salvar colaborador' }).click(); await dialog.waitFor({ state: 'hidden' });
 assert.equal(people.length, 21);
 await page.reload(); await page.getByRole('button', { name: 'Editar Pessoa Teste', exact: true }).waitFor();
 if (!process.env.ORG_FIXTURE) {
   const editPhoto = async () => { await page.getByRole('button', { name: 'Editar Pessoa Teste', exact: true }).click(); return page.getByRole('dialog'); };
   dialog = await editPhoto();
   await dialog.getByLabel('Foto do colaborador').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: testPhoto });
   failWrites = true;
   await dialog.getByRole('button', { name: 'Salvar colaborador' }).click();
   await dialog.getByRole('alert').filter({ hasText: 'permissão' }).waitFor();
   assert.equal(uploads, 1); assert.equal(earlyPhotoReads, 0);
   await dialog.getByAltText('Prévia da nova foto').waitFor();
   failWrites = false;
   await dialog.getByRole('button', { name: 'Salvar colaborador' }).click(); await dialog.waitFor({ state: 'hidden' });
   assert.equal(uploads, 1); assert.equal(earlyPhotoReads, 0);
   let row = page.locator('tr').filter({ has: page.getByRole('button', { name: 'Editar Pessoa Teste', exact: true }) });
   await row.locator('img').waitFor();
   const oldPath = people.find(p => p.name === 'Pessoa Teste').photo_path;
   dialog = await editPhoto();
   await dialog.getByLabel('Foto do colaborador').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: testPhoto });
   await dialog.getByRole('button', { name: 'Salvar colaborador' }).click(); await dialog.waitFor({ state: 'hidden' });
   assert.notEqual(people.find(p => p.name === 'Pessoa Teste').photo_path, oldPath);
   assert.equal(uploads, 2);
   transientPhotoFailure = true; const readsBefore = retryPhotoReads;
   await page.reload();
   await page.waitForFunction(() => [...document.querySelectorAll('tr')].some(r => r.textContent.includes('Pessoa Teste') && r.querySelector('img')?.naturalWidth > 0));
   assert.ok(retryPhotoReads >= readsBefore + 2);
   dialog = await editPhoto(); await dialog.getByRole('button', { name: 'Remover foto', exact: true }).click();
   await dialog.getByRole('button', { name: 'Salvar colaborador' }).click(); await dialog.waitFor({ state: 'hidden' });
   assert.equal(people.find(p => p.name === 'Pessoa Teste').photo_path, '');
   assert.equal(earlyPhotoReads, 0);
 }
 await page.getByRole('button', { name: 'Departamentos', exact: true }).click();
 await page.getByRole('button', { name: 'Novo departamento' }).click(); dialog = page.getByRole('dialog');
 await dialog.getByLabel('Nome do departamento').fill('Operações'); await dialog.getByRole('button', { name: 'Salvar departamento' }).click(); await dialog.waitFor({ state: 'hidden' });
 assert.equal(departments.length, 2);
 await page.getByRole('button', { name: 'Histórico', exact: true }).click(); await page.getByText('Nenhuma alteração registrada.').waitFor();
 admin = false; await page.reload(); await page.getByRole('heading', { name: 'Acesso restrito' }).waitFor();
 await page.goto(base + '/organograma'); await page.getByRole('heading', { name: 'Organograma', exact: true }).waitFor();
 assert.equal(await page.getByRole('link', { name: 'Gerenciar', exact: true }).count(), 0);
 await page.setViewportSize({ width: 390, height: 844 }); await page.reload();
 await page.locator('.org-directory-person').first().waitFor(); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 await page.screenshot({ path: '/tmp/org-mobile.png', fullPage: true });
 await page.locator('.org-directory-person').filter({ hasText: target.name }).click(); await page.getByRole('heading', { name: target.name, exact: true }).waitFor();
 await page.screenshot({ path: '/tmp/org-mobile-profile.png' });
 await page.getByRole('button', { name: 'Focar nesta pessoa' }).click();
 await page.getByRole('dialog').waitFor({ state: 'hidden' });
 await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length === 2);
 await page.getByRole('button', { name: 'Visão geral', exact: true }).click();
 await page.setViewportSize({ width: 1500, height: 1000 }); await page.evaluate(() => document.documentElement.classList.add('dark'));
 await page.getByRole('button', { name: 'Hierarquia', exact: true }).click(); await page.waitForTimeout(700); await page.screenshot({ path: '/tmp/org-dark.png', fullPage: true });
 assert.deepEqual(errors, []);
 console.log('PASS: 20-person map, animated search, focus/back, list/areas, admin create/update/reload, error preservation, duplicate protection, manager validation, department creation, restricted access, mobile, dark theme and no runtime errors. Transport mocked; no production writes.');
 } catch (error) { if (page) { console.error((await page.locator('body').innerText()).slice(0,2500)); await page.screenshot({ path: '/tmp/org-failure.png' }); } throw error; }
 finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
