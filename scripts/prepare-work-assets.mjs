import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const sources = [
  ['hero', '10_14_36 AM-1'],
  ['gallery', '10_14_38 AM-2'],
  ['jewellery', '10_14_40 AM-3'],
  ['beauty', '10_14_42 AM-4'],
  ['automotive', '10_14_44 AM-5'],
  ['events', '10_14_45 AM-6'],
];
await mkdir('source-assets/work', { recursive: true });
await mkdir('public/images/work/atmosphere', { recursive: true });
const records = [];
for (const [name, time] of sources) {
  const source = `C:/Users/sahar/Downloads/ChatGPT Image Oct 14, 2026, ${time}.png`;
  const original = `source-assets/work/${name}-reference.png`;
  await copyFile(source, original);
  const { width, height } = await sharp(source).metadata();
  // User-authorized environmental crops exclude every fictional browser interface.
  const crop = ['hero', 'gallery'].includes(name)
    ? {
        left: 0,
        top: Math.floor(height * 0.86),
        width,
        height: height - Math.floor(height * 0.86),
      }
    : { left: 0, top: 0, width: Math.floor(width * 0.09), height };
  const outputs = [];
  const widths = ['hero', 'gallery'].includes(name) ? [640, 1280] : [160];
  for (const size of widths)
    for (const format of ['avif', 'webp']) {
      const file = `public/images/work/atmosphere/${name}-${size}.${format}`;
      const output = await sharp(source)
        .extract(crop)
        .resize({ width: size })
        .toFormat(format, { quality: format === 'avif' ? 48 : 75 })
        .toFile(file);
      outputs.push({
        file,
        width: output.width,
        height: output.height,
        bytes: output.size,
      });
    }
  records.push({
    name,
    provenance: 'editorialArtwork',
    original,
    crop,
    outputs,
  });
}
await writeFile(
  'source-assets/work/manifest.json',
  `${JSON.stringify(records, null, 2)}\n`,
);
console.log(
  JSON.stringify(records.map(({ name, outputs }) => ({ name, outputs }))),
);
