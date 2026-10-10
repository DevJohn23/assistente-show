// Run with Playwright available in NODE_PATH and a local server at TEST_BASE_URL.
// Supabase requests are intercepted; these tests never write production data.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const userId = '00000000-0000-4000-8000-000000000001';
const month = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
const oldMonth = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
const product = { id:'test-product', category_id:'cat-1', name:'Equipamento Teste', default_price:1000, monthly_fee:20, is_active:true, commercial_rules:{allow_pix:true,allow_boleto:true,allow_card:true,allow_financing:false,max_card_installments:12,max_boleto_installments:3} };
const opportunity = { id:'test-opp',user_id:userId,client_name:'Cliente Existente',cpf_cnpj:'12345678901',type:'PF',phone:'83999999999',registration_date:month+'-01',expiration_date:month+'-20',status:'active' };
const commission = {id:'test-comm',user_id:userId,client_name:'Venda Atual',sale_amount:1000,commission_amount:100,sale_date:month+'-01',installer_option:'me',registration_type:'own',status:'pending'};
const tables = {products:[product],opportunities:[opportunity],commissions:[commission,{...commission,id:'old-sale',client_name:'Venda Antiga',sale_date:oldMonth+'-01',commission_amount:900}],sellers:[],quote_templates:[],admin_users:[]};
let failWrites = true, failReads = false, writes = 0;
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.TEST_BROWSER_EXECUTABLE});
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
 const page=await context.newPage();
 page.setDefaultTimeout(12000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseURL);
 await page.getByText('Vendas do Mês',{exact:true}).waitFor();
 const card=page.getByText('Vendas do Mês',{exact:true}).locator('..').locator('..');
 assert.match(await card.innerText(),/\b1\b/);
 assert.doesNotMatch(await card.innerText(),/\b2\b/);
 console.log('PASS dashboard excludes the previous year');
 await page.getByRole('button',{name:'Comissões',exact:true}).click();
 await page.getByRole('button',{name:'Cadastrar Venda',exact:true}).click();
 await page.getByPlaceholder('ex: Frota Rodoviária Alfa').fill('Venda de Teste');
 await page.getByPlaceholder('15000.00').fill('1200');
 await page.getByPlaceholder('1500.00').fill('120');
 const submit=page.getByRole('button',{name:'Salvar Venda',exact:true});
 const before=writes;
 await submit.evaluate(button=>{button.click();button.click();});
 await page.getByRole('alert').filter({hasText:'Não foi possível salvar a venda'}).waitFor();
 assert.equal(writes,before+1);
 assert.equal(await page.getByPlaceholder('ex: Frota Rodoviária Alfa').inputValue(),'Venda de Teste');
 assert.equal(await page.getByText('Venda de Teste',{exact:true}).count(),0);
 failWrites=false;await submit.click();
 await page.getByPlaceholder('ex: Frota Rodoviária Alfa').waitFor({state:'hidden'});
 await page.getByText('Venda de Teste',{exact:true}).waitFor();
 console.log('PASS commission rejects duplicate submits, retains failed form, saves after retry');
 await page.getByRole('button',{name:'Oportunidades',exact:true}).click();
 // Verify that failed deletion keeps both the row and confirmation available.
 failWrites=true;
 await page.locator('button[title="Excluir Oportunidade"]').first().click();
 await page.getByRole('button',{name:'Confirmar',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Não foi possível excluir a oportunidade'}).waitFor();
 await page.getByText('Cliente Existente',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Cancelar',exact:true}).click();
 console.log('PASS failed deletion preserves opportunity');
 await page.getByRole('button',{name:'Catálogo / Orçamento',exact:true}).click();
 await page.getByRole('button',{name:'Adicionar',exact:true}).first().click();
 await page.locator('button[title="Salvar Combinação como Modelo"]').first().click();
 await page.getByPlaceholder('ex: Kit Cavalo Mecânico Completo').fill('Kit Teste');
 await page.locator('form button[type="submit"]').click();
 await page.getByRole('alert').filter({hasText:'Não foi possível salvar o modelo'}).waitFor();
 assert.equal(await page.getByPlaceholder('ex: Kit Cavalo Mecânico Completo').inputValue(),'Kit Teste');
 failWrites=false;await page.locator('form button[type="submit"]').click();
 await page.getByPlaceholder('ex: Kit Cavalo Mecânico Completo').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Kit Teste',exact:true}).waitFor();
 console.log('PASS template failure preserves name and retry saves');
 failReads=true;await page.reload();
 await page.getByRole('alert').filter({hasText:'Não foi possível carregar seus dados'}).waitFor();
 assert.equal(await page.getByText('Venda Atual',{exact:true}).count(),0);
 failReads=false;await page.getByRole('button',{name:'Tentar novamente'}).click();
 await page.getByRole('button',{name:'Kit Teste',exact:true}).waitFor();
 console.log('PASS load failure is explicit and retry recovers');
 assert.deepEqual(errors,[]);
 console.log('PASS no browser runtime errors');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
