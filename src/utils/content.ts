import { getCollection } from 'astro:content';
import { isPublished } from './publication';

export async function publishedInsights() {
  return (
    await getCollection('insights', ({ data }) => isPublished(data))
  ).sort(
    (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
  );
}

export async function publishedCaseStudies() {
  return (
    await getCollection('caseStudies', ({ data }) => isPublished(data))
  ).sort(
    (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
  );
}
