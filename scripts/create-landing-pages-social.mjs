import { site } from '../src/data/site.ts';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const font = (
  await readFile('public/fonts/outfit-latin-wght-normal.woff2')
).toString('base64');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><style>
  @font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font});font-weight:400 500}*{box-sizing:border-box}body{margin:0;color:#f3f0e9;background:#0c0c0b;font-family:Outfit}main{height:630px;padding:48px 65px;background:radial-gradient(ellipse at 75% 60%,#29271f,transparent 60%)}.brand{font-size:30px;margin:0}.layout{display:grid;grid-template-columns:1.5fr 1fr;gap:50px;align-items:center;margin-top:30px}.eyebrow{font-size:13px;letter-spacing:3px;color:#e8d7b3}h1{font-size:67px;font-weight:400;line-height:1.02;letter-spacing:-2.5px;margin:25px 0}h1 span{color:#e8d7b3}.page{border:1px solid #6a604b;padding:22px;background:#161612;border-radius:8px}.page p{padding:14px 18px;margin:0;border-left:1px solid #d6be8c;border-bottom:1px solid #37362c;font-size:22px}.page small{display:block;font-size:10px;letter-spacing:2px;color:#d6be8c;margin-bottom:8px}.action{background:#e8d7b3;color:#111;margin:20px 0 0;padding:14px;text-align:center;font-size:18px}.url{font-size:13px;color:#b5b3ad;margin-top:40px;letter-spacing:1px}
  </style><main><p class="brand">ElevateX</p><div class="layout"><div><p class="eyebrow">LANDING PAGES</p><h1>One page.<br>One clear goal.<br><span>Built around action.</span></h1></div><div class="page"><p><small>01 / ATTENTION</small>A clear promise.</p><p><small>02 / MESSAGE & VALUE</small>A reason to care.</p><p><small>03 / PROOF</small>A reason to believe.</p><div class="action">One clear next step →</div></div></div><p class="url">${new URL(site.origin).hostname} / services / landing-pages</p></main></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'public/images/social/landing-pages.png' });
} finally {
  await browser.close();
}
