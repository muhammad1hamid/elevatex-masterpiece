import { validateInquiry } from '../src/lib/contact/validation';
import { inquiryServices } from '../src/data/contact';

interface RateLimiter {
  limit(input: { key: string }): Promise<{ success: boolean }>;
}
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CONTACT_LIMITER: RateLimiter;
  CONTACT_GLOBAL_LIMITER: RateLimiter;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_ENABLED?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}
const origin = 'https://elevatexlab.org';
const maxBytes = 32768;
const reply = (status: number, body: Record<string, unknown>) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
      ...(status === 429 ? { 'Retry-After': '60' } : {}),
    },
  });
const unavailable = () =>
  reply(503, {
    ok: false,
    message:
      'Inquiry sending is temporarily unavailable. Please try again later or contact us on WhatsApp.',
  });
const configured = (env: Env) =>
  Boolean(
    env.CONTACT_ENABLED === 'true' &&
    env.RESEND_API_KEY &&
    env.TURNSTILE_SECRET_KEY &&
    env.CONTACT_TO_EMAIL &&
    env.CONTACT_FROM_EMAIL &&
    env.CONTACT_LIMITER &&
    env.CONTACT_GLOBAL_LIMITER,
  );
const digest = async (value: string) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
    ),
  ]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (
    Number(request.headers.get('Content-Length') ?? '0') > maxBytes ||
    !request.body
  )
    throw new Error('Invalid body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maxBytes) {
        await reader.cancel();
        throw new Error('Body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const result: unknown = JSON.parse(
    new TextDecoder('utf-8', { fatal: true }).decode(bytes),
  );
  if (!result || typeof result !== 'object' || Array.isArray(result))
    throw new Error('Invalid JSON');
  return result as Record<string, unknown>;
}

async function contact(request: Request, env: Env): Promise<Response> {
  // The production hostname and same-origin POST are required even on preview Workers.
  if (new URL(request.url).origin !== origin)
    return reply(403, {
      ok: false,
      message: 'Use the contact form on elevatexlab.org.',
    });
  if (request.method === 'GET') return reply(200, { ready: configured(env) });
  if (request.method !== 'POST')
    return reply(405, {
      ok: false,
      message: 'Use the contact form to send an inquiry.',
    });
  if (
    request.headers.get('Origin') !== origin ||
    request.headers.get('Sec-Fetch-Site') === 'cross-site'
  )
    return reply(403, {
      ok: false,
      message: 'Please reload the contact page and try again.',
    });
  if (!configured(env)) return unavailable();
  if (
    request.headers.get('Content-Type')?.split(';')[0]?.trim() !==
    'application/json'
  )
    return reply(415, { ok: false, message: 'Unsupported submission format.' });
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return unavailable();
  const clientKey = await digest(`contact:${ip}`);
  if (
    !(await env.CONTACT_LIMITER.limit({ key: clientKey })).success ||
    !(await env.CONTACT_GLOBAL_LIMITER.limit({ key: 'contact' })).success
  )
    return reply(429, {
      ok: false,
      message: 'Too many attempts. Please wait a minute before trying again.',
    });
  let input: Record<string, unknown>;
  try {
    input = await readBody(request);
  } catch {
    return reply(400, {
      ok: false,
      message:
        'The inquiry could not be read. Please shorten it and try again.',
    });
  }
  const { values, errors } = validateInquiry(input);
  if (Object.keys(errors).length)
    return reply(422, {
      ok: false,
      message: 'Please check the highlighted fields.',
      errors,
    });
  if (typeof input['company'] !== 'string' || input['company'].trim())
    return reply(400, {
      ok: false,
      message: 'The inquiry could not be verified. Please reload the page.',
    });
  const submissionId = input['submissionId'];
  const token = input['turnstileToken'];
  if (
    typeof submissionId !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      submissionId,
    ) ||
    typeof token !== 'string' ||
    !token ||
    token.length > 2048
  )
    return reply(400, {
      ok: false,
      message: 'Complete the security check, then try again.',
    });
  const verification = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY!,
        response: token,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!verification.ok) return unavailable();
  const challenge = (await verification.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
    'error-codes'?: string[];
  };
  if (
    challenge['error-codes']?.includes('invalid-input-secret') ||
    challenge['error-codes']?.includes('missing-input-secret')
  )
    return unavailable();
  if (
    !challenge.success ||
    challenge.hostname !== 'elevatexlab.org' ||
    challenge.action !== 'contact_inquiry'
  )
    return reply(400, {
      ok: false,
      message:
        'The security check expired or could not be verified. Please try it again.',
    });
  const service = inquiryServices.find(
    ({ value }) => value === values.service,
  )!.label;
  const fields = Object.entries(values)
    .map(([key, value]) => `${key}: ${value || 'Not provided'}`)
    .join('\n\n');
  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY!}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `inquiry/${submissionId}/${await digest(JSON.stringify(values))}`,
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: values.email,
      subject: `ElevateX project inquiry — ${service}`,
      text: `New inquiry from the ElevateX website.\n\n${fields}\n\nReference: ${submissionId}\n\nUse Reply to respond to the visitor.`,
    }),
  });
  if (!mail.ok) return unavailable();
  const accepted = (await mail.json()) as { id?: unknown };
  if (typeof accepted.id !== 'string' || !accepted.id) return unavailable();
  // Provider acceptance is not a claim of inbox delivery or a paid client agreement.
  return reply(200, {
    ok: true,
    message:
      'Your inquiry was accepted for email delivery. Thank you — we’ll reply by email.',
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/api/contact' || path === '/api/contact/') {
      try {
        return await contact(request, env);
      } catch {
        return unavailable();
      }
    }
    if (path.startsWith('/api/'))
      return reply(404, { ok: false, message: 'Not found.' });
    return env.ASSETS.fetch(request);
  },
};
