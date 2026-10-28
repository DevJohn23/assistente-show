const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  const page=await context.newPage();page.setDefaultTimeout(30000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:3000',{timeout:120000});
  const art=page.locator('.show-particle-art');await page.locator('.show-particle-art.is-ready').waitFor();
  await page.getByRole('heading',{name:'Bem-vindo ao Assistente Omnilink'}).waitFor();
  const canvas=art.locator('canvas');
  const before=await canvas.evaluate(c=>c.toDataURL());
  const target=await canvas.evaluate(c=>{const ctx=c.getContext('2d'),a=ctx.getImageData(0,0,c.width,c.height).data;const y=Math.floor(c.height*0.5);for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>100)return {x:x/c.width,y:y/c.height};throw new Error('No logo pixels');});
  const box=await art.boundingBox();await page.mouse.move(box.x+box.width*target.x,box.y+box.height*target.y);
  await page.waitForTimeout(500);assert.notEqual(await canvas.evaluate(c=>c.toDataURL()),before);
  await page.screenshot({path:'/tmp/login-particles-light.png'});
  await page.mouse.move(0,0);await page.waitForTimeout(2500);assert.equal(await canvas.evaluate(c=>c.toDataURL()),before);
  await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.screenshot({path:'/tmp/login-particles-dark.png'});
  await page.getByRole('button',{name:'Esqueci minha senha'}).click();await page.getByRole('heading',{name:'Recuperar senha'}).waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  assert.equal(await art.evaluate(e=>e.classList.contains('is-ready')),false);
  await page.setViewportSize({width:390,height:844});assert.equal(await art.isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);console.log('PASS particle rendering, pointer deformation, exact return, login/forgot, reduced motion, unchanged compact layout; no remote requests');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
