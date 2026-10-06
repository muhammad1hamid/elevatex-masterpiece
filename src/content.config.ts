import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { serviceSlugs } from './data/site';

const text = z.string().trim().min(1);
const media = z.object({
  src: z.string().regex(/^\/images\//),
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const publicUrl = z.url({ protocol: /^https?$/ });
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
  loader: glob({ base: './src/content/insights', pattern: '**/*.md' }),
  schema: z
    .object({
      ...publication,
      author,
      category: text,
      tags: z.array(text).default([]),
      sources: z.array(z.object({ title: text, url: publicUrl })).default([]),
    })
    .refine(chronological, {
      message: 'updatedDate cannot precede publishedDate',
    }),
});

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.md' }),
  schema: z
    .object({
      ...publication,
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
    })
    .refine(chronological, {
      message: 'updatedDate cannot precede publishedDate',
    }),
});

export const collections = { insights, caseStudies };
