import { z } from 'astro/zod';
const text = z.string().trim().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const image = z.object({
  base: z.string().regex(/^\/images\/evidence\/[a-z0-9-]+$/),
  widths: z.array(z.number().int().positive()).min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: text,
});
/** Internal observations are draft until their exact material is approved. */
export const buildEvidenceSchema = z
  .object({
    title: text,
    description: text,
    draft: z.boolean().default(true),
    permission: z.enum(['pending', 'confirmed']).default('pending'),
    kind: z.literal('internal-interface-check'),
    recordedAt: z.coerce.date(),
    baseCommit: z.string().regex(/^[a-f0-9]{40}$/),
    sourceVersion: hash,
    sourceFiles: z
      .array(
        z.object({
          path: z.string().regex(/^src\/[a-zA-Z0-9/_-]+\.(?:astro|ts|css)$/),
          sha256: hash,
        }),
      )
      .min(1),
    environment: z.array(text).min(1),
    method: z.array(text).min(1),
    observations: z.array(z.object({ title: text, text })).min(1),
    limitations: z.array(text).min(1),
    excerpt: z.object({ path: text, code: text }),
    desktop: image,
    mobile: image,
    caption: text,
    recordPath: z.string().regex(/^\/evidence\/[a-z0-9-]+\.json$/),
  })
  .strict()
  .superRefine((record, ctx) => {
    if (!record.draft && record.permission !== 'confirmed')
      ctx.addIssue({
        code: 'custom',
        message: 'Public build evidence requires owner-confirmed permission.',
      });
    for (const media of [record.desktop, record.mobile])
      if (
        media.widths.some(
          (width, index) =>
            width > media.width ||
            (index > 0 && width <= media.widths[index - 1]!),
        )
      )
        ctx.addIssue({
          code: 'custom',
          message:
            'Evidence rendition widths must increase within the captured width.',
        });
    if (!record.sourceFiles.some((file) => file.path === record.excerpt.path))
      ctx.addIssue({
        code: 'custom',
        message:
          'An excerpt must identify one of the fingerprinted source files.',
      });
  });
export type BuildEvidence = z.infer<typeof buildEvidenceSchema>;
