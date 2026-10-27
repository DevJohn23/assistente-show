-- Integration checks for a migrated test database. All row changes are rolled back.
-- Run as postgres. Uses an existing administrator solely inside the transaction.
begin;
do $$ begin
 perform set_config('request.jwt.claims',(select jsonb_build_object('sub',u.id,'email',u.email,'role','authenticated')::text
 from auth.users u join public.admin_users a on a.email=u.email limit 1),true);
end $$;
set local role authenticated;
do $$ declare p jsonb; applied jsonb; payload jsonb; original jsonb; n int;
begin
 select count(*) into n from public.tecnicos;
 payload := '[{"nome":"__TESTE_IMPORTACAO__","lat":-10,"lng":-40,"descricao":"Teste"}]';
 p := public.import_technical_network(payload,'teste.kml');
 if jsonb_array_length(p->'added')<>1 then raise exception 'Preview failed'; end if;
 applied := public.import_technical_network(payload,'teste.kml',false,true,p->>'revision');
 if (select count(*) from public.tecnicos)<>n+1 then raise exception 'Insert failed'; end if;
 p := public.import_technical_network(p_restore := (applied->>'id')::uuid);
 perform public.import_technical_network(p_restore := (applied->>'id')::uuid,p_apply := true,p_expected := p->>'revision');
 if exists(select 1 from public.tecnicos where nome='__TESTE_IMPORTACAO__' and is_active) then raise exception 'Restore failed'; end if;
 select to_jsonb(t) into original from public.tecnicos t where is_active order by id limit 1;
 payload := jsonb_build_array(original || '{"telefone":"Teste"}'::jsonb);
 p := public.import_technical_network(payload,'teste.kml');
 update public.tecnicos set telefone='Concorrente' where id=(original->>'id')::int;
 begin
  perform public.import_technical_network(payload,'teste.kml',false,true,p->>'revision');
  raise exception 'Stale preview accepted';
 exception when serialization_failure then null;
 end;
 p := public.import_technical_network(payload,'teste.kml',true);
 perform public.import_technical_network(payload,'teste.kml',true,true,p->>'revision');
 if (select count(*) from public.tecnicos where is_active)<>1 then raise exception 'Deactivation failed'; end if;
 begin
  perform public.import_technical_network('[]'); raise exception 'Empty accepted';
 exception when raise_exception then if sqlerrm='Empty accepted' then raise; end if;
 end;
end $$;
rollback;
begin;
do $$ begin
 perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","email":"not-admin@example.invalid","role":"authenticated","user_metadata":{"isAdmin":true}}',true);
end $$;
set local role authenticated;
do $$ begin
 if (select count(*) from public.technical_network_imports)<>0 then raise exception 'History exposed'; end if;
 begin
  perform public.import_technical_network('[]'); raise exception 'Unauthorized accepted';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
