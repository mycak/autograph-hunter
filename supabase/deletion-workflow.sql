-- Apply once after ebay-notifications.sql. No identity is placed in the audit log.
alter table public.ebay_deletion_requests
  drop constraint ebay_deletion_requests_status_check,
  drop constraint ebay_deletion_requests_check,
  add column claim_token uuid,
  add column lease_until timestamptz,
  add column attempts integer not null default 0,
  add column resolution text,
  add column evidence_sha256 text,
  add column checks jsonb,
  add column blocked_reason text,
  add constraint deletion_status check (status in ('pending','processing','blocked','completed')),
  add constraint deletion_identity check (status='completed' or user_id is not null or username is not null);

-- The previously completed synthetic eBay test needs no retained identity.
update public.ebay_deletion_requests set user_id=null, username=null,
  resolution='legacy_completed' where status='completed';

create table public.ebay_deletion_audit (
  id bigint generated always as identity primary key,
  notification_id text not null references public.ebay_deletion_requests(notification_id),
  recorded_at timestamptz not null default now(),
  status text not null,
  attempt integer not null,
  resolution text,
  evidence_sha256 text,
  blocked_reason text
);
alter table public.ebay_deletion_audit enable row level security;
revoke all on public.ebay_deletion_audit from public,anon,authenticated;
grant select,insert on public.ebay_deletion_audit to service_role;
grant usage on sequence public.ebay_deletion_audit_id_seq to service_role;

create function public.guard_ebay_deletion() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.status='completed' then
    if old.status is distinct from 'completed' then
      if new.resolution is null or new.resolution not in ('deleted','no_stored_data')
         or new.evidence_sha256 is null or new.evidence_sha256 !~ '^[a-f0-9]{64}$'
         or new.checks is null
         or not (new.checks @> '{"identityMapping":true,"repository":true,"history":true,"artifacts":true,"localCaches":true,"backend":true,"unresolvedCount":0}'::jsonb)
      then raise exception 'Verified completion evidence and all storage checks are required'; end if;
    end if;
    new.user_id:=null; new.username:=null; new.claim_token:=null; new.lease_until:=null;
    new.blocked_reason:=null; new.completed_at:=coalesce(new.completed_at,now());
  end if;
  return new;
end $$;
create trigger guard_ebay_deletion before insert or update on public.ebay_deletion_requests
for each row execute function public.guard_ebay_deletion();

create function public.log_ebay_deletion() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  insert into public.ebay_deletion_audit(notification_id,status,attempt,resolution,evidence_sha256,blocked_reason)
  values(new.notification_id,new.status,new.attempts,new.resolution,new.evidence_sha256,new.blocked_reason);
  return new;
end $$;
create trigger log_ebay_deletion after update on public.ebay_deletion_requests
for each row when (old.status is distinct from new.status or old.attempts is distinct from new.attempts)
execute function public.log_ebay_deletion();

create function public.claim_ebay_deletion() returns setof public.ebay_deletion_requests
language sql security invoker set search_path='' as $$
  with candidate as (
    select notification_id from public.ebay_deletion_requests
    where status='pending' or (status='processing' and lease_until<now())
    order by received_at for update skip locked limit 1
  )
  update public.ebay_deletion_requests r set status='processing',
    claim_token=pg_catalog.gen_random_uuid(),lease_until=now()+interval '15 minutes',
    attempts=r.attempts+1,blocked_reason=null
  from candidate c where r.notification_id=c.notification_id returning r.*;
$$;

create function public.finish_ebay_deletion(p_id text,p_token uuid,p_resolution text,p_digest text,p_checks jsonb)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_resolution is null or p_resolution not in ('deleted','no_stored_data') then raise exception 'Invalid resolution'; end if;
  update public.ebay_deletion_requests set status='completed',resolution=p_resolution,
    evidence_sha256=p_digest,checks=p_checks
  where notification_id=p_id and status='processing' and claim_token=p_token and lease_until>now();
  if not found then raise exception 'Claim missing, expired or already closed'; end if;
end $$;

create function public.block_ebay_deletion(p_id text,p_token uuid,p_reason text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_reason not in ('identity_unresolved','storage_review_incomplete','erasure_required','provider_unavailable')
    then raise exception 'Use a non-personal reason code'; end if;
  update public.ebay_deletion_requests set status='blocked',blocked_reason=p_reason,claim_token=null,lease_until=null
  where notification_id=p_id and status='processing' and claim_token=p_token and lease_until>now();
  if not found then raise exception 'Claim missing, expired or already closed'; end if;
end $$;

create function public.retry_ebay_deletion(p_id text) returns void
language sql security invoker set search_path='' as $$
  update public.ebay_deletion_requests set status='pending',blocked_reason=null
  where notification_id=p_id and status='blocked';
$$;

revoke all on function public.guard_ebay_deletion(),public.log_ebay_deletion(),public.claim_ebay_deletion(),
  public.finish_ebay_deletion(text,uuid,text,text,jsonb),public.block_ebay_deletion(text,uuid,text),
  public.retry_ebay_deletion(text) from public,anon,authenticated;
grant execute on function public.guard_ebay_deletion(),public.log_ebay_deletion(),public.claim_ebay_deletion(),
  public.finish_ebay_deletion(text,uuid,text,text,jsonb),public.block_ebay_deletion(text,uuid,text),
  public.retry_ebay_deletion(text) to service_role;
