import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
const root = new URL('../', import.meta.url);
const font = (
  await readFile(new URL('public/fonts/outfit-latin-wght-normal.woff2', root))
).toString('base64');
await mkdir(new URL('public/images/social/', root), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  @font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400 600}
  *{box-sizing:border-box}body{margin:0;background:#0c0c0b;color:#f3f0e9;font-family:Outfit,Arial,sans-serif}main{width:1200px;height:630px;padding:40px 65px;text-align:center;background:radial-gradient(ellipse at 50% 90%,#26241c,transparent 65%)}
  .brand{text-align:left;font-size:28px;letter-spacing:-1px;margin:0}.eyebrow{font-size:12px;letter-spacing:3px;color:#e8d7b3;margin:24px 0 18px}h1{font-size:66px;font-weight:400;letter-spacing:-2.5px;line-height:1.05;margin:0 auto;max-width:1000px}h1 span{display:block;color:#e8d7b3}.dialog{display:grid;grid-template-columns:1.3fr 1fr;gap:35px;text-align:left;margin:34px auto 0;max-width:920px;border:1px solid #554e40;border-radius:16px;padding:26px;background:#191917}.message{background:#28261f;border:1px solid #554e40;border-radius:12px;padding:18px 24px;font-size:24px;margin:0}.label{font-size:11px;letter-spacing:1.5px;color:#e8d7b3;margin:0 0 10px}.context{font-size:22px;margin:0}.context span{display:block;color:#b5b3ad;font-size:18px;margin-top:12px}.footer{font-size:14px;color:#b5b3ad;margin-top:28px;letter-spacing:1px}
  </style></head><body><main><p class="brand">ElevateX</p><p class="eyebrow">AI CHATBOTS</p><h1>Conversations that do<span>more than just reply.</span></h1><div class="dialog"><div><p class="label">THE CONVERSATION</p><p class="message">“I need a website for my salon. Can you help?”</p></div><div><p class="label">THE UNDERSTANDING</p><p class="context">A new project. A clear starting point.<span>Gather context → Offer a human follow-up</span></p></div></div><p class="footer">www.elevatexlab.com / services / ai-chatbots</p></main></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: fileURLToPath(new URL('public/images/social/ai-chatbots.png', root)),
  });
} finally {
  await browser.close();
}
