import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
await mkdir('source-assets/apex', { recursive: true });
const artworks = [
  [
    'hero',
    '02_09_07 PM-1',
    'midnight_911_in_a_luxury_studio.png',
    'Illustrative Art Direction / Supplied automotive study.',
  ],
  [
    'studio',
    '02_09_11 PM-2',
    'luxury_black_car_detailing_studio.png',
    'Illustrative Art Direction / Imagined detailing studio.',
  ],
  [
    'macro',
    '02_09_13 PM-3',
    'glossy_black_coupe_in_led_studio.png',
    'Illustrative Art Direction / Surface, water and reflection study.',
  ],
  [
    'cockpit',
    '02_09_16 PM-4',
    'luxury_sports_car_cockpit_in_warm_studio_light.png',
    'Illustrative Art Direction / Interior materials study.',
  ],
  [
    'polishing',
    '02_09_19 PM-5',
    'polishing_a_glossy_black_sports_car.png',
    'Illustrative Art Direction / Polishing study; the depicted person is not identified as studio staff.',
  ],
  [
    'closing',
    '02_09_22 PM-6',
    'glossy_black_sports_car_in_a_luxury_garage.png',
    'Illustrative Art Direction / Closing rear-angle study.',
  ],
];
const images = [];
for (const [key, time, referenceId, caption] of artworks) {
  const source = `source-assets/apex/${referenceId}`;
  await copyFile(
    `C:/Users/sahar/Downloads/ChatGPT Image Oct 15, 2026, ${time}.png`,
    source,
  );
  const meta = await sharp(source).metadata();
  images.push({
    key,
    source,
    referenceId,
    widths: [480, 800, meta.width],
    category: 'ILLUSTRATIVE_EDITORIAL_ART',
    alt: '',
    caption,
    credit:
      'Supplied generated editorial artwork; no studio, vehicle manufacturer or employee affiliation is implied.',
  });
}
const manifest = JSON.parse(
  await readFile('artifacts/apex/source/manifest.json', 'utf8'),
);
const alts = {
  desktop:
    'Actual Classic Detailers concept homepage, with Protect Your Investment, Restore The Shine and Drive With Confidence headings and quote and transformation actions.',
  'large-desktop':
    'Actual Classic Detailers concept homepage at 1920 by 1080 pixels.',
  'full-page':
    'Complete Classic Detailers concept homepage with service, process, gallery and quote sections. Demo business claims are unverified.',
  mobile:
    'Actual Classic Detailers mobile homepage at 390 pixels, with compact navigation and stacked quote and transformation actions.',
  tablet: 'Actual Classic Detailers tablet homepage at 768 pixels.',
  'mobile-menu':
    'Actual Classic Detailers open mobile menu with services, transformations, process, showroom, quote and contact destinations.',
  services:
    'Actual Classic Detailers service section presenting ceramic coating, paint protection film, paint correction and interior services.',
  quote:
    'Actual Classic Detailers quote interface at the vehicle selection step.',
  'quote-service':
    'Actual Classic Detailers quote interface after selecting Sedan, showing service choices.',
  'quote-summary':
    'Actual Classic Detailers quote interface at its final step; no contact information was sent.',
  'process-grid':
    'Actual Classic Detailers six-stage process after selecting the grid layout.',
  'showroom-filter':
    'Actual Classic Detailers showroom after selecting the PPF filter.',
  contact:
    'Actual Classic Detailers demo contact interface; business information shown has not been independently verified.',
};
for (const name of [...new Set(manifest.captures.map((c) => c.name))]) {
  const source = `artifacts/apex/source/${name}.png`,
    meta = await sharp(source).metadata();
  const fullWidth = Math.min(
    800,
    Math.floor((16000 * meta.width) / meta.height),
  );
  images.push({
    key: name,
    source,
    widths:
      name === 'full-page'
        ? [fullWidth]
        : meta.width <= 800
          ? [meta.width]
          : [640, 1000, meta.width],
    category: 'AUTHENTIC_SCREENSHOT',
    alt: alts[name],
    caption: `Actual website capture / ${name.replaceAll('-', ' ')} · 15 October 2026.`,
    credit: 'Public Classic Detailers demo captured in Chrome.',
  });
}
// A faithful crop makes the real serif navigation/hero treatment readable.
const source = 'artifacts/apex/source/interface-detail.png',
  crop = { left: 180, top: 225, width: 1080, height: 475 };
await sharp('artifacts/apex/source/desktop.png').extract(crop).toFile(source);
images.push({
  key: 'interface-detail',
  source,
  widths: [640, 1080],
  category: 'AUTHENTIC_SCREENSHOT',
  alt: 'Unmodified crop of the real Classic Detailers hero showing its Cinzel serif headline, supporting copy and quote actions.',
  caption:
    'Actual website capture / Unmodified hero typography and action crop.',
  credit: 'Crop from the retained 1440 by 900 browser capture.',
});
manifest.crops = [
  {
    name: 'interface-detail',
    parent: 'desktop',
    crop,
    provenance: 'AUTHENTIC_SCREENSHOT',
  },
];
await writeFile(
  'artifacts/apex/source/manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(
  'source-assets/apex/media-input.json',
  `${JSON.stringify({ slug: 'apex', liveUrl: manifest.url, capturedAt: manifest.capturedAt, images }, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    artwork: images.slice(0, 6).map(({ key, source }) => ({ key, source })),
    captures: images.length - 6,
  }),
);
