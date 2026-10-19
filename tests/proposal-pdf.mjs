// Renders the real PDF component with fictional data; never contacts production.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const dataUrl = code => 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
const shared = dataUrl(compile('src/lib/quotePresentation.ts'));
const code = compile('src/components/proposal/ProposalDocument.tsx').replace("'react'", JSON.stringify(import.meta.resolve('react'))).replace("'@react-pdf/renderer'", JSON.stringify(import.meta.resolve('@react-pdf/renderer'))).replace("'@/lib/quotePresentation'", JSON.stringify(shared));
const { ProposalDocument } = await import(dataUrl(code));
const quote = {
 client: 'João Marcos', lines: [
 { id:'prod-1', name:'OMNITURBO (Kit Omniturbo)', quantity:1, unitPrice:6930, total:6930 },
 { id:'connection', name:'CJ. CONEXÃO CAVALO (CHICOTE ESPIRAL) P&P', quantity:1, unitPrice:487.2, total:487.2 },
 { id:'socket', name:'TOMADA DE CONEXÃO DE CARRETA P&P', quantity:1, unitPrice:260.4, total:260.4 }],
 subtotal:7677.6, discountPercent:10, discount:767.76, total:6909.84, entry:0, balance:6909.84, monthly:205.86,
 payments:[{label:'PIX à vista',amount:6909.84},{label:'Boleto Sem Juros',installments:3,amount:2303.28},{label:'Cartão Sem Juros',installments:12,amount:575.82}],
 financing:[10,12,18,24,30,36].map((n,i)=>({label:'Financiamento',installments:n,amount:[842.01,722.2,522.67,423.64,365.1,326.86][i]}))
};
const details = { client:quote.client, issued:'2026-10-18',validUntil:'2026-10-25',includeSeller:false,seller:'Consultor Exemplo',contact:'consultor@example.invalid',notes:'' };
const dir = '/tmp/proposal-validation';fs.mkdirSync(dir,{recursive:true});
for (const [name,q,d] of [ ['sample',quote,details], ['with-seller',quote,{...details,includeSeller:true}], ['no-client',{...quote,monthly:0,payments:[],financing:[]},{...details,client:'  ',seller:'',contact:'',validUntil:''}], ['long',{...quote,lines:Array.from({length:45},(_,i)=>({...quote.lines[0],id:'p'+i,name:`Equipamento ${i+1} - descrição extensa para verificar quebra de linha e paginação`,unitPrice:100,total:100})),subtotal:4500,discountPercent:0,discount:0,total:4500,balance:4500,payments:[],financing:[]},{...details,notes:'Observações adicionais. '.repeat(45)}] ]) {
 const file=path.join(dir,name+'.pdf');
 await renderToFile(React.createElement(ProposalDocument,{quote:q,details:d,logo:path.resolve('public/brand/omnilink-original.png')}),file);
 assert.ok(fs.statSync(file).size>1000);console.log(file);
}

const extracted = async name => (await run('pdftotext', [path.join(dir,name+'.pdf'), '-'])).stdout;
const sample=await extracted('sample');
assert.doesNotMatch(sample,/Responsável comercial|Consultor Exemplo|consultor@example.invalid/);
assert.match(await extracted('with-seller'),/Consultor Exemplo/);
assert.match((await run('pdfinfo',[path.join(dir,'with-seller.pdf')])).stdout, /Pages:\s+1/);
assert.match(sample,/Opções de financiamento/);
assert.doesNotMatch(sample,/TAC|IOF/);
assert.doesNotMatch((await run('pdfinfo',[path.join(dir,'sample.pdf')])).stdout,/Consultor Exemplo/);
for(const value of ['João Marcos','6.909,84','767,76','205,86','2.303,28','575,82','326,86','Show Tecnologia']) assert.ok(sample.includes(value),value);
assert.match((await run('pdfinfo',[path.join(dir,'sample.pdf')])).stdout, /Pages:\s+1/);
assert.doesNotMatch(await extracted('no-client'),/Cliente|Mensalidade|Condições de pagamento|Responsável comercial/);
const long=await extracted('long');
for(let n=1;n<=45;n++) assert.ok(long.includes(`Equipamento ${n} -`));
assert.match(long,/4\s*\/\s*4/);
console.log('PASS PDF values, one-page example, omitted empty sections, all 45 products and page numbering');
