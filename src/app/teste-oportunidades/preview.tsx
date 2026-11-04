'use client';
import { useEffect, useState } from 'react';
import { OpportunitiesView } from '@/components/OpportunitiesView';
import type { Opportunity } from '@/types';
import { expirationFor, OPPORTUNITY_SOURCE, opportunitySnapshot } from '@/lib/opportunityImport';
const KEY='opportunity-local-preview-v1';
export function OpportunityLocalPreview() {
  const [rows,setRows]=useState<Opportunity[]>([]),[modal,setModal]=useState(false),[ready,setReady]=useState(false);
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))setRows(saved);}catch{/* Empty local sandbox. */}setReady(true);},[]);
  const persist=(next:Opportunity[])=>{localStorage.setItem(KEY,JSON.stringify(next));setRows(next);};
  if(!ready) return <p role="status">Abrindo teste local…</p>;
  return <main style={{maxWidth:1280,margin:'0 auto',padding:'32px 20px'}}><div className="ui-panel" style={{padding:16,marginBottom:24}}><strong>Teste local de oportunidades</strong><p className="ui-muted">Esta carteira é separada da sua conta. Os dados ficam apenas neste navegador e não são enviados ao servidor.</p></div>
    <OpportunitiesView opportunities={rows} preferenceKey="local-preview" isModalOpen={modal} setIsModalOpen={setModal}
      onAddOpportunity={async value=>{persist([{...value,id:crypto.randomUUID(),user_id:'local-preview',created_at:new Date().toISOString()},...rows]);return true;}}
      onEditOpportunity={async(id,value)=>{persist(rows.map(o=>o.id===id?{...o,...value}:o));return true;}}
      onDeleteOpportunities={async ids=>{persist(rows.filter(o=>!ids.includes(o.id)));return true;}}
      onDeleteOpportunity={async id=>{persist(rows.filter(o=>o.id!==id));return true;}}
      onRenewOpportunity={async id=>{persist(rows.map(o=>o.id===id?{...o,expiration_date:expirationFor(o.expiration_date,o.type),status:'renewed'}:o));return true;}}
      onImportOpportunities={async items=>{
        const next=[...rows];const result={inserted:0,updated:0,skipped:0};
        for(const item of items) {
          const index=next.findIndex(o=>o.external_id===item.external_id && o.source_system===OPPORTUNITY_SOURCE);
          if(index>=0) {
            if(item.action==='insert'){result.skipped++;continue;}
            const old=next[index];
            if(JSON.stringify(opportunitySnapshot(old))!==JSON.stringify(item.expected))throw new Error('A carteira mudou. Abra uma nova prévia.');
            next[index]={...old,client_name:item.client_name,registration_date:item.registration_date,type:item.type,
              expiration_date:item.recalculate_expiration?expirationFor(item.registration_date,item.type):old.expiration_date,
              source_name:item.client_name,source_registration_date:item.registration_date};result.updated++;
          } else {
            if(item.action==='update')throw new Error('A carteira mudou. Abra uma nova prévia.');
            next.push({id:crypto.randomUUID(),user_id:'local-preview',client_name:item.client_name,registration_date:item.registration_date,
              type:item.type,expiration_date:expirationFor(item.registration_date,item.type),cpf_cnpj:'',phone:'',status:'active',
              source_system:OPPORTUNITY_SOURCE,external_id:item.external_id,source_name:item.client_name,source_registration_date:item.registration_date,
              imported_at:new Date().toISOString(),created_at:new Date().toISOString()});result.inserted++;
          }
        }
        persist(next);return result;
      }}/>
  </main>;
}
