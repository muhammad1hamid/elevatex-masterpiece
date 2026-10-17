import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('source-assets/qadeer', { recursive: true });
await mkdir('public/images/work/qadeer/art', { recursive: true });
const originals = [
  ['hero', '08_35_16 PM-1', 'luxurious_golden_diamond_jewellery_display.png'],
  ['overview', '08_35_25 PM-2', 'golden_diamond_jewellery_showcase.png'],
  ['detail', '08_35_27 PM-3', 'pear_diamond_ring_on_black_marble.png'],
  ['boutique', '08_35_31 PM-4', 'opulent_black_marble_jewellery_boutique.png'],
  [
    'presentation',
    '08_35_34 PM-5',
    'luxury_black_and_gold_jewellery_display.png',
  ],
  ['flatlay', '08_35_38 PM-6', 'luxury_gold_and_diamond_jewellery_set.png'],
];
const artwork = {};
const manifest = [];
for (const [name, time, referenceId] of originals) {
  const source = `C:/Users/sahar/Downloads/ChatGPT Image Oct 14, 2026, ${time}.png`;
  const original = `source-assets/qadeer/${referenceId}`;
  await copyFile(source, original);
  const metadata = await sharp(source).metadata();
  const widths = [640, 1000, 1600].filter((width) => width <= metadata.width);
  const outputs = [];
  for (const width of widths)
    for (const format of ['avif', 'webp']) {
      const file = `public/images/work/qadeer/art/${name}-${width}.${format}`;
      const output = await sharp(source)
        .resize({ width })
        .toFormat(format, { quality: format === 'avif' ? 58 : 84 })
        .toFile(file);
      outputs.push({
        file,
        width: output.width,
        height: output.height,
        bytes: output.size,
      });
    }
  const representative = outputs.find(
    (output) => output.file.endsWith('.webp') && output.width === widths.at(-1),
  );
  artwork[name] = {
    base: `/images/work/qadeer/art/${name}`,
    widths,
    width: representative.width,
    height: representative.height,
    alt: '',
    provenance: 'editorialArtwork',
  };
  manifest.push({
    name,
    referenceId,
    original,
    provenance: 'editorialArtwork',
    outputs,
  });
  if (name === 'hero') {
    const crop = {
      left: Math.round(metadata.width * 0.25),
      top: 0,
      width: Math.round(metadata.width * 0.5),
      height: metadata.height,
    };
    const mobileOutputs = [];
    for (const width of [480, 800])
      for (const format of ['avif', 'webp']) {
        const file = `public/images/work/qadeer/art/hero-mobile-${width}.${format}`;
        const result = await sharp(source)
          .extract(crop)
          .resize({ width })
          .toFormat(format, { quality: format === 'avif' ? 58 : 84 })
          .toFile(file);
        mobileOutputs.push({
          file,
          width: result.width,
          height: result.height,
          bytes: result.size,
        });
      }
    const mobile = mobileOutputs.find(
      (output) => output.width === 800 && output.file.endsWith('.webp'),
    );
    artwork.heroMobile = {
      base: '/images/work/qadeer/art/hero-mobile',
      widths: [480, 800],
      width: mobile.width,
      height: mobile.height,
      alt: '',
      provenance: 'editorialArtwork',
    };
    manifest.push({
      name: 'heroMobile',
      original,
      crop,
      provenance: 'editorialArtwork',
      outputs: mobileOutputs,
    });
  }
}
const sourceScreenshots = JSON.parse(
  await readFile('artifacts/qadeer/source/manifest.json', 'utf8'),
);
const alts = {
  'navigation-detail':
    'Unmodified crop of the actual Qadeer navigation showing Collections, Diamonds and Gold labels.',
  desktop:
    'Qadeer Jewellers actual desktop homepage, with The Art of Legacy headline and collection and showroom links.',
  'large-desktop':
    'Qadeer Jewellers actual homepage captured at 1920 by 1080 pixels.',
  'full-page':
    'Complete Qadeer Jewellers concept homepage, including collections, imagery, discovery journey and showroom enquiry sections.',
  navigation:
    'Actual Qadeer Jewellers desktop navigation with collections, diamonds, gold, bridal, story and contact links.',
  collections:
    'Actual Qadeer Jewellers collection interface showing Gold, Diamonds, Bridal, Rings, Necklaces and Earrings categories.',
  'collection-detail':
    'Actual Gold category page reached through the Qadeer Jewellers collection interface.',
  tablet:
    'Actual Qadeer Jewellers homepage at a 768 pixel tablet width with compact navigation and jewellery imagery.',
  mobile:
    'Actual Qadeer Jewellers homepage at a 390 pixel mobile width, with stacked actions and a bottom Explore, WhatsApp and Visit bar.',
  'mobile-menu':
    'Actual Qadeer Jewellers open mobile menu, with six navigation destinations and a showroom WhatsApp link.',
};
const screenshots = {};
const navigationCrop = { left: 24, top: 0, width: 500, height: 73 };
const detailSource = 'artifacts/qadeer/source/navigation-detail.png';
await sharp('artifacts/qadeer/source/navigation.png')
  .extract(navigationCrop)
  .toFile(detailSource);
const detailOutputs = [];
for (const format of ['avif', 'webp']) {
  const file = `public/images/work/qadeer/navigation-detail-500.${format}`;
  const output = await sharp(detailSource)
    .toFormat(format, { quality: 85 })
    .toFile(file);
  detailOutputs.push({
    file,
    width: output.width,
    height: output.height,
    bytes: output.size,
  });
}
sourceScreenshots.captures = sourceScreenshots.captures.filter(
  (capture) => capture.name !== 'navigation-detail',
);
sourceScreenshots.captures.push({
  name: 'navigation-detail',
  source: detailSource,
  parent: 'navigation',
  crop: navigationCrop,
  width: 500,
  height: 73,
  provenance: 'verifiedScreenshot',
  outputs: detailOutputs,
});
await writeFile(
  'artifacts/qadeer/source/manifest.json',
  `${JSON.stringify(sourceScreenshots, null, 2)}\n`,
);
for (const capture of sourceScreenshots.captures) {
  const output = capture.outputs
    .filter((output) => output.file.endsWith('.webp'))
    .at(-1);
  screenshots[capture.name] = {
    base: `/images/work/qadeer/${capture.name}`,
    widths: [...new Set(capture.outputs.map((output) => output.width))],
    width: output.width,
    height: output.height,
    alt: alts[capture.name],
    provenance: 'verifiedScreenshot',
  };
}
await writeFile(
  'source-assets/qadeer/manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(
  'src/data/qadeer-media.ts',
  `// Generated from retained originals and real browser-capture manifests.\nexport interface ProjectMedia { base: string; widths: readonly number[]; width: number; height: number; alt: string; provenance: 'verifiedScreenshot' | 'editorialArtwork'; }\nexport const qadeerArtwork = ${JSON.stringify(artwork, null, 2)} as const satisfies Record<string, ProjectMedia>;\nexport const qadeerScreenshots = ${JSON.stringify(screenshots, null, 2)} as const satisfies Record<string, ProjectMedia>;\n`,
);
console.log(
  JSON.stringify(
    manifest.map((entry) => ({
      name: entry.name,
      outputs: entry.outputs.map(({ width, bytes, file }) => ({
        width,
        bytes,
        file,
      })),
    })),
  ),
);
