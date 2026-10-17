import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
await mkdir('source-assets/infinity', { recursive: true });
await mkdir('public/images/work/infinity/art', { recursive: true });
const originals = [
  ['hero', '12_35_23 PM-1', 'glamorous_salon_vanity_portrait.png'],
  ['interior', '12_35_25 PM-2', 'luxury_golden_salon_interior.png'],
  ['detail', '12_35_28 PM-3', 'golden_glow_glamour_portrait.png'],
  ['hair', '12_35_30 PM-4', 'glamorous_golden_hour_salon_portrait.png'],
  ['tools', '12_35_32 PM-5', 'luxury_salon_vanity_still_life.png'],
  ['editorial', '12_35_35 PM-6', 'glamorous_salon_editorial_portrait.png'],
];
const artwork = {},
  manifest = [];
for (const [name, time, referenceId] of originals) {
  const source = `C:/Users/sahar/Downloads/ChatGPT Image Oct 15, 2026, ${time}.png`;
  const original = `source-assets/infinity/${referenceId}`;
  await copyFile(source, original);
  const meta = await sharp(source).metadata();
  const widths = [480, 800, 1122].filter((w) => w <= meta.width);
  const outputs = [];
  for (const width of widths)
    for (const format of ['avif', 'webp']) {
      const file = `public/images/work/infinity/art/${name}-${width}.${format}`;
      const result = await sharp(source)
        .resize({ width })
        .toFormat(format, { quality: format === 'avif' ? 58 : 84 })
        .toFile(file);
      outputs.push({
        file,
        width: result.width,
        height: result.height,
        bytes: result.size,
      });
    }
  artwork[name] = {
    base: `/images/work/infinity/art/${name}`,
    widths,
    width: meta.width,
    height: meta.height,
    alt: '',
    provenance: 'editorialArtwork',
  };
  manifest.push({
    name,
    referenceId,
    original,
    width: meta.width,
    height: meta.height,
    provenance: 'editorialArtwork',
    outputs,
  });
}
const sources = JSON.parse(
  await readFile('artifacts/infinity/source/manifest.json', 'utf8'),
);
const crop = { left: 100, top: 145, width: 650, height: 555 };
const cropSource = 'artifacts/infinity/source/interface-detail.png';
await sharp('artifacts/infinity/source/desktop.png')
  .extract(crop)
  .toFile(cropSource);
const outputs = [];
for (const format of ['avif', 'webp']) {
  const file = `public/images/work/infinity/interface-detail-650.${format}`;
  const result = await sharp(cropSource)
    .toFormat(format, { quality: 85 })
    .toFile(file);
  outputs.push({
    file,
    width: result.width,
    height: result.height,
    bytes: result.size,
  });
}
sources.captures = sources.captures.filter(
  (c) => c.name !== 'interface-detail',
);
sources.captures.push({
  name: 'interface-detail',
  source: cropSource,
  parent: 'desktop',
  crop,
  width: 650,
  height: 555,
  provenance: 'verifiedScreenshot',
  outputs,
});
const alts = {
  desktop:
    'Infinity Salon concept homepage at 1440 pixels, showing the serif Luxury Hair, Beauty, Confidence headline and appointment and call actions.',
  navigation:
    'Actual Infinity Salon desktop navigation with Home, About, Services, Gallery, Experts, Reviews, Contact and Book Now links.',
  'full-page':
    'Complete Infinity Salon concept homepage with service descriptions, gallery, appointment enquiry interface and contact section. Demo claims are not verified business results.',
  services:
    'Actual Infinity Salon services section with hair, skincare, makeup and nail treatment descriptions in a four-column desktop layout.',
  about:
    'Actual Infinity Salon about section with interior photography and the heading Where craft, calm and confidence meet.',
  contact:
    'Actual Infinity Salon contact interface with directions, WhatsApp and call links. Business details shown belong to the demo.',
  appointment:
    'Actual Infinity Salon appointment enquiry interface with service, date, time and contact fields; no enquiry has been submitted.',
  'gallery-open':
    'Actual Infinity Salon gallery image opened after selecting Precision Hair Cutting.',
  'large-desktop':
    'Actual Infinity Salon homepage captured at 1920 by 1080 pixels.',
  tablet:
    'Actual Infinity Salon homepage at a 768 pixel tablet width with compact navigation.',
  mobile:
    'Actual Infinity Salon homepage at a 390 pixel mobile width with a stacked headline and appointment and call actions.',
  'mobile-menu':
    'Actual Infinity Salon mobile menu opened, showing seven navigation destinations and an appointment link.',
  'interface-detail':
    'Unmodified crop of the real Infinity Salon hero showing serif typography, champagne italic emphasis and appointment and call actions.',
};
const screenshots = {};
for (const capture of sources.captures) {
  const output = capture.outputs.filter((o) => o.file.endsWith('.webp')).at(-1);
  if (!alts[capture.name]) throw new Error(`Missing alt: ${capture.name}`);
  screenshots[capture.name] = {
    base: `/images/work/infinity/${capture.name}`,
    widths: [...new Set(capture.outputs.map((o) => o.width))],
    width: output.width,
    height: output.height,
    alt: alts[capture.name],
    provenance: 'verifiedScreenshot',
  };
}
await writeFile(
  'artifacts/infinity/source/manifest.json',
  `${JSON.stringify(sources, null, 2)}\n`,
);
await writeFile(
  'source-assets/infinity/manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(
  'src/data/infinity-media.ts',
  `// Generated from retained supplied originals and dated, real browser captures.\nimport type { ProjectMedia } from './qadeer-media';\nexport const infinityArtwork = ${JSON.stringify(artwork, null, 2)} as const satisfies Record<string, ProjectMedia>;\nexport const infinityScreenshots = ${JSON.stringify(screenshots, null, 2)} as const satisfies Record<string, ProjectMedia>;\n`,
);
console.log(
  JSON.stringify({
    artwork: manifest.map(({ name, width, height }) => ({
      name,
      width,
      height,
    })),
    screenshots: Object.keys(screenshots),
  }),
);
