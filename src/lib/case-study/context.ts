import type { CollectionEntry } from 'astro:content';
import type { CinematicStudy } from './schema';
import type { FeaturedProject } from '../../utils/content';
export type StudyProject = Extract<
  CollectionEntry<'caseStudies'>['data'],
  { entryType: 'showcase' }
>;
export interface StudyContext {
  project: StudyProject;
  study: CinematicStudy;
  name: string;
  prefix: CinematicStudy['presentation'];
  liveUrl: string;
  browserLabel: string;
  classification: string;
  next?: FeaturedProject | undefined;
  nextHref: string;
}
