import { z } from 'astro/zod';
const text = z.string().trim().min(1);
const anchor = z.string().regex(/^[a-z][a-z0-9-]*$/);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const href = text.refine(
  (value) =>
    /^\/(?!\/)[^\\]*$/.test(value) ||
    /^#[a-z][a-z0-9-]*$/.test(value) ||
    z.url({ protocol: /^https$/ }).safeParse(value).success,
  'Use a local path, section anchor or HTTPS URL.',
);
const note = z.object({ title: text, text });
const placement = z.object({
  media: slug,
  caption: text.optional(),
  showCaption: z.boolean().default(true),
  sizes: text.optional(),
  browser: z.boolean().default(false),
});
const rendition = z.object({
  base: z.string().regex(/^\/images\/[a-zA-Z0-9/_-]+$/),
  widths: z.array(z.number().int().positive()).min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
// These composition families have measured responsive layouts. Content may
// reorder or omit their chapters; a new layout combination needs its own review.
export const studyPresentations = {
  campaign: {
    hero: ['immersive-photo', 'minimal-typographic'],
    overview: ['panorama'],
    'website-showcase': ['contained-browser'],
    'design-story': ['image-left'],
    'responsive-showcase': ['layered-devices'],
    'technical-story': ['interface-left'],
    'editorial-gallery': ['asymmetric-editorial'],
    'final-showcase': ['full-bleed'],
    'related-project': ['framed-preview'],
    cta: ['quiet-centered'],
  },
  editorial: {
    hero: ['portrait-arch', 'minimal-typographic'],
    overview: ['interior-split'],
    'website-showcase': ['immersive-browser'],
    'design-story': ['offset-editorial'],
    'responsive-showcase': ['aligned-devices'],
    'technical-story': ['notes-left'],
    'editorial-gallery': ['portrait-mosaic'],
    'final-showcase': ['contained'],
    'related-project': ['editorial-preview'],
    cta: ['quiet-centered'],
  },
  precision: {
    hero: ['immersive-photo', 'minimal-typographic'],
    overview: ['wide-studio'],
    'website-showcase': ['wide-editorial'],
    'design-story': ['precision-detail'],
    'responsive-showcase': ['layered-devices'],
    'technical-story': ['precision-editorial'],
    'editorial-gallery': ['cinematic-panorama'],
    'final-showcase': ['contained'],
    'related-project': ['wide-preview'],
    cta: ['quiet-centered'],
  },
} as const;
export const studyMediaSchema = rendition
  .extend({
    category: z.enum([
      'AUTHENTIC_SCREENSHOT',
      'VERIFIED_BRAND_PHOTOGRAPHY',
      'ILLUSTRATIVE_EDITORIAL_ART',
      'CONCEPT_VISUAL',
    ]),
    alt: z.string(),
    caption: text,
    credit: text,
    sourceUrl: z.url({ protocol: /^https$/ }).optional(),
    capturedAt: z.coerce.date().optional(),
    permissionConfirmed: z.literal(true).optional(),
    focalPoint: z
      .object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) })
      .default({ x: 50, y: 50 }),
    aspectRatio: z
      .enum(['native', 'wide', 'square', 'portrait'])
      .default('native'),
    fit: z.enum(['contain', 'cover']).default('contain'),
    position: z.enum(['inline', 'left', 'right', 'center']).default('inline'),
    mobile: rendition.optional(),
  })
  .superRefine((item, ctx) => {
    if (
      item.category === 'AUTHENTIC_SCREENSHOT' &&
      (!item.sourceUrl || !item.capturedAt || !item.alt.trim())
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'Screenshots need a source URL, capture date and descriptive alt text.',
      });
    if (
      item.category === 'VERIFIED_BRAND_PHOTOGRAPHY' &&
      item.permissionConfirmed !== true
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Brand photography requires confirmed permission and credit.',
      });
    if (
      item.category === 'ILLUSTRATIVE_EDITORIAL_ART' &&
      !/illustrative|editorial visual study/i.test(item.caption)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Illustrative art needs a visible illustrative caption.',
      });
    for (const source of [item, ...(item.mobile ? [item.mobile] : [])])
      if (
        source.widths.some(
          (width, index) =>
            width > source.width ||
            (index > 0 && width <= source.widths[index - 1]!),
        )
      )
        ctx.addIssue({
          code: 'custom',
          message:
            'Rendition widths must increase and not exceed the declared width.',
        });
  });
