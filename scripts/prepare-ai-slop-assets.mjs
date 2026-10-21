import sharp from 'sharp';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
const input = process.argv.slice(2);
if (input.length !== 4)
  throw new Error(
    'Supply four enhanced source PNG paths: cover, discovery, workflow, verification.',
  );
const bases = [
  'ai-slop-wide',
  'ai-slop-discovery',
  'ai-slop-workflow',
  'ai-slop-verification',
];
await mkdir('public/images/insights', { recursive: true });
await mkdir('artifacts/seo-phase1/enhanced', { recursive: true });
const media = [];
for (const [i, src] of input.entries()) {
  await copyFile(src, `artifacts/seo-phase1/enhanced/${bases[i]}.png`);
  const original = await sharp(src).metadata();
  const images = [];
  for (const width of [480, 720, 768, 1200])
    for (const format of ['webp', 'avif']) {
      const file = `/images/insights/${bases[i]}-${width}.${format}`;
      const p = sharp(src).resize({ width, withoutEnlargement: true });
      const info = await (
        format === 'webp'
          ? p.webp({ quality: 83, effort: 5 })
          : p.avif({ quality: 52, effort: 5 })
      ).toFile('public' + file);
      images.push({
        src: file,
        width: info.width,
        height: info.height,
        bytes: info.size,
      });
    }
  media.push({
    base: bases[i],
    original: { width: original.width, height: original.height },
    images,
  });
}
await sharp(input[0])
  .resize(1200, 630, { fit: 'cover' })
  .webp({ quality: 86 })
  .toFile('public/images/insights/ai-slop-social.webp');
await writeFile(
  'public/images/insights/ai-slop-media.json',
  JSON.stringify(media, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    media.map((x) => ({
      base: x.base,
      original: x.original,
      cover: x.images.find((i) => i.src.endsWith('1200.webp')),
    })),
  ),
);
