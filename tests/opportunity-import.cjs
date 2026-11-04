const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('src/lib/opportunityImport.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};new Function('require','module','exports',code)(require,mod,mod.exports);const lib=mod.exports;
const header='"ID","Nome do Cliente","Data Cadastro","Status"\r\n';
test('CSV handles BOM, quoted commas, escaped quotes, multiline, accents, and ignores won status',()=>{
 const rows=lib.parseOpportunityCSV('\ufeff'+header+'"123","Empresa, São "+"","2026-10-27 13:00:00","Ganha"'.replace('"+"','""A""'));
 assert.equal(rows.length,1);assert.equal(rows[0].client_name,'Empresa, São "A"');assert.equal(rows[0].registration_date,'2026-10-27');assert.equal(rows[0].error,undefined);
 assert.equal(lib.parseOpportunityCSV('ID;Nome do Cliente;Data Cadastro\n1;"Nome\ncompleto";2026-10-27')[0].client_name,'Nome\ncompleto');
});
test('validates dates, IDs, names, duplicate IDs, malformed input and row limits',()=>{
 assert.ok(lib.parseOpportunityCSV(header+'1,A,2026-02-30,x')[0].error);
 assert.ok(lib.parseOpportunityCSV(header+'1,A,2026-10-01,x\n1,B,2026-10-02,x').every(r=>r.error));
 assert.ok(lib.parseOpportunityCSV(header+',A,2026-10-01,x')[0].error);
 assert.throws(()=>lib.parseOpportunityCSV(header+'"1,A,2026-10-01,x'));
 assert.throws(()=>lib.parseOpportunityCSV('Nome,Data\nA,2026-01-01'));
 assert.throws(()=>lib.parseOpportunityCSV(header+Array.from({length:2001},(_,i)=>`${i},A,2026-10-01,x`).join('\n')));
});
test('deadlines use original calendar dates across months and leap years',()=>{
 assert.equal(lib.expirationFor('2026-10-27','PJ'),'2026-11-26');
 assert.equal(lib.expirationFor('2026-10-27','PF'),'2026-11-11');
 assert.equal(lib.expirationFor('2024-02-20','PF'),'2024-03-06');
});
test('reimport compares source snapshot, preserves manual edits and distinguishes separate IDs',()=>{
 const row={external_id:'1',client_name:'Original',registration_date:'2026-10-01'};
 const existing={id:'local',source_system:lib.OPPORTUNITY_SOURCE,external_id:'1',source_name:'Original',source_registration_date:'2026-10-01',client_name:'Editado',registration_date:'2026-10-03',expiration_date:'2026-12-01',type:'PJ'};
 assert.equal(lib.classifyImport(row,[existing]).kind,'same');
 assert.equal(lib.classifyImport({...row,registration_date:'2026-10-02'},[existing]).kind,'changed');
 assert.equal(lib.classifyImport({...row,external_id:'2'},[existing]).kind,'new');
 assert.equal(lib.classifyImport(row,[{...existing,source_system:null}]).kind,'new');
});
test('sorting is deterministic, imports stay first, input is unchanged',()=>{
 const rows=[{id:'a',client_name:'Z',registration_date:'2026-10-01',expiration_date:'2026-11-01'}, {id:'b',client_name:'A',registration_date:'2026-10-02',expiration_date:'2026-10-01',imported_at:'2026-10-03'}];
 for(const order of ['name','expiration','registration','imported']) assert.equal(lib.sortOpportunities(rows,order)[0].id,'b');
 assert.equal(rows[0].id,'a');
});