const heading = z.object({ id: anchor, lines: z.array(text).min(1).max(3) });
export const studyMotionSchema = z.enum([
  'none',
  'subtle-reveal',
  'soft-reveal',
  'browser-reveal',
  'detail-reveal',
  'device-reveal',
  'gallery-reveal',
]);
const base = {
  id: anchor,
  eyebrow: text,
  heading,
  intro: text,
  motion: studyMotionSchema.optional(),
};
const viewer = z.object({
  image: placement,
  summary: text,
  instructions: text.optional(),
  regionLabel: text.optional(),
});
const richText = z
  .array(
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('text'), text: z.string() }),
      z.object({ type: z.literal('link'), label: text, href }),
    ]),
  )
  .min(1);
export const studySectionSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('overview'),
    variant: z.enum(['panorama', 'interior-split', 'wide-studio']),
    facts: z
      .array(
        z.object({
          label: text,
          source: z.enum([
            'project',
            'industry',
            'classification',
            'services',
            'live',
            'text',
          ]),
          text: text.optional(),
          href: href.optional(),
        }),
      )
      .min(1),
    image: placement,
    evidenceNote: text.optional(),
    atmosphere: z
      .object({
        eyebrow: text,
        headingLines: z.array(text).min(1),
        text,
        disclaimer: text,
        linkLabel: text,
      })
      .optional(),
  }),
  z.object({
    ...base,
    type: z.literal('website-showcase'),
    variant: z.enum([
      'contained-browser',
      'immersive-browser',
      'wide-editorial',
    ]),
    image: placement,
    notes: text.optional(),
    liveLabel: text.optional(),
    viewer: viewer.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('design-story'),
    variant: z.enum(['image-left', 'offset-editorial', 'precision-detail']),
    image: placement,
    detail: placement,
    notes: z.array(note),
    detailEyebrow: text.optional(),
    noteKicker: text.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('responsive-showcase'),
    variant: z.enum(['layered-devices', 'aligned-devices']),
    devices: z
      .array(
        z.object({
          role: z.enum(['desktop', 'tablet', 'mobile']),
          label: text,
          image: placement,
        }),
      )
      .min(1)
      .max(3),
    notes: z.array(note),
    viewer: viewer.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('technical-story'),
    variant: z.enum(['interface-left', 'notes-left', 'precision-editorial']),
    journey: z.array(text),
    notes: z.array(note),
    image: placement,
    secondary: placement.optional(),
    viewer: viewer.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('editorial-gallery'),
    variant: z.enum([
      'asymmetric-editorial',
      'portrait-mosaic',
      'cinematic-panorama',
    ]),
    images: z.array(placement).min(1).max(6),
  }),
  z.object({
    ...base,
    type: z.literal('final-showcase'),
    variant: z.enum(['full-bleed', 'contained']),
    image: placement,
    buttonLabel: text,
    related: richText,
  }),
  z.object({
    type: z.literal('related-project'),
    id: anchor,
    variant: z.enum(['framed-preview', 'editorial-preview', 'wide-preview']),
    eyebrow: text,
    descriptionLines: z.array(text).optional(),
    linkLabel: text,
  }),
  z.object({
    type: z.literal('cta'),
    id: anchor,
    variant: z.literal('quiet-centered'),
    eyebrow: text,
    heading,
    intro: text,
    primaryLabel: text,
    primaryHref: href.default('/contact/'),
    secondaryLabel: text,
    secondaryHref: href.default('/work/'),
  }),
]);
export const cinematicStudySchema = z
  .object({
    version: z.literal(1),
    slug: slug.optional(),
    displayName: text.optional(),
    presentation: z.enum(['campaign', 'editorial', 'precision']),
    theme: z.enum(['jewellery', 'beauty', 'automotive', 'neutral']),
    draft: z.boolean().default(true),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pageTitle: text,
    description: text,
    socialImage: z
      .object({
        src: z.string().regex(/^\/images\//),
        alt: text,
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .optional(),
    nextProjectSlug: slug.optional(),
    hero: z.object({
      id: anchor,
      titleId: anchor,
      variant: z.enum([
        'immersive-photo',
        'portrait-arch',
        'minimal-typographic',
      ]),
      motion: z.enum(['cinematic', 'none']).default('cinematic'),
      eyebrow: text,
      statement: z.array(text).min(1).max(3),
      description: text,
      image: placement.optional(),
      classificationSuffix: text,
      classificationSeparator: z.enum(['slash', 'dot']).default('dot'),
      artLabel: text.optional(),
      margins: z
        .object({ start: z.array(text), end: z.array(text) })
        .optional(),
      indexLink: z.object({ label: text, href }).optional(),
      evidencePreview: z
        .object({
          media: slug,
          mobileMedia: slug.optional(),
          target: anchor,
          label: text,
          summary: text,
        })
        .optional(),
    }),
    media: z.record(slug, studyMediaSchema),
    sections: z.array(studySectionSchema).min(1).max(20),
  })
  .strict()
  .superRefine((study, ctx) => {
    const family = studyPresentations[study.presentation];
    if (!(family.hero as readonly string[]).includes(study.hero.variant))
      ctx.addIssue({
        code: 'custom',
        message: `Unsupported ${study.presentation} hero variant.`,
      });
    for (const section of study.sections) {
      if (
        !(family[section.type] as readonly string[]).includes(section.variant)
      )
        ctx.addIssue({
          code: 'custom',
          message: `Unsupported ${study.presentation} ${section.type} variant.`,
        });
      if (
        section.type === 'overview' &&
        section.variant === 'interior-split' &&
        !section.atmosphere
      )
        ctx.addIssue({
          code: 'custom',
          message: 'The split overview needs atmosphere copy.',
        });
      if (
        section.type === 'overview' &&
        section.facts.some(
          (fact) =>
            ['services', 'live', 'text'].includes(fact.source) && !fact.text,
        )
      )
        ctx.addIssue({
          code: 'custom',
          message: 'Text, services and live-link facts need display text.',
        });
      if (
        section.type === 'responsive-showcase' &&
        new Set(section.devices.map((device) => device.role)).size !==
          section.devices.length
      )
        ctx.addIssue({
          code: 'custom',
          message: 'Each responsive device role must be unique.',
        });
    }
    if (study.updatedDate && study.updatedDate < study.publishedDate)
      ctx.addIssue({
        code: 'custom',
        message: 'Study updatedDate cannot precede publishedDate.',
      });
    const ids = [
      study.hero.id,
      study.hero.titleId,
      ...study.sections.flatMap((s) => [
        s.id,
        ...('heading' in s ? [s.heading.id] : []),
      ]),
    ];
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Section and heading IDs must be unique.',
      });
    if (study.hero.variant !== 'minimal-typographic' && !study.hero.image)
      ctx.addIssue({
        code: 'custom',
        message: 'Photographic heroes require media.',
      });
    const inspect = (item: unknown, evidence = false) => {
      if (!item || typeof item !== 'object') return;
      if ('media' in item && typeof item.media === 'string') {
        const asset = study.media[item.media];
        if (!asset)
          ctx.addIssue({
            code: 'custom',
            message: `Unknown media reference: ${item.media}`,
          });
        else if (
          (evidence || ('browser' in item && item.browser)) &&
          asset.category !== 'AUTHENTIC_SCREENSHOT'
        )
          ctx.addIssue({
            code: 'custom',
            message: `${item.media} must be an authentic screenshot.`,
          });
        else if (
          asset.category === 'ILLUSTRATIVE_EDITORIAL_ART' &&
          (('showCaption' in item && item.showCaption === false) ||
            ('caption' in item &&
              typeof item.caption === 'string' &&
              !/illustrative|editorial visual study/i.test(item.caption)))
        )
          ctx.addIssue({
            code: 'custom',
            message:
              'Illustrative placements require visible, accurate attribution.',
          });
      }
    };
    inspect(study.hero.image);
    if (study.hero.evidencePreview) {
      const preview = study.hero.evidencePreview;
      inspect(preview, true);
      if (preview.mobileMedia) inspect({ media: preview.mobileMedia }, true);
      if (
        !study.sections.some(
          (section) =>
            section.id === preview.target &&
            [
              'website-showcase',
              'responsive-showcase',
              'technical-story',
              'final-showcase',
            ].includes(section.type),
        )
      )
        ctx.addIssue({
          code: 'custom',
          message:
            'An evidence preview must target an existing interface-evidence section.',
        });
    }
    for (const section of study.sections) {
      if ('image' in section)
        inspect(
          section.image,
          ['website-showcase', 'technical-story', 'final-showcase'].includes(
            section.type,
          ),
        );
      if (section.type === 'design-story') inspect(section.detail, true);
      if (section.type === 'responsive-showcase')
        for (const device of section.devices) inspect(device.image, true);
      if (section.type === 'editorial-gallery')
        for (const image of section.images) inspect(image);
      if (section.type === 'technical-story') inspect(section.secondary, true);
      if ('viewer' in section && section.viewer)
        inspect(section.viewer.image, true);
    }
  });
export type CinematicStudy = z.infer<typeof cinematicStudySchema>;
export type StudyMotion = z.infer<typeof studyMotionSchema>;
export type StudySection = z.infer<typeof studySectionSchema>;
export type StudyMedia = z.infer<typeof studyMediaSchema>;
export type MediaPlacement = z.infer<typeof placement>;
export type SectionOf<T extends StudySection['type']> = Extract<
  StudySection,
  { type: T }
>;
