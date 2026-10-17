import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { serviceSlugs } from './data/site';
import { cinematicStudySchema } from './lib/case-study/schema';
import { insightTopics } from './data/insight-topics';

const text = z.string().trim().min(1);
const media = z.object({
  src: z.string().regex(/^\/images\//),
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const publicUrl = z.url({ protocol: /^https?$/ });
const showcase = z.object({
  projectType: z.enum(['concept', 'demo', 'client', 'internal']),
  category: text,
  liveUrl: z.url({ protocol: /^https$/ }),
  image: media.extend({
    provenance: z.literal('verifiedScreenshot').default('verifiedScreenshot'),
  }),
  portfolio: z
    .object({
      featured: z.boolean().default(false),
      layout: z
        .enum(['jewellery', 'beauty', 'automotive', 'events'])
        .optional(),
      focus: text,
      details: z.array(text).min(1),
      mobileImage: media
        .extend({ provenance: z.literal('verifiedScreenshot') })
        .optional(),
    })
    .optional(),
  order: z.number().int().nonnegative(),
  verifiedDate: z.coerce.date(),
  verification: text,
});
const author = z.object({ name: text, url: publicUrl.optional() });
const publication = {
  title: text,
  description: text,
  publishedDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(true),
  featured: z.boolean().default(false),
  featuredImage: media.optional(),
  relatedServices: z.array(z.enum(serviceSlugs)).default([]),
};
const chronological = (data: {
  publishedDate: Date;
  updatedDate?: Date | undefined;
}) => !data.updatedDate || data.updatedDate >= data.publishedDate;

const insights = defineCollection({
  loader: glob({ base: './src/content/insights', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      ...publication,
      author: author.extend({
        type: z.enum(['Person', 'Organization']).default('Person'),
      }),
      category: z.enum(insightTopics),
      tags: z.array(text).default([]),
      quickAnswer: text.optional(),
      coverCaption: text.optional(),
      takeaways: z.array(text).default([]),
      seoTitle: text.optional(),
      seoDescription: text.optional(),
      socialImage: media.optional(),
      relatedProjects: z
        .array(
          z.enum([
            'qadeer-jewellers',
            'infinity-salon',
            'apex-detailing-studio',
          ]),
        )
        .default([]),
      sources: z
        .array(
          z.object({
            title: text,
            url: publicUrl,
            publisher: text.optional(),
            context: text.optional(),
          }),
        )
        .default([]),
    })
    .refine(chronological, {
      message: 'updatedDate cannot precede publishedDate',
    }),
});

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.md' }),
  schema: z
    .union([
      z.object({
        ...publication,
        entryType: z.literal('case-study').default('case-study'),
        showcase: showcase.optional(),
        client: text,
        industry: text,
        summary: text,
        context: text,
        challenge: text,
        constraints: z.array(text),
        role: text,
        strategy: text,
        solution: text,
        before: text,
        after: text,
        timeline: text,
        technologies: z.array(text),
        results: z
          .array(
            z.object({
              claim: text,
              source: text,
              measuredAt: z.coerce.date().optional(),
              methodology: text.optional(),
            }),
          )
          .default([]),
        gallery: z.array(media).default([]),
        testimonial: z
          .object({
            quote: text,
            attribution: text,
            permissionConfirmed: z.literal(true),
            source: text,
          })
          .optional(),
      }),
      z.object({
        ...publication,
        entryType: z.literal('showcase'),
        industry: text,
        showcase,
        projectStudy: cinematicStudySchema.optional(),
      }),
    ])
    .refine(chronological, {
      message: 'updatedDate cannot precede publishedDate',
    }),
});

export const collections = { insights, caseStudies };
