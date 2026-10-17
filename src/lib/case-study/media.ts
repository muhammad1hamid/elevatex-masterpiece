import { existsSync } from 'node:fs';
import type { CinematicStudy } from './schema';
export function validateStudyAssets(study: CinematicStudy): void {
  for (const [key, media] of Object.entries(study.media))
    for (const rendition of [media, ...(media.mobile ? [media.mobile] : [])])
      for (const width of rendition.widths)
        for (const format of ['avif', 'webp']) {
          if (!existsSync(`public${rendition.base}-${width}.${format}`))
            throw new Error(
              `Study media ${key} is missing ${width}.${format}.`,
            );
        }
  if (study.socialImage && !existsSync(`public${study.socialImage.src}`))
    throw new Error('The study social image does not exist.');
}
