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
tables.tecnicos=[{id:'test-tech',nome:'Técnico Teste',categoria:'PSO C/ESTOQUE',tipo:'Fixo',lat:-23,lng:-46,telefone:'11999999999'}];
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
   if(process.env.DEBUG_ADMIN) console.log(request.method(),url.hostname,url.pathname);
   if(url.hostname==='photon.komoot.io') return route.fulfill({contentType:'application/json',body:JSON.stringify({features:[{geometry:{coordinates:[-46,-23]},properties:{name:'Rua Teste',city:'São Paulo'}}]})});
   if(!url.hostname.endsWith('.supabase.co')) return route.abort();
   const table=url.pathname.split('/').pop();
   const json=(status,body)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   if(url.pathname === '/auth/v1/logout') return route.fulfill({status:204});
   if(request.method()==='OPTIONS') return route.fulfill({status:204});
   if(request.method()==='GET') {
     if(failReads && table==='products') return json(503,{message:'Simulated read outage'});
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
 const page=await context.newPage();debugPage=page;page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseURL+'/admin');await page.waitForURL(baseURL+'/',{timeout:20000});assert.equal(await page.getByRole('heading',{name:'Administração',exact:true}).count(),0);
 tables.admin_users.push({email:'test@example.invalid'});await page.goto(baseURL+'/admin');
 await page.getByRole('heading',{name:'Administração',exact:true}).waitFor();
 await page.getByRole('button',{name:'Novo Produto',exact:true}).click();
 let dialog=page.getByRole('dialog');
 await dialog.getByLabel('Nome do Produto',{exact:true}).fill('Produto Novo');await dialog.getByLabel('Preço Base (R$)',{exact:true}).fill('1234.56');
 failWrites=true;const before=writes;await dialog.getByRole('button',{name:'Salvar',exact:true}).evaluate(b=>{b.click();b.click();});await dialog.getByRole('alert').waitFor();assert.equal(writes,before+1);assert.equal(await dialog.getByLabel('Nome do Produto',{exact:true}).inputValue(),'Produto Novo');
 failWrites=false;await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await dialog.waitFor({state:'hidden'});await page.getByText('Produto salvo.',{exact:true}).waitFor();
 await page.getByLabel('Buscar produtos').fill('inexistente');await page.getByText('Nenhum produto encontrado para esta busca.').waitFor();await page.getByLabel('Buscar produtos').fill('');
 await page.getByRole('button',{name:'Editar Produto Novo',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Mensalidade (R$)',{exact:true}).fill('42.50');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(tables.products.find(p=>p.name==='Produto Novo').monthly_fee,42.5);
 await page.screenshot({path:'/tmp/admin-products.png',fullPage:true});
 await page.getByRole('button',{name:'Excluir Produto Novo',exact:true}).click();dialog=page.getByRole('dialog');failWrites=true;await dialog.getByRole('button',{name:'Excluir',exact:true}).click();await dialog.getByRole('alert').waitFor();failWrites=false;await dialog.getByRole('button',{name:'Excluir',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(tables.products.length,1);
 await page.getByRole('button',{name:'Técnicos',exact:true}).click();await page.getByRole('button',{name:'Editar Técnico Teste',exact:true}).click();dialog=page.getByRole('dialog');assert.equal(await dialog.getByLabel('Categoria',{exact:true}).inputValue(),'PSO C/ESTOQUE');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(tables.tecnicos[0].lat,-23);
 await page.getByRole('button',{name:'Novo Técnico',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Nome Completo',{exact:true}).fill('Novo Técnico');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await dialog.getByRole('alert').waitFor();await dialog.getByLabel('Localização (endereço ou CEP)',{exact:true}).fill('Rua Teste');await dialog.getByRole('button',{name:'Rua Teste, São Paulo',exact:true}).click();await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(tables.tecnicos.length,2);
 await page.getByRole('button',{name:'Editar Novo Técnico',exact:true}).click();await page.screenshot({path:'/tmp/admin-editor.png'});await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.screenshot({path:'/tmp/admin-dark.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 failReads=true;await page.reload();await page.getByRole('alert').filter({hasText:'Não foi possível atualizar'}).waitFor();failReads=false;await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await page.getByRole('button',{name:'Novo Produto',exact:true}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS admin direct access restriction, product create/edit/delete failure and retry, duplicate protection, technician address validation/create/edit/category preservation, read failure/retry, themes/mobile and no runtime errors');
 }catch(error){if(debugPage){console.error('URL',debugPage.url());console.error((await debugPage.locator('body').innerText({timeout:5000})).slice(0,2500));await debugPage.screenshot({path:'/tmp/admin-failure.png'});}throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
