-- Run against an isolated PostgreSQL with schema + migration installed, never production.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
declare payload jsonb := '[{"external_id":"1","client_name":"Empresa Teste","registration_date":"2026-10-27","type":"PJ","action":"insert"}]';
  result jsonb; existing public.opportunities; expected jsonb;
begin
 result := public.import_opportunities_csv(payload);
 assert (result->>'inserted')::int=1;
 select * into existing from public.opportunities where external_id='1';
 assert existing.expiration_date=date '2026-11-26';
 assert existing.phone='' and existing.cpf_cnpj='';
 result := public.import_opportunities_csv(payload);
 assert (result->>'skipped')::int=1;
 assert (select count(*) from public.opportunities)=1;
 update public.opportunities set expiration_date='2026-12-26', status='renewed', phone='11999999999',cpf_cnpj='123', notes='Manter';
 select * into existing from public.opportunities where external_id='1';
 expected := jsonb_build_object('client_name',existing.client_name,'registration_date',existing.registration_date,'expiration_date',existing.expiration_date,'type',existing.type,'source_name',existing.source_name,'source_registration_date',existing.source_registration_date);
 payload := jsonb_build_array(jsonb_build_object('external_id','1','client_name','Nome Atualizado','registration_date','2026-10-28','type','PJ','action','update','expected',expected));
 result := public.import_opportunities_csv(payload);
 select * into existing from public.opportunities where external_id='1';
 assert existing.expiration_date=date '2026-12-26' and existing.status='renewed';
 assert existing.phone='11999999999' and existing.notes='Manter' and existing.cpf_cnpj='123';
 begin
   perform public.import_opportunities_csv('[{"external_id":"2","client_name":"Rollback","registration_date":"2026-10-27","type":"PF","action":"insert"}]'::jsonb || payload);
   raise exception 'Expected stale conflict';
 exception when raise_exception then
   if SQLERRM not like 'A carteira mudou%' then raise; end if;
 end;
 assert not exists(select 1 from public.opportunities where external_id='2');
 expected := jsonb_build_object('client_name',existing.client_name,'registration_date',existing.registration_date,'expiration_date',existing.expiration_date,'type',existing.type,'source_name',existing.source_name,'source_registration_date',existing.source_registration_date);
 perform public.import_opportunities_csv(jsonb_build_array(jsonb_build_object('external_id','1','client_name','Nome Atualizado','registration_date','2026-10-28','type','PF','action','update','expected',expected,'recalculate_expiration',true)));
 assert (select expiration_date from public.opportunities where external_id='1')=date '2026-11-12';
end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$ begin
 assert (select count(*) from public.opportunities)=0;
 perform public.import_opportunities_csv('[{"external_id":"1","client_name":"Outro usuário","registration_date":"2026-10-27","type":"PF","action":"insert","user_id":"00000000-0000-0000-0000-000000000001"}]');
 assert (select count(*) from public.opportunities)=1;
 assert (select user_id=auth.uid() from public.opportunities limit 1);
end $$;
reset role;
do $$ begin
 assert (select count(*) from public.opportunities)=2;
 assert not has_function_privilege('anon','public.import_opportunities_csv(jsonb)','execute');
end $$;
select 'PASS atomic import, repeat IDs, per-user isolation, optimistic lock, rollback, renewal and contacts preserved, explicit recalculation' as result;
