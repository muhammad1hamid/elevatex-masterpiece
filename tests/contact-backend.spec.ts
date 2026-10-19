import { test, expect } from '@playwright/test';
import worker from '../worker/index';
import { inquiryServices, inquiryBudgets } from '../src/data/contact';

const origin = 'https://elevatexlab.org';
const payload = () => ({
  name: 'TEST inquiry',
  email: 'test@example.test',
  service: inquiryServices[0]!.value,
  budget: inquiryBudgets[0]!.value,
  phone: '',
  timeline: '',
  website: '',
  description: 'Synthetic backend verification only.',
  company: '',
  submissionId: crypto.randomUUID(),
  turnstileToken: 'inert-test-token',
});
const env = () => ({
  ASSETS: { fetch: async () => new Response('static') },
  CONTACT_LIMITER: { limit: async () => ({ success: true }) },
  CONTACT_GLOBAL_LIMITER: { limit: async () => ({ success: true }) },
  CONTACT_ENABLED: 'true',
  RESEND_API_KEY: 'inert-test-secret',
  TURNSTILE_SECRET_KEY: 'inert-test-secret',
  CONTACT_TO_EMAIL: 'owner@example.test',
  CONTACT_FROM_EMAIL: 'test@example.test',
});
const request = (body: unknown, requestOrigin = origin) =>
  new Request(origin + '/api/contact', {
    method: 'POST',
    headers: {
      Origin: requestOrigin,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '192.0.2.1',
    },
    body: JSON.stringify(body),
  });

test('backend fails closed and preserves static asset routing', async () => {
  expect(
    await (
      await worker.fetch(new Request(origin + '/api/contact'), {
        ...env(),
        RESEND_API_KEY: '',
      })
    ).json(),
  ).toEqual({ ready: false });
  expect(
    await (await worker.fetch(new Request(origin + '/about/'), env())).text(),
  ).toBe('static');
  expect(
    (await worker.fetch(request(payload(), 'https://other.example'), env()))
      .status,
  ).toBe(403);
});

test('backend rejects malformed fields, filled honeypot and rate-limited clients', async () => {
  expect(
    (await worker.fetch(request({ ...payload(), email: 'invalid' }), env()))
      .status,
  ).toBe(422);
  expect(
    (await worker.fetch(request({ ...payload(), company: 'spam' }), env()))
      .status,
  ).toBe(400);
  expect(
    (
      await worker.fetch(request(payload()), {
        ...env(),
        CONTACT_LIMITER: { limit: async () => ({ success: false }) },
      })
    ).status,
  ).toBe(429);
  expect(
    (
      await worker.fetch(
        request({ ...payload(), description: 'x'.repeat(33000) }),
        env(),
      )
    ).status,
  ).toBe(400);
});

test('backend verifies Turnstile hostname/action before any email request', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({
      success: true,
      hostname: 'other.example',
      action: 'contact_inquiry',
    });
  };
  try {
    expect((await worker.fetch(request(payload()), env())).status).toBe(400);
    expect(calls).toBe(1);
  } finally {
    globalThis.fetch = original;
  }
});

test('backend reports success only on provider acceptance and uses a fixed destination', async () => {
  const original = globalThis.fetch;
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), ...(init ? { init } : {}) });
    return Response.json(
      String(url).includes('siteverify')
        ? {
            success: true,
            hostname: 'elevatexlab.org',
            action: 'contact_inquiry',
          }
        : { id: 'mock-accepted' },
    );
  };
  try {
    const body = payload();
    const response = await worker.fetch(request(body), env());
    expect(response.status).toBe(200);
    expect((await response.json()).ok).toBe(true);
    const mail = JSON.parse(String(calls[1]!.init!.body));
    expect(mail.to).toEqual(['owner@example.test']);
    expect(mail.reply_to).toBe(body.email);
    expect(mail.html).toBeUndefined();
    const key = new Headers(calls[1]!.init!.headers).get('Idempotency-Key');
    await worker.fetch(request(body), env());
    expect(new Headers(calls[3]!.init!.headers).get('Idempotency-Key')).toBe(
      key,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test('backend provider failure never returns a success response', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) =>
    String(url).includes('siteverify')
      ? Response.json({
          success: true,
          hostname: 'elevatexlab.org',
          action: 'contact_inquiry',
        })
      : new Response('provider failure', { status: 503 });
  try {
    const response = await worker.fetch(request(payload()), env());
    expect(response.status).toBe(503);
    expect((await response.json()).ok).toBe(false);
  } finally {
    globalThis.fetch = original;
  }
});
