// Run with Playwright available in NODE_PATH and a local server at TEST_BASE_URL.
// Supabase requests are intercepted; these tests never write production data.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const userId = '00000000-0000-4000-8000-000000000001';
const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const month = today.slice(0, 7);
const oldMonth = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
const product = { id:'test-product', category_id:'cat-1', name:'Equipamento Teste', default_price:1000, monthly_fee:20, is_active:true, commercial_rules:{allow_pix:true,allow_boleto:true,allow_card:true,allow_financing:false,max_card_installments:12,max_boleto_installments:3} };
const opportunity = { id:'test-opp',user_id:userId,client_name:'Cliente Existente',cpf_cnpj:'12345678901',type:'PF',phone:'83999999999',registration_date:month+'-01',expiration_date:today,status:'active' };
const commission = {id:'test-comm',user_id:userId,client_name:'Venda Atual',sale_amount:1000,commission_amount:100,sale_date:month+'-01',installer_option:'me',registration_type:'own',status:'pending'};
const tables = {products:[product],opportunities:[opportunity],commissions:[commission,{...commission,id:'old-sale',client_name:'Venda Antiga',sale_date:oldMonth+'-01',commission_amount:900}],sellers:[],quote_templates:[],admin_users:[]};
let failWrites = false, failReads = false, writes = 0;
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.TEST_BROWSER_EXECUTABLE});
 let debugPage;
 try {
 const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'America/Sao_Paulo'});
 await context.addInitScript(({userId}) => {
   const user = {id:userId,email:'test@example.invalid',user_metadata:{full_name:'Teste'},aud:'authenticated',role:'authenticated'};
   const exp = Math.floor(Date.now()/1000)+3600;
   const token = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:userId,exp,role:'authenticated'}))+'.test-signature';
   localStorage.setItem('sb-nwuheljjsviakffyeqmx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,expires_at:exp,user}));
 },{userId});
 await context.route('**/*', async route => {
   const request=route.request(),url=new URL(request.url());
   if(url.hostname==='127.0.0.1') return route.continue();
   if(!url.hostname.endsWith('.supabase.co')) return route.abort();
   const table=url.pathname.split('/').pop();
   const json=(status,body)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   if(url.pathname === '/auth/v1/logout') return route.fulfill({status:204});
   if(request.method()==='OPTIONS') return route.fulfill({status:204});
   if(request.method()==='GET') {
     if(failReads && table==='commissions') return json(503,{message:'Simulated read outage'});
     if(!(table in tables)) return json(200,{});
     const single=request.headers().accept?.includes('pgrst.object');
     return json(200,single ? tables[table][0] || null : tables[table]);
   }
   writes++;
   await new Promise(resolve=>setTimeout(resolve,150));
   if(failWrites) return json(403,{message:'Simulated write rejection',code:'42501'});
   let body=request.postDataJSON();
   if(Array.isArray(body)) body=body[0];
   if(request.method()==='POST') { const row={...body,id:'created-'+writes}; tables[table].push(row); return json(201,row); }
   const id=url.searchParams.get('id')?.replace(/^eq\./,'');
   const index=tables[table].findIndex(row=>row.id===id);
   if(index<0) return json(406,{message:'No row affected',code:'PGRST116'});
   if(request.method()==='DELETE') tables[table].splice(index,1);
   else tables[table][index]={...tables[table][index],...body};
   return json(200,{id});
 });
 const page=await context.newPage(); debugPage=page;
 page.setDefaultTimeout(12000);
 page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('BROWSER ERROR', e.message)});
 await page.goto(baseURL);
 await page.getByRole('button',{name:'Oportunidades',exact:true}).click();
 await page.getByRole('button',{name:'Nova Oportunidade',exact:true}).click();
 const editor=page.getByRole('dialog',{name:'Nova Oportunidade',exact:true});
 await editor.getByLabel('Nome do cliente *',{exact:true}).fill('Contato PJ');
 await editor.getByLabel('CPF ou CNPJ *',{exact:true}).fill('12345678000100');
 await editor.getByLabel('Telefone / WhatsApp *',{exact:true}).fill('11999998888');
 await editor.getByLabel('Data de cadastro',{exact:true}).fill('2026-01-01');
 assert.equal(await editor.getByLabel('Data de vencimento *',{exact:true}).inputValue(),'2026-01-16');
 await editor.getByLabel('Tipo de pessoa',{exact:true}).selectOption('PJ');
 assert.equal(await editor.getByLabel('Data de vencimento *',{exact:true}).inputValue(),'2026-01-31');
 await editor.getByLabel('Data de vencimento *',{exact:true}).fill('2026-02-04');
 await editor.getByLabel('Observações',{exact:true}).fill('Retornar com a proposta completa.');
 failWrites=true;const before=writes;await editor.getByRole('button',{name:'Salvar Registro'}).evaluate(b=>{b.click();b.click();});await editor.getByRole('alert').waitFor();assert.equal(writes,before+1);assert.equal(await editor.getByLabel('Nome do cliente *',{exact:true}).inputValue(),'Contato PJ');
 failWrites=false;await editor.getByRole('button',{name:'Salvar Registro'}).click();await editor.waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Pessoa jurídica',exact:true}).click();assert.equal(await page.locator('tbody tr').count(),1);
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar Excel'}).click();const dl=await downloadPromise;const XLSX=require('xlsx');const book=XLSX.readFile(await dl.path());const exported=XLSX.utils.sheet_to_json(book.Sheets.Oportunidades);assert.equal(exported.length,1);assert.equal(exported[0]['Data Vencimento'],'2026-02-04');
 const wa=await page.getByRole('link',{name:'WhatsApp de Contato PJ'}).getAttribute('href');assert.equal(wa,'https://wa.me/5511999998888');
 await page.getByRole('button',{name:'Observações de Contato PJ'}).click();await page.getByText('Retornar com a proposta completa.',{exact:true}).last().waitFor();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Editar Contato PJ',exact:true}).click();await page.getByRole('dialog').getByLabel('Empresa (opcional)',{exact:true}).fill('Empresa Teste');await page.getByRole('button',{name:'Salvar Registro'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Renovar Contato PJ',exact:true}).click();failWrites=true;const renew=page.getByRole('dialog',{name:'Renovar Oportunidade'});await renew.getByRole('button',{name:'Confirmar'}).click();await renew.getByRole('alert').waitFor();failWrites=false;await renew.getByRole('button',{name:'Confirmar'}).click();await renew.waitFor({state:'hidden'});assert.equal(tables.opportunities.find(o=>o.client_name==='Contato PJ').status,'renewed');assert.equal(tables.opportunities.find(o=>o.client_name==='Contato PJ').expiration_date,'2026-03-06');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
 await page.screenshot({path:'/tmp/omnilink-opportunities-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Por vencimento',exact:true}).click();assert.equal(await page.locator('.opportunity-cards article').count(),2);
 await page.getByLabel('Pesquisar oportunidades').fill('nothing-matches');await page.getByRole('heading',{name:'Nenhuma oportunidade encontrada'}).waitFor();await page.getByLabel('Pesquisar oportunidades').fill('');
 await page.getByRole('button',{name:'Tabela',exact:true}).click();await page.getByRole('button',{name:'Nova Oportunidade',exact:true}).click();await page.screenshot({path:'/tmp/omnilink-opportunities-editor.png'});await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Abrir opções da conta'}).click();await page.getByRole('combobox',{name:'Tema'}).selectOption('dark');await page.keyboard.press('Escape');await page.screenshot({path:'/tmp/omnilink-opportunities-dark.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'/tmp/omnilink-opportunities-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Excluir Contato PJ',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirmar'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(tables.opportunities.length,1);
 assert.deepEqual(errors,[]);console.log('PASS PF/PJ dates, manual expiration, failed save/duplicate/retry, filtered Excel, WhatsApp URL, notes/edit, renewal failure/retry, cards/empty state, deletion and responsive themes');
 }catch(error){if(debugPage){console.error((await debugPage.locator('body').innerText()).slice(0,2500));await debugPage.screenshot({path:'/tmp/omnilink-opportunities-failure.png'});}throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
