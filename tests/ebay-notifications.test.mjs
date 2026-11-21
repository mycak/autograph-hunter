import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { challengeResponse, createHandler, verifyEbaySignature } from '../supabase/functions/ebay-account-deletion/handler.mjs';

const config = { verificationToken: 'a'.repeat(64), endpoint: 'https://example.test/ebay' };
const pair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pem = pair.publicKey.export({ type: 'spki', format: 'pem' });
const message = { metadata: { topic: 'MARKETPLACE_ACCOUNT_DELETION' }, notification: {
  notificationId: 'test-notification', eventDate: '2026-11-21T08:00:00Z',
  data: { userId: 'test-user', username: 'test-name', eiasToken: 'must-not-be-stored' } } };
const header = Buffer.from(JSON.stringify({ kid: 'test-key', signature:
  sign('sha1', Buffer.from(JSON.stringify(message)), pair.privateKey).toString('base64') })).toString('base64');
function setup(enqueue = async () => {}) {
  return createHandler({ getConfig: async () => config, getPublicKey: async () => pem, enqueue });
}
function post(body = message, signature = header) {
  return new Request(config.endpoint, { method: 'POST', body: JSON.stringify(body),
    headers: signature ? { 'x-ebay-signature': signature } : {} });
}

test('challenge hashes the exact configured endpoint, token and received code', async () => {
  const expected = createHash('sha256').update('code' + config.verificationToken + config.endpoint).digest('hex');
  assert.equal(challengeResponse('code', config.verificationToken, config.endpoint), expected);
  const reply = await setup()(new Request(config.endpoint + '?challenge_code=code'));
  assert.equal(reply.status, 200);
  assert.deepEqual(await reply.json(), { challengeResponse: expected });
  assert.equal((await setup()(new Request(config.endpoint))).status, 400);
});
test('valid eBay ECDSA signature is queued before acknowledgement, without EIAS token', async () => {
  const rows = [];
  const response = await setup(async row => rows.push(row))(post());
  assert.equal(response.status, 204);
  assert.deepEqual(rows, [{ notification_id: 'test-notification', event_at: message.notification.eventDate,
    user_id: 'test-user', username: 'test-name' }]);
});
test('accepts eBay public keys returned as compact PEM without line breaks', async () => {
  let stored = false;
  const handler = createHandler({ getConfig: async () => config,
    getPublicKey: async () => pem.replaceAll('\n', ''), enqueue: async () => { stored = true; } });
  assert.equal((await handler(post())).status, 204);
  assert.equal(stored, true);
});
test('verifies secp256k1 used by eBay, including high-S DER signatures', () => {
  const ebayPair = generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
  const publicPem = ebayPair.publicKey.export({ type: 'spki', format: 'pem' });
  for (let i = 0; i < 10; i++) {
    const signature = sign('sha1', Buffer.from(JSON.stringify(message)), ebayPair.privateKey).toString('base64');
    assert.equal(verifyEbaySignature(message, signature, publicPem), true);
    const tampered = structuredClone(message); tampered.notification.data.userId = 'other';
    assert.equal(verifyEbaySignature(tampered, signature, publicPem), false);
  }
});
test('missing signature and tampered payload cannot enter the inbox', async () => {
  const handler = setup(async () => assert.fail('untrusted notification was stored'));
  assert.equal((await handler(post(message, null))).status, 412);
  const changed = structuredClone(message); changed.notification.data.userId = 'attacker';
  assert.equal((await handler(post(changed))).status, 412);
  assert.equal((await handler(post(message, 'not-json'))).status, 400);
});
test('database/key failures request retry instead of losing a notification', async () => {
  assert.equal((await setup(async () => { throw new Error('database down'); })(post())).status, 503);
  const handler = createHandler({ getConfig: async () => config,
    getPublicKey: async () => { throw new Error('OAuth down'); }, enqueue: async () => assert.fail() });
  assert.equal((await handler(post())).status, 503);
});
test('unrelated topics and oversized requests are rejected', async () => {
  const handler = setup(async () => assert.fail());
  const other = structuredClone(message); other.metadata.topic = 'OTHER';
  assert.equal((await handler(post(other))).status, 400);
  assert.equal((await handler(new Request(config.endpoint, { method: 'POST',
    headers: { 'x-ebay-signature': header }, body: 'x'.repeat(65537) }))).status, 400);
  assert.equal((await handler(new Request(config.endpoint, { method: 'DELETE' }))).status, 405);
});
