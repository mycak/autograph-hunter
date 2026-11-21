import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { p256 } from '@noble/curves/nist.js';

const json = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store' },
});

export function challengeResponse(code, token, endpoint) {
  return createHash('sha256').update(code).update(token).update(endpoint).digest('hex');
}

// eBay's notification SDK verifies SHA-1 ECDSA signatures over JSON.stringify(message).
// This is the provider's notification protocol, separate from the SHA-256 challenge.
export function verifyEbaySignature(message, signature, pem) {
  try {
    const body = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '');
    const der = Buffer.from(body, 'base64');
    // Exact SPKI structures for uncompressed secp256k1/P-256 keys. The older
    // Deno runtime in hosted Edge Functions cannot import eBay's secp256k1 PEM.
    const prefix = der.subarray(0, der.length - 65).toString('hex');
    const curve = prefix === '3056301006072a8648ce3d020106052b8104000a034200' ? secp256k1
      : prefix === '3059301306072a8648ce3d020106082a8648ce3d030107034200' ? p256 : null;
    if (!curve || der[der.length - 65] !== 4) return false;
    const digest = createHash('sha1').update(JSON.stringify(message)).digest();
    return curve.verify(Buffer.from(signature, 'base64'), digest, der.subarray(-65),
      { prehash: false, lowS: false, format: 'der' });
  } catch {
    return false;
  }
}

async function boundedBody(request) {
  if (Number(request.headers.get('content-length')) > 65536) throw new Error('oversized');
  const reader = request.body?.getReader();
  if (!reader) return '';
  const parts = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65536) { await reader.cancel(); throw new Error('oversized'); }
    parts.push(value);
  }
  return Buffer.concat(parts).toString('utf8');
}

export function createHandler({ getConfig, getPublicKey, enqueue }) {
  return async (request) => {
    try {
      const url = new URL(request.url);
      if (request.method === 'GET') {
        const code = url.searchParams.get('challenge_code');
        if (!code || code.length > 1024) return json({ error: 'challenge_code required' }, 400);
        const config = await getConfig();
        if (!config.endpoint || !/^[A-Za-z0-9_-]{32,80}$/.test(config.verificationToken)) {
          return json({ error: 'Endpoint not configured' }, 503);
        }
        return json({ challengeResponse: challengeResponse(code, config.verificationToken, config.endpoint) });
      }
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
      const encoded = request.headers.get('x-ebay-signature');
      if (!encoded || encoded.length > 4096) return json({ error: 'Signature required' }, 412);
      let signature, message;
      try {
        signature = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
        message = JSON.parse(await boundedBody(request));
      } catch {
        return json({ error: 'Invalid notification' }, 400);
      }
      if (typeof signature.kid !== 'string' || !signature.kid || signature.kid.length > 512 ||
          typeof signature.signature !== 'string' || signature.signature.length > 512) {
        return json({ error: 'Invalid signature header' }, 412);
      }
      const notification = message?.notification;
      const user = notification?.data;
      if (message?.metadata?.topic !== 'MARKETPLACE_ACCOUNT_DELETION' ||
          typeof notification?.notificationId !== 'string' || !notification.notificationId ||
          notification.notificationId.length > 512 ||
          !Number.isFinite(Date.parse(notification.eventDate)) ||
          (!user?.userId && !user?.username) ||
          [user?.userId, user?.username].some(v => v != null && (typeof v !== 'string' || v.length > 1024))) {
        return json({ error: 'Invalid account deletion payload' }, 400);
      }
      const pem = await getPublicKey(signature.kid, await getConfig());
      if (!verifyEbaySignature(message, signature.signature, pem)) return json({ error: 'Signature rejected' }, 412);
      // Acknowledge only after durable, idempotent storage. No raw payload or EIAS token is retained.
      await enqueue({ notification_id: notification.notificationId, event_at: notification.eventDate,
        user_id: user.userId || null, username: user.username || null });
      return new Response(null, { status: 204 });
    } catch {
      // Never put OAuth credentials, tokens, notification identities or provider responses in logs.
      return json({ error: 'Notification service temporarily unavailable' }, 503);
    }
  };
}
