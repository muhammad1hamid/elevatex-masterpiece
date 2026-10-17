import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const font = (
  await readFile('public/fonts/outfit-latin-wght-normal.woff2')
).toString('base64');
const art = (await readFile('public/images/about/hero-1200.webp')).toString(
  'base64',
);
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(
    `<!doctype html><html lang="en"><meta charset="utf-8"><style>@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font});font-weight:100 900}*{box-sizing:border-box}body{margin:0;background:#0c0c0b;color:#f3f0e9;font-family:Outfit}main{position:relative;height:630px;padding:42px 50px;overflow:hidden}img{position:absolute;right:0;top:0;height:630px;width:700px;object-fit:cover;object-position:60% 50%}.shade{position:absolute;inset:0;background:linear-gradient(90deg,#0c0c0b 5%,#0c0c0b 31%,rgba(12,12,11,.84) 43%,transparent 70%)}header,p,h1,footer{position:relative}header{font-size:28px}p{margin:98px 0 20px;font-size:12px;letter-spacing:2px;color:#d6be8c}h1{margin:0;font-size:65px;line-height:1.05;letter-spacing:-2px;font-weight:400;width:650px}h1 span{color:#e8d7b3}footer{margin-top:68px;font-size:12px;color:#b5b3ad;letter-spacing:1px}</style><main><img alt="" src="data:image/webp;base64,${art}"><div class="shade"></div><header>ElevateX</header><p>ABOUT / DESIGN · ENGINEERING · AI</p><h1>Built with intention.<br><span>Driven by<br>what’s possible.</span></h1><footer>www.elevatexlab.com / about</footer></main></html>`,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page.screenshot({ path: 'public/images/social/elevatex-about.png' });
} finally {
  await browser.close();
}
