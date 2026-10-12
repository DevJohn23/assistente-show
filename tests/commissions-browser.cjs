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
 tables.commissions = Array.from({length:12},(_,i)=>({...commission,id:'row-'+i,client_name:'Cliente '+String(i+1).padStart(2,'0'),commission_amount:100,registration_type:i<4?'own':i<8?'implanted_for_other':'other_implanted_for_me',other_installer_name:i<4?null:'Parceiro',notes:i===0?'Observação completa da venda':null}));
 const page=await context.newPage(); debugPage=page;
 page.setDefaultTimeout(12000);
 page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('BROWSER ERROR', e.message)});
 await page.goto(baseURL);
 await page.getByRole('button',{name:'Comissões',exact:true}).click();
 const summary=page.getByRole('region',{name:'Resumo dos registros filtrados'});
 await summary.waitFor();
 assert.match(await summary.innerText(),/1\.200,00/); assert.match(await summary.innerText(),/800,00/);
 assert.equal(await page.locator('.commission-table tbody tr').count(),10);
 await page.getByRole('button',{name:'Próxima',exact:true}).click();
 assert.equal(await page.locator('.commission-table tbody tr').count(),2);
 const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Exportar Excel'}).click();
 const downloaded=await downloadPromise; const XLSX=require('xlsx'); const book=XLSX.readFile(await downloaded.path());
 const rows=XLSX.utils.sheet_to_json(book.Sheets['Comissões']); assert.equal(rows.filter(r=>String(r.Cliente).startsWith('Cliente ')).length,12);
 await page.getByLabel('Operação',{exact:true}).selectOption('other_implanted_for_me');
 assert.equal(await page.locator('.commission-table tbody tr').count(),4); assert.match(await summary.innerText(),/400,00/);
 await page.getByRole('button',{name:'Limpar filtros'}).click();
 await page.getByRole('button',{name:'Este mês'}).click(); assert.equal(await page.getByLabel('De',{exact:true}).inputValue(),month+'-01');
 await page.getByRole('button',{name:'Mês anterior'}).click(); await page.getByRole('heading',{name:'Nenhuma venda encontrada'}).waitFor();
 await page.getByRole('button',{name:'Ver todos os registros'}).click();
 await page.getByLabel('Pesquisar comissões').fill('cliente 01'); assert.equal(await page.locator('.commission-table tbody tr').count(),1);
 await page.getByRole('button',{name:'Observações de Cliente 01'}).click(); await page.getByText('Observação completa da venda',{exact:true}).last().waitFor(); await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Editar venda de Cliente 01'}).click();
 const editor=page.getByRole('dialog',{name:'Editar venda',exact:true});
 await editor.getByLabel('Nome do cliente *',{exact:true}).fill('Cliente editado');
 await editor.getByRole('button',{name:'Salvar Alterações'}).click(); await editor.waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Limpar filtros'}).click();
 for(const operation of ['Implantei para outro vendedor','Outro vendedor implantou para mim']) {
  await page.getByRole('button',{name:'Cadastrar Venda',exact:true}).click();
  const form=page.getByRole('dialog',{name:'Cadastrar venda',exact:true});
  await form.getByRole('radio',{name:new RegExp(operation)}).check();
  await form.getByLabel('Vendedor parceiro',{exact:true}).selectOption('Parceiro');
  await form.getByLabel('Nome do cliente *',{exact:true}).fill('Teste '+operation);
  await form.getByPlaceholder('15000.00').fill('1500.50'); await form.getByPlaceholder('1500.00').fill('150.25');
  await form.getByRole('button',{name:'Salvar Venda'}).click(); await form.waitFor({state:'hidden'});
 }
 assert.equal(tables.commissions.length,14);
 await page.getByLabel('Pesquisar comissões').fill('Cliente editado');
 await page.getByRole('button',{name:'Excluir venda de Cliente editado'}).click(); failWrites=true;
 const confirmation=page.getByRole('dialog',{name:'Excluir Registro de Comissão'});
 await confirmation.getByRole('button',{name:'Confirmar'}).click(); await confirmation.getByRole('alert').waitFor(); assert.equal(tables.commissions.length,14);
 failWrites=false; await confirmation.getByRole('button',{name:'Confirmar'}).click(); await confirmation.waitFor({state:'hidden'}); assert.equal(tables.commissions.length,13);
 await page.getByRole('button',{name:'Limpar filtros'}).click();
 await page.screenshot({path:'/tmp/omnilink-commissions-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Cadastrar Venda',exact:true}).click(); await page.screenshot({path:'/tmp/omnilink-commissions-editor.png'}); await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Abrir opções da conta'}).click(); await page.getByRole('combobox',{name:'Tema'}).selectOption('dark'); await page.keyboard.press('Escape');
 await page.screenshot({path:'/tmp/omnilink-commissions-dark.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/omnilink-commissions-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Cadastrar Venda',exact:true}).click();
 assert.ok((await page.getByRole('dialog').boundingBox()).width<=390); await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);
 console.log('PASS totals, period/operation/search filters, pagination, full filtered Excel, notes/editing, both partner operations, failed deletion/retry, desktop/dark/mobile, dialog keyboard and no runtime errors');
 } catch(error) { if(debugPage) { console.error((await debugPage.locator('body').innerText()).slice(0,3500)); await debugPage.screenshot({path:'/tmp/omnilink-commissions-failure.png',fullPage:true}); } throw error; } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
