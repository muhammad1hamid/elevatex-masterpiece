import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { chromium } from '@playwright/test';
const file = process.argv[2];
if (!file?.startsWith('src/content/case-studies/'))
  throw new Error('Supply a case-study content file.');
const project = parse((await readFile(file, 'utf8')).split('---')[1]),
  study = project.projectStudy;
const section = study.sections.find((s) => s.type === 'website-showcase');
const media = study.media[section.image.media];
if (media.category !== 'AUTHENTIC_SCREENSHOT')
  throw new Error('Social previews require authentic screenshots.');
const escape = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const font = (
  await readFile('public/fonts/outfit-latin-wght-normal.woff2')
).toString('base64');
const width = media.widths.find((w) => w >= 1000) ?? media.widths.at(-1),
  screen = (await readFile(`public${media.base}-${width}.webp`)).toString(
    'base64',
  );
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(
    `<!doctype html><html lang="en"><meta charset="utf-8"><style>@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font});font-weight:400}*{box-sizing:border-box}body{margin:0;background:#0c0c0b;color:#f3f0e9;font-family:Outfit}main{padding:42px 50px}header{display:flex;justify-content:space-between;border-bottom:1px solid #41413b;padding-bottom:24px;font-size:28px}header span{font-size:12px;letter-spacing:2px;color:#c9cacb}.layout{display:grid;grid-template-columns:.9fr 1.2fr;gap:40px;align-items:center;margin-top:60px}h1{font-size:63px;font-weight:400;line-height:1.04;letter-spacing:-2px;margin:0 0 24px}p{font-size:25px;color:#c9cacb;line-height:1.25;margin:0 0 20px}small{font-size:13px;color:#b5b3ad}img{width:100%;border:1px solid #6b6d65;border-radius:3px}.url{font-size:12px;color:#b5b3ad;margin-top:50px;letter-spacing:1px}</style><main><header>ElevateX<span>SELECTED WORK / ${escape(project.showcase.projectType.toUpperCase())} PROJECT</span></header><div class="layout"><div><h1>${escape(study.displayName ?? project.title)}.</h1><p>${escape(study.hero.statement.join(' '))}</p><small>Website design study · Authentic interface captures</small></div><img src="data:image/webp;base64,${screen}" alt="Actual project website capture"></div><p class="url">www.elevatexlab.com / work / ${escape(study.slug ?? file.split('/').at(-1).replace('.md', ''))}</p></main></html>`,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode()));
  });
  await page.screenshot({ path: `public${study.socialImage.src}` });
} finally {
  await browser.close();
}
