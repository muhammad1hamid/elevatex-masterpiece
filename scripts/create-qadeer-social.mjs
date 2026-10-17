import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const font = (
  await readFile('public/fonts/outfit-latin-wght-normal.woff2')
).toString('base64');
const screenshot = (
  await readFile('public/images/work/qadeer/desktop-1000.webp')
).toString('base64');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(
    `<!doctype html><html><meta charset="utf-8"><style>@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font});font-weight:400}*{box-sizing:border-box}body{margin:0;background:#0c0c0b;color:#f3f0e9;font-family:Outfit}main{padding:42px 50px}header{display:flex;justify-content:space-between;font-size:27px}header span{font-size:13px;letter-spacing:2px;color:#e8d7b3}.layout{display:grid;grid-template-columns:.9fr 1.1fr;gap:45px;align-items:center;margin-top:75px}h1{font-size:65px;font-weight:400;line-height:1;letter-spacing:-2px;margin:0 0 25px}p{font-size:24px;color:#e8d7b3;line-height:1.25}small{font-size:13px;color:#b5b3ad}img{width:100%;border:1px solid #82724d;border-radius:5px}.url{font-size:13px;color:#b5b3ad;margin-top:60px;letter-spacing:1px}</style><main><header>ElevateX<span>SELECTED WORK / CONCEPT PROJECT</span></header><div class="layout"><div><h1>Qadeer<br>Jewellers.</h1><p>A digital experience shaped around elegance and detail.</p><small>Website design showcase · Real interface captures</small></div><img src="data:image/webp;base64,${screenshot}"></div><p class="url">www.elevatexlab.com / work / qadeer-jewellers</p></main></html>`,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode()));
  });
  await page.screenshot({ path: 'public/images/social/qadeer-jewellers.png' });
} finally {
  await browser.close();
}
