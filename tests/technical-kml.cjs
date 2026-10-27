// Browser DOMParser tests; requires Playwright and its Chromium installation.
const {chromium} = require('playwright');
const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async()=>{
 const browser = await chromium.launch({headless:true});
 try {
  const page = await browser.newPage();
  const js=ts.transpileModule(fs.readFileSync('src/lib/technicalKml.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  await page.addScriptTag({content:'var exports={};\n'+js});
  const parse=xml=>page.evaluate(xml=>{try{return {result:exports.parseTechnicalKml(xml)}}catch(e){return {error:e.message}}},xml);
  const wrap=body=>`<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Rede teste</name>${body}</Document></kml>`;
  const point=(name,coords='-40,-10,0')=>`<Placemark><name>${name}</name><description><![CDATA[Fixo<br>(11) 99999-8888<br>E-mail: teste@example.invalid<br>Supervisor: Exemplo]]></description><Point><coordinates>${coords}</coordinates></Point></Placemark>`;
  const valid=await parse(wrap('<Folder><name>REDE PLUS</name>'+point('Parceiro')+'</Folder>'));
  assert.equal(valid.result.rows[0].categoria,'REDE PLUS');assert.equal(valid.result.rows[0].telefone,'(11) 99999-8888');assert.equal(valid.result.rows[0].vendedor_parceiro,'Exemplo');
  assert.equal(valid.result.rows[0].lat,-10);assert.equal(valid.result.rows[0].lng,-40);
  assert.equal((await parse(fs.readFileSync('full_map.kml','utf8'))).result.rows.length,124);
  for(const [xml,pattern] of [
   ['<kml>',/inválido/], [wrap(''),/entre 1/],
   [wrap(point('Mesmo')+point(' mesmo ')),/duplicado/],
   [wrap(point('Inválido','-40,100,0')),/intervalo/],
   [wrap('<NetworkLink><Link><href>https://example.invalid</href></Link></NetworkLink>'),/link/],
   ['<!DOCTYPE kml [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+wrap(point('A')),/entidades/],
   [wrap('<Placemark><name>Rota</name><LineString><coordinates>-40,-10</coordinates></LineString></Placemark>'),/único ponto/],
   [wrap(point('Incompleto','-40,,0')),/coordenadas/],
   [wrap(point('A'))+' '.repeat(5*1024*1024),/5 MB/]
  ]) assert.match((await parse(xml)).error,pattern);
  const prefixed='<k:kml xmlns:k="http://www.opengis.net/kml/2.2"><k:Document><k:Placemark><k:name>PSO Teste</k:name><k:Point><k:coordinates>-40,-10</k:coordinates></k:Point></k:Placemark></k:Document></k:kml>';
  assert.equal((await parse(prefixed)).result.rows[0].categoria,'PSO');
  console.log('PASS KML: real 124-point map, namespaces, contacts, duplicates, invalid XML, coordinates, empty, limits and unsafe entities/network links');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
