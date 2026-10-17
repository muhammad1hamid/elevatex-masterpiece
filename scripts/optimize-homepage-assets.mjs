import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Retain the approved full-size WebP artwork. These derivatives only change
// delivery size/format; composition, aspect ratios and image contents stay fixed.
const processDirectory = new URL('../public/images/process/', import.meta.url);
const manifest = { process: [], smoke: {} };
for (const stage of ['discover', 'strategize', 'design', 'develop', 'launch']) {
  const base = `process-${stage}`;
  const source = fileURLToPath(new URL(`${base}.webp`, processDirectory));
  const metadata = await sharp(source).metadata();
  const outputs = [];
  for (const width of [620, metadata.width]) {
    for (const format of width === 620 ? ['avif', 'webp'] : ['avif']) {
      const filename = `${base}-${width}.${format}`;
      let pipeline = sharp(source).resize({ width, withoutEnlargement: true });
      pipeline =
        format === 'avif'
          ? pipeline.avif({
              quality: 60,
              effort: 6,
              chromaSubsampling: '4:4:4',
            })
          : pipeline.webp({ quality: 84, effort: 6 });
      const info = await pipeline.toFile(
        fileURLToPath(new URL(filename, processDirectory)),
      );
      outputs.push({
        filename,
        width: info.width,
        height: info.height,
        bytes: info.size,
      });
    }
  }
  manifest.process.push({ source: `${base}.webp`, outputs });
}

const heroDirectory = new URL('../docs/hero-assets/', import.meta.url);
const heroManifest = JSON.parse(
  await readFile(new URL('manifest.json', heroDirectory), 'utf8'),
);
const smoke = heroManifest.assets.find((asset) => asset.name === 'smoke');
const info = await sharp(
  fileURLToPath(new URL('smoke-source.png', heroDirectory)),
)
  .extract(smoke.crop)
  .resize({ width: 576 })
  .webp({ quality: 64, alphaQuality: 95, effort: 6 })
  .toFile(
    fileURLToPath(
      new URL('../public/images/hero/smoke-medium.webp', import.meta.url),
    ),
  );
manifest.smoke = {
  filename: 'smoke-medium.webp',
  width: info.width,
  height: info.height,
  bytes: info.size,
};
await writeFile(
  new URL('../docs/homepage-asset-manifest.json', import.meta.url),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify(manifest, null, 2));
