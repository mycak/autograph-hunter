-- Private webhook inbox. Receiving a request does not mean its deletion has been completed.
create table public.ebay_deletion_requests (
  notification_id text primary key,
  event_at timestamptz not null,
  received_at timestamptz not null default now(),
  user_id text,
  username text,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  check (user_id is not null or username is not null)
);
alter table public.ebay_deletion_requests enable row level security;
revoke all on public.ebay_deletion_requests from public, anon, authenticated;
grant select, insert, update on public.ebay_deletion_requests to service_role;

-- No public/anon/authenticated role can call this RPC. Vault encrypts config at rest.
grant usage on schema vault to service_role;
grant select on vault.decrypted_secrets to service_role;
create function public.ebay_notification_config() returns jsonb
language sql stable security invoker set search_path = ''
as $$ select decrypted_secret::jsonb from vault.decrypted_secrets
      where name = 'autograph_hunter_ebay_notifications' $$;
revoke all on function public.ebay_notification_config() from public, anon, authenticated;
grant execute on function public.ebay_notification_config() to service_role;

-- The dashboard-created automatic RLS trigger is internal, never a callable public RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
