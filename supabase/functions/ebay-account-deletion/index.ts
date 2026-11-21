import { createHandler } from './handler.mjs';

const base = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const databaseHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json' };

async function database(path: string, body: unknown, extra = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { method: 'POST',
    headers: { ...databaseHeaders, ...extra }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Database unavailable');
  return response;
}

let configuration: { expires: number; value: any } | undefined;
async function getConfig() {
  if (configuration && configuration.expires > Date.now()) return configuration.value;
  const response = await database('rpc/ebay_notification_config', {});
  const value = await response.json();
  if (!value?.verificationToken || !value?.clientId || !value?.clientSecret) throw new Error('Missing config');
  configuration = { value, expires: Date.now() + 60000 };
  return value;
}

let oauth: { value: string; expires: number } | undefined;
const keys = new Map<string, { value: string; expires: number }>();
async function getPublicKey(kid: string, config: any) {
  const cached = keys.get(kid);
  if (cached && cached.expires > Date.now()) return cached.value;
  if (!oauth || oauth.expires <= Date.now()) {
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(config.clientId + ':' + config.clientSecret)}` },
      body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'https://api.ebay.com/oauth/api_scope' }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('OAuth unavailable');
    const payload = await response.json();
    if (!payload.access_token || !Number.isFinite(payload.expires_in)) throw new Error('Invalid OAuth response');
    oauth = { value: payload.access_token, expires: Date.now() + (payload.expires_in - 120) * 1000 };
  }
  const response = await fetch('https://api.ebay.com/commerce/notification/v1/public_key/' + encodeURIComponent(kid), {
    headers: { Authorization: `Bearer ${oauth.value}` }, signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) { if (response.status === 401) oauth = undefined; throw new Error('Key unavailable'); }
  const payload = await response.json();
  if (typeof payload.key !== 'string') throw new Error('Invalid key');
  if (payload.algorithm !== 'ECDSA' || payload.digest !== 'SHA1') throw new Error('Unexpected eBay key algorithm');
  if (keys.size >= 100) keys.delete(keys.keys().next().value!);
  keys.set(kid, { value: payload.key, expires: Date.now() + 3600000 });
  return payload.key;
}

Deno.serve(createHandler({ getConfig, getPublicKey, enqueue: (row: unknown) =>
  database('ebay_deletion_requests?on_conflict=notification_id', row,
    { Prefer: 'resolution=ignore-duplicates,return=minimal' }) }));
