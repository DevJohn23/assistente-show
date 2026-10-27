// All remote requests are intercepted. This test never modifies production data.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(()=>{
   const user={id:'00000000-0000-4000-8000-000000000001',email:'admin@example.invalid',user_metadata:{full_name:'Teste'},aud:'authenticated',role:'authenticated'};
   const exp=Math.floor(Date.now()/1000)+3600;
   const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:user.id,exp,role:'authenticated'}))+'.test';
   localStorage.setItem('sb-nwuheljjsviakffyeqmx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',token_type:'bearer',expires_in:3600,expires_at:exp,user}));
  });
  let applied=0,previews=0,fail=false;
  const errors=[];
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin===base) return route.continue();
   if(!url.hostname.endsWith('.supabase.co')) return route.abort();
   const json=(status,body)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   if(req.method()==='OPTIONS') return route.fulfill({status:204});
   const table=url.pathname.split('/').pop();
   if(table==='import_technical_network') {
    const body=req.postDataJSON();
    if(body.p_apply){assert.equal(body.p_expected,'revision-test');applied++;if(fail)return json(400,{message:'A rede mudou desde a prévia.',code:'40001'});return json(200,{applied:true});}
    previews++;assert.equal(body.p_deactivate,false);
    return json(200,{revision:'revision-test',added:body.p_restore?[]:['PSO Teste'],changed:body.p_restore?[{name:'PSO Teste',before:{is_active:true},after:{is_active:false}}]:[],missing:['Anterior'],unchanged:1,active:2});
   }
   if(table==='admin_users') return json(200,{email:'admin@example.invalid'});
   if(table==='technical_network_imports')return json(200,applied?[{id:'00000000-0000-4000-8000-000000000002',filename:'rede.kml',actor_email:'admin@example.invalid',created_at:'2026-10-26T18:00:00Z',restored_from:null}]:[]);
   if(req.method()!=='GET')throw new Error('Unexpected write '+url.pathname);
   return json(200,[]);
  });
  const page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/admin');await page.getByRole('button',{name:'Técnicos',exact:true}).click();
  await page.getByRole('button',{name:'Importar KML',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Atualizar rede técnica'});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:'/tmp/technical-import-empty.png'});
  const upload=dialog.locator('input[type=file]');
  await upload.setInputFiles({name:'bad.kml',mimeType:'application/xml',buffer:Buffer.from('<kml>')});
  await dialog.getByRole('alert').waitFor();assert.equal(previews,0);assert.equal(applied,0);
  const kml='<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Rede teste</name><Placemark><name>PSO Teste</name><Point><coordinates>-40,-10,0</coordinates></Point></Placemark></Document></kml>';
  await upload.setInputFiles({name:'rede.kml',mimeType:'application/xml',buffer:Buffer.from(kml)});
  await dialog.getByText('1 técnico encontrado',{exact:false}).waitFor();
  assert.equal(await dialog.getByRole('checkbox',{name:/Inativar técnicos/}).isChecked(),false);
  await dialog.getByRole('button',{name:'Gerar prévia'}).click();await dialog.getByText('1 novos · 0 alterados · 1 ausentes').waitFor();
  assert.equal(applied,0);assert.equal(await dialog.getByRole('button',{name:'Confirmar atualização'}).isDisabled(),true);
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:'/tmp/technical-import-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  await page.screenshot({path:'/tmp/technical-import-mobile.png'});
  await dialog.getByRole('checkbox',{name:/Conferi as alterações/}).check();fail=true;
  await dialog.getByRole('button',{name:'Confirmar atualização'}).click();await dialog.getByRole('alert').waitFor();
  assert.equal(await dialog.getByRole('button',{name:'Confirmar atualização'}).count(),0);
  fail=false;await dialog.getByRole('button',{name:'Gerar prévia'}).click();await dialog.getByRole('checkbox',{name:/Conferi as alterações/}).check();await dialog.getByRole('button',{name:'Confirmar atualização'}).click();
  await page.getByRole('status').filter({hasText:'Rede técnica atualizada'}).waitFor();assert.equal(applied,2);
  await page.getByRole('button',{name:'Importar KML',exact:true}).click();await dialog.getByRole('button',{name:'Histórico',exact:true}).click();await page.getByRole('button',{name:'Restaurar versão anterior',exact:true}).click();
  await dialog.getByText('0 novos · 1 alterados · 1 ausentes').waitFor();
  assert.equal(await dialog.getByRole('button',{name:'Confirmar atualização'}).isDisabled(),true);
  await dialog.getByRole('button',{name:'Cancelar'}).click();assert.equal(applied,2);
  assert.deepEqual(errors,[]);console.log('PASS upload, parsing error, preview, explicit confirmation, failure recovery, restore preview, desktop/mobile, no production requests');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
