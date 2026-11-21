-- Integration test: always rollback, including the synthetic notification and audit trail.
begin;
do $$
declare r public.ebay_deletion_requests; denied boolean;
begin
  insert into public.ebay_deletion_requests(notification_id,event_at,received_at,username)
  values('__workflow_integration_test__',now(),'1900-01-01','synthetic-not-a-real-user');
  select * into r from public.claim_ebay_deletion();
  assert r.notification_id='__workflow_integration_test__' and r.status='processing' and r.attempts=1;
  denied:=false;
  begin
    perform public.finish_ebay_deletion(r.notification_id,gen_random_uuid(),'no_stored_data',repeat('a',64),'{}');
  exception when others then denied:=true; end;
  assert denied, 'Wrong claim token accepted';
  denied:=false;
  begin
    perform public.finish_ebay_deletion(r.notification_id,r.claim_token,'no_stored_data',repeat('a',64),'{}');
  exception when others then denied:=true; end;
  assert denied, 'Missing storage evidence accepted';
  perform public.block_ebay_deletion(r.notification_id,r.claim_token,'identity_unresolved');
  assert (select status='blocked' and claim_token is null from public.ebay_deletion_requests where notification_id=r.notification_id);
  perform public.retry_ebay_deletion(r.notification_id);
  select * into r from public.claim_ebay_deletion();
  assert r.attempts=2;
  update public.ebay_deletion_requests set lease_until=now()-interval '1 second' where notification_id=r.notification_id;
  denied:=false;
  begin
    perform public.finish_ebay_deletion(r.notification_id,r.claim_token,'no_stored_data',repeat('a',64),'{}');
  exception when others then denied:=true; end;
  assert denied, 'Expired claim accepted';
  select * into r from public.claim_ebay_deletion();
  assert r.attempts=3;
  perform public.finish_ebay_deletion(r.notification_id,r.claim_token,'no_stored_data',repeat('a',64),
    '{"identityMapping":true,"repository":true,"history":true,"artifacts":true,"localCaches":true,"backend":true,"unresolvedCount":0}');
  select * into r from public.ebay_deletion_requests where notification_id=r.notification_id;
  assert r.status='completed' and r.user_id is null and r.username is null and r.claim_token is null and r.completed_at is not null;
  insert into public.ebay_deletion_requests(notification_id,event_at,username)
  values(r.notification_id,now(),'replayed-identity') on conflict do nothing;
  assert (select username is null from public.ebay_deletion_requests where notification_id=r.notification_id), 'Replay restored identity';
  assert (select count(*)>=6 from public.ebay_deletion_audit where notification_id=r.notification_id);
  assert not has_table_privilege('anon','public.ebay_deletion_requests','select');
  assert not has_table_privilege('authenticated','public.ebay_deletion_audit','select');
  assert not has_function_privilege('anon','public.claim_ebay_deletion()','execute');
  assert not has_function_privilege('authenticated','public.finish_ebay_deletion(text,uuid,text,text,jsonb)','execute');
end $$;
rollback;
