import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Generated source art is retained outside public/. Only these compressed,
// independent layers are shipped; the reference screenshot is never used.
const sourceDirectory = new URL('../docs/hero-assets/', import.meta.url);
const outputDirectory = new URL('../public/images/hero/', import.meta.url);
const manifest = { generated: '2026-10-07', assets: [] };

await mkdir(outputDirectory, { recursive: true });

async function alphaBounds(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  let transparentPixels = 0;
  let translucentPixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha =
        data[(y * info.width + x) * info.channels + info.channels - 1];
      if (alpha === 0) transparentPixels += 1;
      if (alpha > 0 && alpha < 255) translucentPixels += 1;
      if (alpha > 1) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < 0 || transparentPixels === 0) {
    throw new Error(`Expected a nonempty transparent image: ${input}`);
  }

  const padding = 4;
  const cropLeft = Math.max(0, left - padding);
  const cropTop = Math.max(0, top - padding);
  return {
    original: { width: info.width, height: info.height },
    visibleBounds: {
      left,
      top,
      width: right - left + 1,
      height: bottom - top + 1,
    },
    crop: {
      left: cropLeft,
      top: cropTop,
      width: Math.min(info.width - 1, right + padding) - cropLeft + 1,
      height: Math.min(info.height - 1, bottom + padding) - cropTop + 1,
    },
    transparentPixels,
    translucentPixels,
  };
}

const specs = [
  { name: 'laptop', widths: [640, 1200], avifQuality: 65, webpQuality: 88 },
  {
    name: 'pedestal',
    widths: [800, 1600],
    aspectRatio: 6.65,
    avifQuality: 60,
    webpQuality: 84,
  },
  { name: 'smoke', widths: [384, 768], webpQuality: 64 },
  {
    name: 'floor',
    widths: [800, 1600],
    avifQuality: 42,
    webpQuality: 60,
    crop: { left: 0, top: 120, width: 2172, height: 420 },
  },
];

for (const spec of specs) {
  const sourcePath = fileURLToPath(
    new URL(`${spec.name}-source.png`, sourceDirectory),
  );
  const metadata = await sharp(sourcePath).metadata();
  const bounds = spec.crop
    ? {
        original: { width: metadata.width, height: metadata.height },
        crop: spec.crop,
        transparency: 'opaque floor surface',
      }
    : await alphaBounds(sourcePath);
  const asset = { name: spec.name, ...bounds, outputs: [] };

  for (const width of spec.widths) {
    const formats = spec.name === 'smoke' ? ['webp'] : ['avif', 'webp'];
    for (const format of formats) {
      const filename =
        spec.name === 'smoke'
          ? width === 384
            ? 'smoke-small.webp'
            : 'smoke.webp'
          : `hero-${spec.name}-${width}.${format}`;
      const outputPath = fileURLToPath(new URL(filename, outputDirectory));
      // Export the pedestal at its approved composition ratio instead of
      // stretching it at runtime; retain the untouched generated source above.
      let pipeline = sharp(sourcePath)
        .extract(bounds.crop)
        .resize({
          width,
          ...(spec.aspectRatio
            ? { height: Math.round(width / spec.aspectRatio), fit: 'fill' }
            : {}),
        });
      pipeline =
        format === 'avif'
          ? pipeline.avif({
              quality: spec.avifQuality,
              effort: 7,
              chromaSubsampling: '4:4:4',
            })
          : pipeline.webp({
              quality: spec.webpQuality,
              alphaQuality: 95,
              effort: 6,
            });
      const result = await pipeline.toFile(outputPath);
      const bytes = (await stat(outputPath)).size;
      asset.outputs.push({
        filename,
        width: result.width,
        height: result.height,
        bytes,
      });
      console.log(
        `${filename}: ${result.width}x${result.height}, ${(bytes / 1024).toFixed(1)} KiB`,
      );
    }
  }
  manifest.assets.push(asset);
}

await writeFile(
  new URL('manifest.json', sourceDirectory),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
