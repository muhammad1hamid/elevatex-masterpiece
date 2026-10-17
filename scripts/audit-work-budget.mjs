import { readFile, stat, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const html = await readFile('dist/work/index.html', 'utf8');
const scripts = [
  ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
].filter((match) => !match[1].includes('application/ld+json'));
const inlineJS = scripts.map((match) => match[2]).join('\n');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map((match) => match[1])
  .join('\n');
const externalScripts = scripts
  .filter((match) => /\bsrc=/.test(match[1]))
  .map((match) => match[1]);
const bytes = async (file) => (await stat(`public/images/work/${file}`)).size;
const budget = {
  html: { bytes: Buffer.byteLength(html), gzip: gzipSync(html).length },
  inlineJS: {
    bytes: Buffer.byteLength(inlineJS),
    gzip: gzipSync(inlineJS).length,
  },
  inlineCSS: { bytes: Buffer.byteLength(css), gzip: gzipSync(css).length },
  externalScripts,
  heroRaster: {
    desktopAvif800:
      (await bytes('qadeer-jewellers-800.avif')) +
      (await bytes('infinity-salon-800.avif')) +
      (await bytes('apex-detailing-800.avif')) +
      (await bytes('atmosphere/hero-1280.avif')),
    mobileAvif800:
      (await bytes('qadeer-jewellers-800.avif')) +
      (await bytes('atmosphere/hero-640.avif')),
  },
  note: 'Raster budgets describe selected variants, not measured total page network transfer. Browser srcset choice varies by viewport and DPR.',
};
await writeFile(
  'artifacts/work/budget.json',
  `${JSON.stringify(budget, null, 2)}\n`,
);
console.log(JSON.stringify(budget));
