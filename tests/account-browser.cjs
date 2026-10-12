// Supabase auth and data requests are intercepted: no real email, user or password is changed.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const baseURL=process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const userId='00000000-0000-4000-8000-000000000001';
const storageKey='sb-nwuheljjsviakffyeqmx-auth-token';
const exp=Math.floor(Date.now()/1000)+3600;
const token=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:userId,exp,role:'authenticated'})).toString('base64url')+'.test-signature';
let user={id:userId,email:'test@example.invalid',user_metadata:{full_name:'Teste'},aud:'authenticated',role:'authenticated'};
const session=()=>({access_token:token,refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,expires_at:exp,user});
let failUpdate=false, failReset=false, updateCount=0, resetCount=0, resetUrl='', passwordWrites=0;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_BROWSER_EXECUTABLE});
 let page;
 try {
 const context=await browser.newContext({viewport:{width:1366,height:900}});
 await context.addInitScript(({storageKey,session})=>{if(!localStorage.getItem('test-initialized')) {localStorage.setItem(storageKey,JSON.stringify(session)); localStorage.setItem('test-initialized','true');}},{storageKey,session:session()});
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.hostname==='127.0.0.1') return route.continue();
  if(!url.hostname.endsWith('.supabase.co')) return route.abort();
  const json=(status,body)=>route.fulfill({status,headers:{'x-supabase-api-version':'2024-01-01','access-control-expose-headers':'x-supabase-api-version'},contentType:'application/json',body:JSON.stringify(body)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204});
  if(url.pathname==='/auth/v1/user') {
   if(req.method()==='GET') return json(200,user);
   updateCount++; await new Promise(r=>setTimeout(r,100));
   if(failUpdate) return json(500,{message:'Simulated failure'});
   const body=req.postDataJSON(); if(body.data) user={...user,user_metadata:{...user.user_metadata,...body.data}};
   if(body.password) passwordWrites++;
   return json(200,user);
  }
  if(url.pathname==='/auth/v1/token') {
   const body=req.postDataJSON();
   if(body.password && body.password!=='CurrentPass123!') return json(400,{code:'invalid_credentials',msg:'Invalid credentials'});
   return json(200,session());
  }
  if(url.pathname==='/auth/v1/recover') {resetCount++;resetUrl=url.searchParams.get('redirect_to');return failReset?json(429,{code:'over_email_send_rate_limit',msg:'Rate limit'}):json(200,{});}
  if(url.pathname==='/auth/v1/signup') return json(200,{user:{...user,identities:[{id:'test'}]},session:null});
  if(url.pathname==='/auth/v1/logout') return route.fulfill({status:204});
  if(url.pathname.startsWith('/rest/v1/')) return json(200,req.headers().accept?.includes('pgrst.object')?null:[]);
  return json(200,{});
 });
 page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(120000);
 await page.goto(baseURL);
 await page.getByRole('button',{name:'Abrir opções da conta'}).click(); await page.getByRole('button',{name:'Minha conta',exact:true}).click();
 const account=page.getByRole('dialog',{name:'Minha conta',exact:true});
 await account.getByLabel('Nome completo',{exact:true}).fill('Marcos Teste');failUpdate=true;
 const before=updateCount; await account.getByRole('button',{name:'Salvar nome'}).evaluate(b=>{b.click();b.click();});
 await account.getByRole('alert').waitFor(); assert.equal(updateCount,before+1);assert.equal(user.user_metadata.full_name,'Teste');
 assert.equal(await account.getByLabel('Nome completo',{exact:true}).inputValue(),'Marcos Teste');
 failUpdate=false; await account.getByRole('button',{name:'Salvar nome'}).click(); await account.getByRole('status').waitFor(); assert.equal(user.user_metadata.full_name,'Marcos Teste');
 await page.screenshot({path:'/tmp/omnilink-account-profile.png'});
 await account.getByRole('button',{name:'Senha',exact:true}).click();
 await account.getByLabel('Senha atual',{exact:true}).fill('WrongPass123!');
 await account.getByLabel('Nova senha',{exact:true}).fill('NextPass123!');await account.getByLabel('Confirmar nova senha',{exact:true}).fill('Mismatch123!');
 await account.getByRole('button',{name:'Alterar senha',exact:true}).click();await account.getByText('As senhas não coincidem.').waitFor();assert.equal(passwordWrites,0);
 await account.getByLabel('Confirmar nova senha',{exact:true}).fill('NextPass123!'); await account.getByRole('button',{name:'Alterar senha',exact:true}).click();await account.getByText(/E-mail ou senha incorretos/).waitFor();assert.equal(passwordWrites,0);
 await account.getByLabel('Senha atual',{exact:true}).fill('CurrentPass123!');await account.getByRole('button',{name:'Alterar senha',exact:true}).click();await account.getByText('Senha alterada com sucesso.').waitFor();assert.equal(passwordWrites,1);assert.equal(await account.getByLabel('Nova senha',{exact:true}).inputValue(),'');
 await page.keyboard.press('Escape'); await account.waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Abrir opções da conta'}).click();await page.getByRole('button',{name:'Sair da conta',exact:true}).click();await page.getByRole('button',{name:'Acessar o Sistema',exact:true}).waitFor();
 await page.screenshot({path:'/tmp/omnilink-login.png'});
 await page.getByLabel('E-mail',{exact:true}).fill('test@example.invalid');await page.getByLabel('Senha de acesso',{exact:true}).fill('WrongPass123!');await page.getByRole('button',{name:'Acessar o Sistema',exact:true}).click();await page.locator('.auth-error').waitFor();
 await page.getByRole('button',{name:'Esqueci minha senha'}).click();failReset=true;
 await page.getByRole('button',{name:'Enviar link de recuperação'}).click();await page.getByText(/Muitas tentativas/).waitFor();failReset=false;
 await page.getByRole('button',{name:'Enviar link de recuperação'}).click();await page.getByRole('status').waitFor();assert.equal(resetCount,2);assert.equal(resetUrl,baseURL+'/recuperar-senha');
 await page.screenshot({path:'/tmp/omnilink-recovery-request.png'});
 await page.getByRole('button',{name:'Voltar para o login'}).click();
 await page.getByRole('button',{name:'Cadastrar Novo Vendedor'}).click();await page.getByLabel('Nome completo',{exact:true}).fill('Novo Vendedor');await page.getByLabel('Senha de acesso',{exact:true}).fill('NewAccount123!');await page.getByLabel('Confirmar senha',{exact:true}).fill('NewAccount123!');await page.getByRole('button',{name:'Criar conta',exact:true}).click();await page.getByText(/Cadastro solicitado/).waitFor();
 await page.goto(baseURL+'/recuperar-senha#error=access_denied&error_code=otp_expired&error_description=Expired');await page.getByText(/Este link é inválido ou expirou/).waitFor();assert.equal(await page.getByRole('button',{name:'Salvar nova senha'}).count(),0);
 await page.goto(baseURL+'/recuperar-senha#access_token='+token+'&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=recovery');
 await page.getByLabel('Nova senha',{exact:true}).waitFor();await page.reload();await page.getByLabel('Nova senha',{exact:true}).waitFor();
 await page.getByLabel('Nova senha',{exact:true}).fill('RecoveredPass123!');await page.getByLabel('Confirmar nova senha',{exact:true}).fill('RecoveredPass123!');
 failUpdate=true;await page.getByRole('button',{name:'Salvar nova senha'}).click();await page.locator('.auth-error').waitFor();assert.equal(passwordWrites,1);
 failUpdate=false;await page.getByRole('button',{name:'Salvar nova senha'}).click();await page.getByRole('heading',{name:'Senha atualizada'}).waitFor();assert.equal(passwordWrites,2);
 await page.goto(baseURL+'/recuperar-senha');await page.getByText(/Este link é inválido ou expirou/).waitFor();
 await page.goto(baseURL+'/#access_token='+token+'&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=recovery');await page.waitForURL('**/recuperar-senha');await page.getByLabel('Nova senha',{exact:true}).waitFor();
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'/tmp/omnilink-recovery-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS profile save/failure/duplicate guard, current password validation, password update, login failure, reset request/rate limit, signup, expired/valid/reloaded links and consumed recovery state, root recovery redirect, mobile and runtime errors');
 }catch(error){if(page){console.error((await page.locator('body').innerText()).slice(0,2500));await page.screenshot({path:'/tmp/omnilink-account-failure.png'});}throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
