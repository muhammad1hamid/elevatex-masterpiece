// Reusable, offline raster preparation. The input manifest owns provenance;
// optimized outputs are copied into one content entry, with no new component.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';
const inputPath = process.argv[2];
if (!inputPath) throw new Error('Supply a case-study media manifest JSON.');
const input = JSON.parse(await readFile(inputPath, 'utf8'));
if (!/^[a-z0-9-]+$/.test(input.slug)) throw new Error('Invalid media slug.');
const media = {},
  outputs = [];
for (const item of input.images) {
  if (!/^[a-z0-9-]+$/.test(item.key)) throw new Error('Invalid media key.');
  if (
    ![
      'AUTHENTIC_SCREENSHOT',
      'VERIFIED_BRAND_PHOTOGRAPHY',
      'ILLUSTRATIVE_EDITORIAL_ART',
      'CONCEPT_VISUAL',
    ].includes(item.category)
  )
    throw new Error('Media category is required.');
  const metadata = await sharp(item.source).metadata();
  const widths = (item.widths ?? [480, 800, metadata.width])
    .filter(
      (width, index, array) =>
        width <= metadata.width && array.indexOf(width) === index,
    )
    .sort((a, b) => a - b);
  const base = `/images/work/${input.slug}/${item.key}`;
  await mkdir(`public/images/work/${input.slug}`, { recursive: true });
  let largest;
  for (const width of widths)
    for (const format of ['avif', 'webp']) {
      const file = `public${base}-${width}.${format}`;
      const result = await sharp(item.source)
        .resize({ width })
        .toFormat(format, { quality: format === 'avif' ? 58 : 84 })
        .toFile(file);
      outputs.push({
        key: item.key,
        source: item.source,
        file,
        width: result.width,
        height: result.height,
        bytes: result.size,
        category: item.category,
      });
      if (width === widths.at(-1)) largest = result;
    }
  media[item.key] = {
    base,
    widths,
    width: largest.width,
    height: largest.height,
    category: item.category,
    alt: item.alt ?? '',
    caption: item.caption,
    credit: item.credit,
    ...(item.category === 'AUTHENTIC_SCREENSHOT'
      ? { sourceUrl: input.liveUrl, capturedAt: input.capturedAt }
      : {}),
    ...(item.focalPoint ? { focalPoint: item.focalPoint } : {}),
    ...(item.aspectRatio ? { aspectRatio: item.aspectRatio } : {}),
    ...(item.fit ? { fit: item.fit } : {}),
    ...(item.position ? { position: item.position } : {}),
    ...(item.permissionConfirmed === true ? { permissionConfirmed: true } : {}),
  };
}
const output = `${dirname(inputPath)}/media.generated.json`;
await writeFile(output, `${JSON.stringify({ media, outputs }, null, 2)}\n`);
console.log(
  JSON.stringify({ output, assets: outputs.length, media: Object.keys(media) }),
);
