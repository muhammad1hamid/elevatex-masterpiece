// One-time, local migration of approved rendered content. No page HTML is
// accepted as executable content by the new engine: only typed text and media.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parse, stringify } from 'yaml';
import { chromium } from '@playwright/test';
await mkdir('artifacts/case-study-engine/retained-source', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [id, prefix, presentation, theme] of [
    ['qadeer-jewellers', 'qd', 'campaign', 'jewellery'],
    ['infinity-salon', 'inf', 'editorial', 'beauty'],
  ]) {
    const file = `src/content/case-studies/${id}.md`,
      original = await readFile(file, 'utf8');
    const data = parse(original.split('---')[1]);
    if (data.projectStudy.version === 1) {
      console.log(`Already migrated: ${id}`);
      continue;
    }
    await writeFile(
      `artifacts/case-study-engine/retained-source/${id}.md`,
      original,
    );
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await page.goto(`http://127.0.0.1:4321/work/${id}/`);
    await page.evaluate(() => document.fonts.ready);
    const extracted = await page.evaluate(
      ({ prefix, liveUrl, date }) => {
        const root = document.querySelector(`.${prefix}-study`),
          sections = [...root.querySelectorAll(':scope > section')],
          media = {};
        const clean = (el) => {
          if (!el) return '';
          const copy = el.cloneNode(true);
          copy.querySelectorAll('.sr-only').forEach((e) => e.remove());
          return copy.textContent.replace(/\s+/g, ' ').trim();
        };
        const lines = (el) =>
          el.innerText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        const rendition = (image, source = false) => {
          const src = source
            ? image.getAttribute('srcset').split(',')[0].trim().split(' ')[0]
            : image.getAttribute('src');
          const base = src.replace(/-\d+\.(?:avif|webp)$/, '');
          const set = image.getAttribute('srcset');
          return {
            base,
            widths: [
              ...new Set(
                [...set.matchAll(/\s(\d+)w/g)].map((m) => Number(m[1])),
              ),
            ],
            width: Number(image.getAttribute('width')),
            height: Number(image.getAttribute('height')),
          };
        };
        const placement = (figure) => {
          if (!figure) return undefined;
          const image = figure.querySelector('img'),
            asset = rendition(image),
            key = asset.base
              .replace('/images/work/', '')
              .split('/')
              .slice(1)
              .join('-');
          const caption = clean(figure.querySelector('figcaption'));
          if (!media[key]) {
            const isArt = figure.dataset.mediaProvenance === 'editorialArtwork';
            media[key] = {
              ...asset,
              category: isArt
                ? 'ILLUSTRATIVE_EDITORIAL_ART'
                : 'AUTHENTIC_SCREENSHOT',
              alt: image.alt,
              caption:
                caption || (isArt ? 'Illustrative Art Direction' : image.alt),
              credit: isArt
                ? 'Supplied generated editorial artwork'
                : 'Public demo captured in Chrome',
              ...(!isArt ? { sourceUrl: liveUrl, capturedAt: date } : {}),
            };
            const mobile = figure.querySelector(
              'source[media][type="image/webp"]',
            );
            if (mobile) media[key].mobile = rendition(mobile, true);
          }
          return {
            media: key,
            ...(caption ? { caption } : {}),
            showCaption: Boolean(caption),
            sizes: image.getAttribute('sizes') ?? '90vw',
            browser: Boolean(figure.querySelector('.qd-frame')),
          };
        };
        const intro = (section) => ({
          id: section.id,
          eyebrow: clean(
            section.querySelector(`.${prefix}-intro > .${prefix}-kicker`),
          ),
          heading: {
            id: section.querySelector('h2').id,
            lines: lines(section.querySelector('h2')),
          },
          intro: clean(
            section.querySelector(
              `.${prefix}-intro > p:not(.${prefix}-kicker)`,
            ),
          ),
        });
        const notes = (selector) =>
          [...root.querySelectorAll(selector)].map((el) => ({
            title: clean(el.querySelector('h3')),
            text: clean(el.querySelector('p')),
          }));
        const heroSection = sections[0],
          portrait = prefix === 'inf';
        const hero = {
          id: heroSection.id,
          titleId: heroSection.querySelector('h1').id,
          variant: portrait ? 'portrait-arch' : 'immersive-photo',
          eyebrow: clean(heroSection.querySelector(`.${prefix}-kicker`)),
          statement: lines(
            heroSection.querySelector(`.${prefix}-hero__statement`),
          ),
          description: clean(heroSection.querySelector(`.${prefix}-lead`)),
          image: placement(heroSection.querySelector('figure')),
          classificationSuffix: portrait
            ? 'Beauty & digital experience'
            : 'Web Development',
          classificationSeparator: portrait ? 'dot' : 'slash',
          ...(!portrait
            ? { artLabel: clean(heroSection.querySelector('.qd-art-label')) }
            : {
                margins: {
                  start: [
                    ...heroSection.querySelectorAll(
                      '.inf-hero__margin:not(.inf-hero__margin--end) > span',
                    ),
                  ].map(clean),
                  end: [
                    clean(
                      heroSection.querySelector(
                        '.inf-hero__margin--end > span',
                      ),
                    ),
                    'A website concept',
                    'by ElevateX.',
                  ],
                },
                indexLink: {
                  label: clean(
                    heroSection.querySelector('.inf-hero__index'),
                  ).replace(/\s*↓$/, ''),
                  href: '#website-showcase',
                },
              }),
        };
        const overview = sections[1],
          facts = [...overview.querySelectorAll('dl > div')].map(
            (el, index) => {
              const label = clean(el.querySelector('dt')),
                dd = el.querySelector('dd'),
                link = dd.querySelector('a');
              const source =
                index === 0
                  ? 'project'
                  : index === 1
                    ? portrait
                      ? 'text'
                      : 'industry'
                    : index === 2
                      ? 'classification'
                      : index === 3
                        ? 'services'
                        : 'live';
              return {
                label,
                source,
                ...(source === 'text' ||
                source === 'services' ||
                source === 'live'
                  ? { text: clean(dd) }
                  : {}),
                ...(source === 'services'
                  ? { href: link.getAttribute('href') }
                  : {}),
              };
            },
          );
        const overviewData = {
          ...intro(overview),
          type: 'overview',
          variant: portrait ? 'interior-split' : 'panorama',
          facts,
          image: placement(overview.querySelector('figure')),
        };
        if (portrait) {
          const side = overview.querySelector('.inf-interior__copy');
          overviewData.atmosphere = {
            eyebrow: clean(side.querySelector('.inf-kicker')),
            headingLines: lines(side.querySelector('h3')),
            text: clean(
              side.querySelector('p:not(.inf-kicker):not(.inf-small)'),
            ),
            disclaimer: clean(side.querySelector('.inf-small')),
            linkLabel: clean(side.querySelector('a')).replace(/\s*↗$/, ''),
          };
        } else
          overviewData.evidenceNote = clean(
            overview.querySelector('.qd-evidence-note'),
          );
        const website = sections[2],
          viewer = website.querySelector('details');
        const websiteData = {
          ...intro(website),
          type: 'website-showcase',
          variant: portrait ? 'immersive-browser' : 'contained-browser',
          image: placement(website.querySelector('figure')),
          viewer: {
            image: placement(viewer.querySelector('figure')),
            summary: clean(viewer.querySelector('summary')).replace(
              /\s*\+$/,
              '',
            ),
            instructions: clean(viewer.querySelector('p')),
            regionLabel: viewer
              .querySelector('[role="region"]')
              .getAttribute('aria-label'),
          },
        };
        if (!portrait) {
          websiteData.notes = clean(
            website.querySelector('.qd-showcase__notes p'),
          );
          websiteData.liveLabel = clean(
            website.querySelector('.qd-showcase__notes a'),
          ).replace(/\s*↗$/, '');
        }
        const design = sections[3],
          designFigs = design.querySelectorAll('figure');
        const designData = {
          ...intro(design),
          type: 'design-story',
          variant: portrait ? 'offset-editorial' : 'image-left',
          image: placement(designFigs[0]),
          detail: placement(designFigs[1]),
          notes: notes(
            portrait
              ? '.inf-design__notes > div'
              : '.qd-design__notes > .qd-note',
          ),
          ...(portrait
            ? {
                detailEyebrow: clean(
                  design.querySelector('.inf-design__interface > .inf-kicker'),
                ),
              }
            : { noteKicker: 'Observed detail' }),
        };
        const responsive = sections[4],
          responsiveFigs = [...responsive.querySelectorAll('figure')].slice(
            0,
            3,
          ),
          roles = ['desktop', 'tablet', 'mobile'];
        const responsiveData = {
          ...intro(responsive),
          type: 'responsive-showcase',
          variant: portrait ? 'aligned-devices' : 'layered-devices',
          devices: responsiveFigs.map((figure, index) => ({
            role: roles[index],
            label: portrait
              ? clean(figure.parentElement.querySelector('p'))
              : clean(figure.querySelector('figcaption')),
            image: placement(figure),
          })),
          notes: notes(`.${prefix}-responsive__notes > div`),
        };
        if (portrait) {
          const menu = responsive.querySelector('details');
          responsiveData.viewer = {
            image: placement(menu.querySelector('figure')),
            summary: clean(menu.querySelector('summary')).replace(/\s*\+$/, ''),
          };
        }
        const build = sections[5],
          buildFigs = build.querySelectorAll('figure');
        const buildData = {
          ...intro(build),
          type: 'technical-story',
          variant: portrait ? 'notes-left' : 'interface-left',
          journey: [...build.querySelectorAll('ol > li')].map((el) =>
            clean(el).replace(/^0\d\s*/, ''),
          ),
          notes: notes(
            portrait
              ? '.inf-build__notes > div'
              : '.qd-build__composition .qd-note',
          ),
          image: placement(buildFigs[0]),
        };
        if (portrait) {
          const details = build.querySelector('details');
          buildData.viewer = {
            image: placement(details.querySelector('figure')),
            summary: clean(details.querySelector('summary')).replace(
              /\s*\+$/,
              '',
            ),
          };
        } else buildData.secondary = placement(buildFigs[1]);
        const gallery = sections[6],
          galleryData = {
            ...intro(gallery),
            type: 'editorial-gallery',
            variant: portrait ? 'portrait-mosaic' : 'asymmetric-editorial',
            images: [...gallery.querySelectorAll('figure')].map(placement),
          };
        const finished = sections[7],
          related = finished.querySelector(`.${prefix}-related`);
        const finalData = {
          ...intro(finished),
          type: 'final-showcase',
          variant: portrait ? 'contained' : 'full-bleed',
          image: placement(finished.querySelector('figure')),
          buttonLabel: 'Visit Live Website',
          related: [...related.childNodes].flatMap((node) =>
            node.nodeType === Node.TEXT_NODE
              ? [{ type: 'text', text: node.textContent.replace(/\s+/g, ' ') }]
              : node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A'
                ? [
                    {
                      type: 'link',
                      label: clean(node),
                      href: node.getAttribute('href'),
                    },
                  ]
                : [],
          ),
        };
        const next = sections[8],
          nextData = {
            type: 'related-project',
            id: next.id,
            variant: portrait ? 'editorial-preview' : 'framed-preview',
            eyebrow: clean(next.querySelector(`.${prefix}-kicker`)),
            descriptionLines: lines(
              next.querySelector(`p:not(.${prefix}-kicker)`),
            ),
            linkLabel: clean(next.querySelector(`.${prefix}-link`)).replace(
              /\s*→$/,
              '',
            ),
          };
        const cta = sections[9],
          ctaData = {
            type: 'cta',
            id: cta.id,
            variant: 'quiet-centered',
            eyebrow: clean(cta.querySelector(`.${prefix}-kicker`)),
            heading: {
              id: cta.querySelector('h2').id,
              lines: lines(cta.querySelector('h2')),
            },
            intro: clean(cta.querySelector(`p:not(.${prefix}-kicker)`)),
            primaryLabel: 'Start a Project',
            primaryHref: '/contact/',
            secondaryLabel: 'Explore More Work',
            secondaryHref: '/work/',
          };
        return {
          hero,
          sections: [
            overviewData,
            websiteData,
            designData,
            responsiveData,
            buildData,
            galleryData,
            finalData,
            nextData,
            ctaData,
          ],
          media,
        };
      },
      {
        prefix,
        liveUrl: data.showcase.liveUrl,
        date: prefix === 'qd' ? '2026-10-14' : '2026-10-15',
      },
    );
    data.projectStudy = {
      version: 1,
      presentation,
      theme,
      draft: data.projectStudy.draft,
      publishedDate: data.projectStudy.publishedDate,
      pageTitle: data.projectStudy.pageTitle,
      description: data.projectStudy.description,
      socialImage: {
        src: `/images/social/${id}.png`,
        alt:
          prefix === 'qd'
            ? 'ElevateX Qadeer Jewellers concept project study with a genuine website preview.'
            : 'Infinity Salon concept website study by ElevateX, with a genuine interface preview.',
        width: 1200,
        height: 630,
      },
      ...extracted,
    };
    await writeFile(file, `---\n${stringify(data, { lineWidth: 0 })}---\n`);
    await page.close();
    console.log(
      `Migrated ${id}: ${Object.keys(extracted.media).length} media, ${extracted.sections.length} sections plus hero.`,
    );
  }
} finally {
  await browser.close();
}
