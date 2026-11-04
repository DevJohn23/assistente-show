const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const header='ID,Nome do Cliente,Data Cadastro,Status\n';
const original=header+Array.from({length:32},(_,i)=>`${i+1},Cliente ${String(i+1).padStart(2,'0')},2026-10-27 13:00:00,Ganha`).join('\n');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'America/Sao_Paulo'});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const page=await context.newPage();page.setDefaultTimeout(30000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/teste-oportunidades',{timeout:120000});
 await page.getByRole('heading',{name:'Oportunidades',exact:true}).waitFor();
 const open=async(csv)=>{await page.getByRole('button',{name:'Importar oportunidades',exact:true}).click();const d=page.getByRole('dialog');await d.getByLabel('Arquivo CSV').setInputFiles({name:'carteira.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});await d.getByText('32 novas',{exact:false}).waitFor();return d;};
 let d=await open(original);
 const region=d.getByRole('region',{name:'Prévia das oportunidades — lista com rolagem'});
 for(const viewport of [{width:1440,height:1000},{width:1100,height:700}]) {
   await page.setViewportSize(viewport);
   assert.ok(await region.evaluate(e=>e.scrollHeight>e.clientHeight));
   await region.hover();await page.mouse.wheel(0,500);await page.waitForTimeout(300);
   assert.ok(await region.evaluate(e=>e.scrollTop>0),'mouse wheel scrolls preview');
   await region.focus();await page.keyboard.press('Control+End');await page.waitForTimeout(300);
   assert.ok(await region.evaluate(e=>e.scrollTop+e.clientHeight>=e.scrollHeight-2),'keyboard reaches last row');
   const footer=await d.getByRole('button',{name:'Confirmar importação'}).boundingBox();
   assert.ok(footer && footer.y>=0 && footer.y+footer.height<=viewport.height,'confirmation stays visible');
   await region.evaluate(e=>{e.scrollTop=0;});
 }
 await page.setViewportSize({width:1440,height:1000});
 await d.getByLabel('Público das novas oportunidades').selectOption('PF');
 await d.getByLabel('Tipo ID 1',{exact:true}).selectOption('PJ');
 await page.screenshot({path:'/tmp/opportunity-import-preview.png'});
 await d.getByRole('button',{name:'Confirmar importação'}).click();await d.getByText('Importação concluída').waitFor();await d.getByRole('button',{name:'Concluir'}).click();
 assert.equal(await page.locator('.opportunity-records tbody tr').count(),10);
 assert.equal(await page.getByRole('link',{name:/WhatsApp de/}).count(),0);
 let stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('opportunity-local-preview-v1')));
 assert.equal(stored.length,32);assert.equal(stored.find(r=>r.external_id==='1').expiration_date,'2026-11-26');assert.equal(stored.find(r=>r.external_id==='2').expiration_date,'2026-11-11');
 await page.getByLabel('Pesquisar oportunidades').fill('Cliente 32');assert.equal(await page.locator('.opportunity-records tbody tr').count(),1);await page.getByLabel('Pesquisar oportunidades').fill('');
 await page.getByLabel('Oportunidades por página').selectOption('25');await page.getByLabel('Ordenar oportunidades').selectOption('name');assert.equal(await page.locator('.opportunity-records tbody tr').count(),25);
 await page.getByRole('navigation',{name:'Paginação de oportunidades'}).getByRole('button',{name:'Próxima'}).click();assert.equal(await page.locator('.opportunity-records tbody tr').count(),7);
 await page.reload();await page.getByLabel('Ordenar oportunidades').waitFor();assert.equal(await page.getByLabel('Ordenar oportunidades').inputValue(),'name');assert.equal(await page.getByLabel('Oportunidades por página').inputValue(),'25');
 await page.getByRole('button',{name:'Renovar Cliente 01',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirmar'}).click();
 await page.getByRole('button',{name:'Editar Cliente 01',exact:true}).click();await page.getByLabel('Observações',{exact:true}).fill('Preservar nota');await page.getByRole('button',{name:'Salvar Registro'}).click();
 await page.getByRole('button',{name:'Importar oportunidades',exact:true}).click();d=page.getByRole('dialog');await d.getByLabel('Arquivo CSV').setInputFiles({name:'carteira.csv',mimeType:'text/csv',buffer:Buffer.from(original)});await d.getByText('32 já importadas',{exact:false}).waitFor();assert.equal(await d.getByRole('button',{name:'Confirmar importação'}).isDisabled(),true);await d.getByRole('button',{name:'Cancelar'}).click();
 await page.getByRole('button',{name:'Importar oportunidades',exact:true}).click();d=page.getByRole('dialog');const changed=header+'1,Cliente 01 atualizado,2026-10-28 10:00:00,Ganha\n99,Novo cliente,2026-10-28 10:00:00,Prospecção';
 await d.getByLabel('Arquivo CSV').setInputFiles({name:'carteira.csv',mimeType:'text/csv',buffer:Buffer.from(changed)});await d.getByText('Diferenças encontradas',{exact:false}).waitFor();
 assert.equal(await d.getByLabel('Importar Cliente 01 atualizado ID 1',{exact:true}).isDisabled(),true);
 await d.getByLabel('Revisar atualizações das existentes',{exact:false}).check();await d.getByLabel('Importar Cliente 01 atualizado ID 1',{exact:true}).check();
 assert.equal(await d.getByLabel('Recalcular prazo',{exact:true}).isChecked(),false);
 await d.getByRole('button',{name:'Confirmar importação'}).click();await d.getByText('Importação concluída').waitFor();await d.getByRole('button',{name:'Concluir'}).click();
 stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('opportunity-local-preview-v1')));const first=stored.find(r=>r.external_id==='1');assert.equal(stored.length,33);assert.equal(first.expiration_date,'2026-12-26');assert.equal(first.notes,'Preservar nota');assert.equal(first.client_name,'Cliente 01 atualizado');
 await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.screenshot({path:'/tmp/opportunity-list-dark.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.getByRole('button',{name:'Importar oportunidades',exact:true}).click();d=page.getByRole('dialog');await d.getByLabel('Arquivo CSV').setInputFiles({name:'carteira.csv',mimeType:'text/csv',buffer:Buffer.from(changed)});await d.getByText('2 já importadas',{exact:false}).waitFor();await page.screenshot({path:'/tmp/opportunity-import-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS import, PF/PJ overrides, pagination/search/order persistence, repeat import, explicit update, preserved renewal and notes, optional contact, responsive layout; remote requests blocked');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
