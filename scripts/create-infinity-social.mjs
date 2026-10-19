import { site } from '../src/data/site.ts';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const font = (
  await readFile('public/fonts/outfit-latin-wght-normal.woff2')
).toString('base64');
const screen = (
  await readFile('public/images/work/infinity/desktop-1000.webp')
).toString('base64');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(
    `<!doctype html><html lang="en"><meta charset="utf-8"><style>@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font});font-weight:400}*{box-sizing:border-box}body{margin:0;background:#0c0c0b;color:#f3f0e9;font-family:Outfit}main{padding:44px 50px}header{display:flex;justify-content:space-between;font-size:28px;border-bottom:1px solid #41413b;padding-bottom:25px}header span{font-size:12px;letter-spacing:2px;color:#e8d7b3}.layout{display:grid;grid-template-columns:1fr 1.3fr;gap:45px;align-items:center;margin-top:65px}h1{font-size:78px;font-weight:400;line-height:1;letter-spacing:-3px;margin:0 0 25px}p{font-size:25px;color:#e8d7b3;line-height:1.25;margin:0 0 25px}small{font-size:13px;color:#b5b3ad}img{width:100%;border-radius:4px;border:1px solid #82724d}.url{font-size:12px;color:#b5b3ad;margin-top:57px;letter-spacing:1px}</style><main><header>ElevateX<span>SELECTED WORK / CONCEPT PROJECT</span></header><div class="layout"><div><h1>Infinity<br>Salon.</h1><p>Beauty, thoughtfully<br>presented online.</p><small>Website design study · Authentic interface captures</small></div><img src="data:image/webp;base64,${screen}" alt="Real Infinity Salon concept homepage"></div><p class="url">${new URL(site.origin).hostname} / work / infinity-salon</p></main></html>`,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode()));
  });
  await page.screenshot({ path: 'public/images/social/infinity-salon.png' });
} finally {
  await browser.close();
}
