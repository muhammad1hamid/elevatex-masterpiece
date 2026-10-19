import { site } from '../src/data/site.ts';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const font = (
  await readFile('public/fonts/outfit-latin-wght-normal.woff2')
).toString('base64');
const images = await Promise.all(
  ['qadeer-jewellers', 'infinity-salon', 'apex-detailing'].map(async (id) =>
    (await readFile(`public/images/work/${id}-800.webp`)).toString('base64'),
  ),
);
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(
    `<!doctype html><html><meta charset="utf-8"><style>@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font});font-weight:400}*{box-sizing:border-box}body{margin:0;background:#0c0c0b;color:#f3f0e9;font-family:Outfit}main{padding:35px 45px}header{display:flex;justify-content:space-between;font-size:25px}header span{font-size:13px;letter-spacing:3px;color:#e8d7b3}h1{font-size:64px;font-weight:400;margin:25px 0;text-align:center;letter-spacing:-2px}h1 span{color:#e8d7b3}.gallery{display:flex;gap:20px;align-items:center;margin-top:35px}.gallery img{width:calc((100% - 40px)/3);border:1px solid #82724d;border-radius:6px}.gallery img:first-child{transform:rotate(-3deg)}.gallery img:last-child{transform:rotate(3deg)}p{text-align:center;color:#b5b3ad;font-size:15px;margin-top:35px}</style><main><header>ElevateX<span>SELECTED WORK</span></header><h1>Work that speaks <span>for itself.</span></h1><div class="gallery">${images.map((data) => `<img src="data:image/webp;base64,${data}">`).join('')}</div><p>Website concepts · Real project previews · ${new URL(site.origin).hostname}/work</p></main></html>`,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode()));
  });
  await page.screenshot({ path: 'public/images/social/work.png' });
} finally {
  await browser.close();
}
