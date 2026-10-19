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
const tables = {products:[product,{...product,id:'sensor',name:'Sensor de presença',description:'Acessório de segurança',category_id:'cat-2',default_price:250,monthly_fee:5},...['OMNITURBO — Kit completo para veículos','OMNIDUAL','OMNIMOB — KIT COMPLETO','OMNISAFE — DASHCAM 4CH'].map((name,i)=>({...product,id:'prod-'+(i+1),name,default_price:2000+i*700}))],opportunities:[opportunity],commissions:[commission,{...commission,id:'old-sale',client_name:'Venda Antiga',sale_date:oldMonth+'-01',commission_amount:900}],sellers:[],quote_templates:[],admin_users:[]};
let failWrites = false, failReads = false, writes = 0;
let metadata={full_name:'Teste'}, failPreferences=false;
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.TEST_BROWSER_EXECUTABLE});
 let debugPage;
 try {
 const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'America/Sao_Paulo'});
 await context.addInitScript(({userId}) => {
   userId = localStorage.getItem('__testAccount') || userId;
   const user = {id:userId,email:'test@example.invalid',user_metadata:{full_name:'Teste'},aud:'authenticated',role:'authenticated'};
   const exp = Math.floor(Date.now()/1000)+3600;
   const token = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:userId,exp,role:'authenticated'}))+'.test-signature';
   if (!localStorage.getItem('assistente_show_theme')) localStorage.setItem('assistente_show_theme','light');
   Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text=>{if(window.__failCopy) throw new Error('Clipboard denied');window.__copied=text;}}});
   if (!localStorage.getItem('sb-nwuheljjsviakffyeqmx-auth-token')) localStorage.setItem('sb-nwuheljjsviakffyeqmx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,expires_at:exp,user}));
 },{userId});
 await context.route('**/*', async route => {
   const request=route.request(),url=new URL(request.url());
   if(url.hostname==='127.0.0.1') return route.continue();
   if(!url.hostname.endsWith('.supabase.co')) return route.abort();
   const table=url.pathname.split('/').pop();
   const json=(status,body)=>route.fulfill({status,headers:{'x-supabase-api-version':'2024-01-01'},contentType:'application/json',body:JSON.stringify(body)});
   if(url.pathname === '/auth/v1/user') { if(request.method()==='PUT') {if(failPreferences) return json(500,{message:'Simulated failure'}); metadata={...metadata,...request.postDataJSON().data};} return json(200,{id:userId,email:'test@example.invalid',user_metadata:metadata,aud:'authenticated',role:'authenticated'}); }
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
 page.setDefaultTimeout(30000);
 page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('BROWSER ERROR', e.message)});
 await page.goto(baseURL);
 await page.getByRole('button',{name:'Orçamentos',exact:true}).click();
 const panel=page.getByRole('complementary',{name:'Composição do orçamento'});
 const catalog=page.getByRole('region',{name:'Catálogo de produtos'});
 const card=(name)=>catalog.locator('article').filter({has:page.getByRole('button',{name,exact:true})});
 const total=()=>panel.getByTestId('quote-equipment-total');
 await panel.waitFor();

 assert.equal(await panel.getByRole('button',{name:'Gerar proposta PDF'}).count(),0);
 await page.getByRole('button',{name:'Abrir opções da conta'}).click();
 await page.getByRole('button',{name:'Minha conta',exact:true}).click();
 const account=page.getByRole('dialog',{name:'Minha conta',exact:true});
 await account.getByRole('button',{name:'Preferências',exact:true}).click();
 await account.locator('input[value="detailed"]').check();
 await account.getByRole('checkbox').check();
 failPreferences=true;
 await account.getByRole('button',{name:'Salvar preferências'}).click();
 await account.getByRole('alert').waitFor();
 assert.equal(metadata.quote_preferences,undefined);
 failPreferences=false;
 await account.getByRole('button',{name:'Salvar preferências'}).click();
 await account.getByRole('status').waitFor();
 assert.deepEqual(metadata.quote_preferences,{model:'detailed',pdfEnabled:true});
 await page.keyboard.press('Escape');
 await panel.getByRole('button',{name:'Gerar proposta PDF'}).waitFor();
 for(const name of ['OMNITURBO — Kit completo para veículos','OMNIDUAL','Sensor de presença']) await card(name).getByRole('button',{name:'Adicionar',exact:true}).click();
 await panel.getByRole('button',{name:'Copiar mensagem',exact:true}).click();
 await panel.getByRole('button',{name:'Mensagem copiada'}).waitFor();
 const copied=await page.evaluate(()=>window.__copied);
 assert.equal((copied.match(/Antena satélite/g)||[]).length,1);
 assert.equal((copied.match(/O KIT CABINE CONTEMPLA/g)||[]).length,2);
 await page.reload();
 await page.getByRole('button',{name:'Orçamentos',exact:true}).click();
 await panel.getByRole('button',{name:'Gerar proposta PDF'}).click();
 const proposal=page.getByRole('dialog',{name:'Proposta comercial',exact:true});
 assert.equal(await proposal.getByRole('checkbox',{name:/Incluir responsável comercial/}).isChecked(),false);
 assert.equal(await proposal.getByLabel('Responsável comercial',{exact:true}).count(),0);
 await proposal.getByRole('checkbox',{name:/Incluir responsável comercial/}).check();
 await proposal.getByLabel('Responsável comercial',{exact:true}).waitFor();
 await proposal.getByRole('checkbox',{name:/Incluir responsável comercial/}).uncheck();
 await proposal.getByLabel('Cliente (opcional)',{exact:false}).fill('   ');
 await proposal.getByRole('button',{name:'Visualizar PDF'}).click();
 await proposal.getByRole('link',{name:'Baixar PDF'}).waitFor({timeout:120000});
 const downloadPromise=page.waitForEvent('download');
 await proposal.getByRole('link',{name:'Baixar PDF'}).click();
 await (await downloadPromise).saveAs('/tmp/proposal-validation/browser.pdf');
 await proposal.getByLabel('Observações (opcional)').fill('Teste de revisão');
 assert.equal(await proposal.getByRole('link',{name:'Baixar PDF'}).count(),0);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/proposal-validation/mobile.png',fullPage:true});
 await proposal.getByRole('button',{name:'Voltar ao orçamento'}).click();
 assert.deepEqual(errors,[]);
 console.log('PASS preferences default, save failure/retry, account persistence, detailed kit exclusivity, PDF generation/download, omitted client, stale preview invalidation, mobile, runtime');
 } catch(error) {if(debugPage) {console.error((await debugPage.locator('body').innerText()).slice(-5000));await debugPage.screenshot({path:'/tmp/proposal-validation/browser-failure.png'});}throw error;} finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
