import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Generate a static service preview from code-native browser artwork and the
// project's existing licensed fonts. This file is not loaded by the website.
const root = new URL('../', import.meta.url);
const font = async (name) =>
  (await readFile(new URL(`public/fonts/${name}`, root))).toString('base64');
const [headingFont, bodyFont] = await Promise.all([
  font('outfit-latin-wght-normal.woff2'),
  font('instrument-sans-latin-wght-normal.woff2'),
]);
await mkdir(new URL('public/images/social/', root), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  @font-face{font-family:Outfit;font-weight:400 600;src:url(data:font/woff2;base64,${headingFont}) format('woff2')}
  @font-face{font-family:Instrument;font-weight:400 700;src:url(data:font/woff2;base64,${bodyFont}) format('woff2')}
  *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#0c0c0b;color:#f3f0e9;font-family:Outfit,Arial,sans-serif;overflow:hidden}
  main{position:relative;width:100%;height:100%;padding:50px 64px;background:radial-gradient(ellipse at 90% 70%,#222319,#0c0c0b 65%)}
  .brand{font-size:30px;letter-spacing:-1.6px;margin:0}.rule{height:1px;background:#34352d;margin:27px 0 40px}.eyebrow{font-family:Instrument,Arial,sans-serif;font-size:13px;letter-spacing:3px;color:#e8d7b3;text-transform:uppercase}
  h1{font-size:58px;font-weight:400;letter-spacing:-2.5px;line-height:1.08;margin:25px 0;width:565px}h1 span{display:block;color:#e8d7b3}.copy{font-family:Instrument,Arial,sans-serif;color:#b5b3ad;font-size:19px;line-height:1.5;max-width:460px}
  .browser{position:absolute;right:60px;top:170px;width:445px;background:#11120e;border:1px solid #6d634e;border-radius:10px;overflow:hidden;box-shadow:0 25px 40px #0005}.chrome{padding:12px 17px;background:#1a1c15;border-bottom:1px solid #3c3d32;color:#b5b3ad;font:10px Instrument,Arial,sans-serif;display:flex;justify-content:space-between}.nav{display:flex;justify-content:space-between;padding:23px;font-size:18px}.nav small{font:9px Instrument,Arial,sans-serif;color:#b5b3ad;align-self:center}
  .canvas{display:flex;gap:20px;padding:12px 23px 35px;min-height:236px;align-items:center}.canvas p{font-size:33px;line-height:1.08;letter-spacing:-1.2px;margin:0;flex:1}.planes{position:relative;width:145px;height:196px;background:linear-gradient(130deg,transparent 20%,#5f6053 20% 48%,#b6a989 49%,#24271d 50% 77%,#e8d7b3 78%,#12160e 79%)}
  .tiles{display:flex;gap:12px;padding:0 23px 25px}.tiles i{height:34px;flex:1;border-top:1px solid #6d634e;background:linear-gradient(135deg,#3a3d30,#181c11)}
  .phone{position:absolute;right:31px;top:339px;width:110px;height:233px;padding:22px 12px;background:#13160f;border:1px solid #af9b76;border-radius:14px;box-shadow:0 12px 20px #0007}.phone small{font-size:10px}.phone p{font-size:18px;line-height:1.1;letter-spacing:-.6px;margin:24px 0 14px}.phone i{display:block;height:60px;background:linear-gradient(130deg,#383f2b 30%,#968a68 32%,#171d0f 33%)}
  .bottom{position:absolute;bottom:35px;left:64px;font:13px Instrument,Arial,sans-serif;letter-spacing:.4px;color:#b5b3ad}
  </style></head><body><main><p class="brand">ElevateX</p><div class="rule"></div><p class="eyebrow">Web Development</p><h1>Websites built to<br>look exceptional.<span>And work even better.</span></h1><p class="copy">Considered design. Responsive experiences.<br>Strong technical foundations.</p><div class="browser"><div class="chrome"><span>○ ○ ○</span><span>Website composition</span><span>↗</span></div><div class="nav">ElevateX<small>Overview &nbsp; Work &nbsp; Contact</small></div><div class="canvas"><p>A clear story.<br>A better experience.</p><div class="planes"></div></div><div class="tiles"><i></i><i></i><i></i></div></div><div class="phone"><small>ElevateX</small><p>A clear story.<br>A better experience.</p><i></i></div><p class="bottom">www.elevatexlab.com / services / web-development</p></main></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const output = fileURLToPath(
    new URL('public/images/social/web-development.png', root),
  );
  await page.screenshot({ path: output });
  console.log(`Service social preview saved: ${output}`);
} finally {
  await browser.close();
}
