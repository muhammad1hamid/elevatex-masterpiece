import { site } from '../src/data/site.ts';
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
  .brand{text-align:left;font-size:28px;letter-spacing:-1px;margin:0}.eyebrow{font-size:12px;letter-spacing:3px;color:#e8d7b3;margin:30px 0 18px}h1{font-size:61px;font-weight:400;letter-spacing:-2.5px;line-height:1.05;margin:0 auto;max-width:1000px}h1 span{display:block;color:#e8d7b3}.flow{display:flex;align-items:center;justify-content:center;gap:24px;margin:44px auto 0}.node{border:1px solid #6e634e;border-radius:9px;background:#151512;padding:20px 28px;width:230px}.node small{color:#d6be8c;font-size:11px;letter-spacing:2px;display:block;margin-bottom:10px}.node strong{font-size:23px;font-weight:400}.arrow{color:#d6be8c;font-size:24px}.review{margin:22px auto 0;border-top:1px solid #6e634e;padding-top:19px;color:#e8d7b3;font-size:17px;width:500px}.footer{font-size:13px;color:#b5b3ad;margin-top:28px;letter-spacing:1px}
  </style></head><body><main><p class="brand">ElevateX</p><p class="eyebrow">AI AUTOMATION</p><h1>Turn repetitive work into<span>systems that run smarter.</span></h1><div class="flow"><div class="node"><small>01 / INPUT</small><strong>Receive & understand</strong></div><span class="arrow">→</span><div class="node"><small>02 / LOGIC</small><strong>Decide & validate</strong></div><span class="arrow">→</span><div class="node"><small>03 / ACTION</small><strong>Connect & coordinate</strong></div></div><p class="review">Human control where it matters.</p><p class="footer">${new URL(site.origin).hostname} / services / ai-automation</p></main></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: fileURLToPath(
      new URL('public/images/social/ai-automation.png', root),
    ),
  });
} finally {
  await browser.close();
}
