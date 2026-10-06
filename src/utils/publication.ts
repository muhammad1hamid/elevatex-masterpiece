export interface PublicationState {
  draft: boolean;
  publishedDate: Date;
  updatedDate?: Date | undefined;
}

export function isPublished(data: PublicationState, now = new Date()): boolean {
  return !data.draft && data.publishedDate <= now;
}

export function contentPath(
  collection: 'insights' | 'caseStudies',
  id: string,
): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    throw new Error(`Invalid content slug: ${id}`);
  return `/${collection === 'caseStudies' ? 'work' : 'insights'}/${id}/`;
}
