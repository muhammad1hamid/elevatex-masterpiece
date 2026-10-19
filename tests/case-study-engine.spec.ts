import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { cinematicStudySchema } from '../src/lib/case-study/schema';
import { isPublished } from '../src/utils/publication';
const fixture = JSON.parse(
  readFileSync('tests/fixtures/cinematic-study.json', 'utf8'),
);
const copy = () => structuredClone(fixture.projectStudy);
test('optional evidence placement preserves version-one entries and validates real sources and targets', () => {
  const original = cinematicStudySchema.parse(copy());
  expect(original.hero.evidencePreview).toBeUndefined();
  const study = copy();
  study.hero.evidencePreview = {
    media: 'interface',
    mobileMedia: 'interface',
    target: study.sections[0].id,
    label: 'See the actual website',
    summary: 'A genuine test capture.',
  };
  expect(cinematicStudySchema.safeParse(study).success).toBe(true);
  for (const mutation of [
    (s: ReturnType<typeof copy>) => {
      s.hero.evidencePreview.media = 'missing';
    },
    (s: ReturnType<typeof copy>) => {
      s.hero.evidencePreview.mobileMedia = 'missing';
    },
    (s: ReturnType<typeof copy>) => {
      s.hero.evidencePreview.target = s.hero.id;
    },
    (s: ReturnType<typeof copy>) => {
      s.media.interface.category = 'CONCEPT_VISUAL';
    },
    (s: ReturnType<typeof copy>) => {
      delete s.media.interface.sourceUrl;
    },
    (s: ReturnType<typeof copy>) => {
      delete s.media.interface.capturedAt;
    },
  ]) {
    const changed = structuredClone(study);
    mutation(changed);
    expect(cinematicStudySchema.safeParse(changed).success).toBe(false);
  }
});
test('a draft data-only study supports optional chapters, typed themes and a minimal hero', () => {
  const study = cinematicStudySchema.parse(copy());
  expect(study.sections.map((s) => s.type)).toEqual([
    'website-showcase',
    'cta',
  ]);
  expect(study.theme).toBe('neutral');
  expect(isPublished(study)).toBe(false);
  expect(study.hero.variant).toBe('minimal-typographic');
});
test('media, variants, motion, focal coordinates and references fail closed', () => {
  for (const mutate of [
    (s: ReturnType<typeof copy>) => {
      s.presentation = 'arbitrary-component';
    },
    (s: ReturnType<typeof copy>) => {
      s.hero.variant = 'custom-script';
    },
    (s: ReturnType<typeof copy>) => {
      s.hero.motion = 'run-forever';
    },
    (s: ReturnType<typeof copy>) => {
      s.sections[0].variant = 'css-from-content';
    },
    (s: ReturnType<typeof copy>) => {
      s.sections[0].variant = 'immersive-browser';
    },
    (s: ReturnType<typeof copy>) => {
      s.sections[0].image.media = 'missing';
    },
    (s: ReturnType<typeof copy>) => {
      s.media.interface.focalPoint = { x: 150, y: 50 };
    },
    (s: ReturnType<typeof copy>) => {
      s.media.interface.base = '/images/../private';
    },
    (s: ReturnType<typeof copy>) => {
      s.media.interface.sourceUrl = 'javascript:alert(1)';
    },
    (s: ReturnType<typeof copy>) => {
      s.sections[1].primaryHref = 'javascript:alert(1)';
    },
    (s: ReturnType<typeof copy>) => {
      s.sections[1].id = s.sections[0].id;
    },
    (s: ReturnType<typeof copy>) => {
      s.media.interface.category = 'ILLUSTRATIVE_EDITORIAL_ART';
      s.media.interface.caption = 'Illustrative Art Direction';
    },
  ]) {
    const study = copy();
    mutate(study);
    expect(cinematicStudySchema.safeParse(study).success).toBe(false);
  }
});
test('illustrative art cannot lose its attribution or masquerade as brand photography', () => {
  const study = copy();
  study.sections[0].type = 'overview';
  study.sections[0].variant = 'panorama';
  study.sections[0].facts = [{ label: 'Project', source: 'project' }];
  study.sections[0].image.browser = false;
  study.media.interface.category = 'ILLUSTRATIVE_EDITORIAL_ART';
  study.media.interface.caption = 'Illustrative Art Direction';
  expect(cinematicStudySchema.safeParse(study).success).toBe(true);
  study.sections[0].image.showCaption = false;
  expect(cinematicStudySchema.safeParse(study).success).toBe(false);
  study.sections[0].image.showCaption = true;
  study.sections[0].image.caption = 'Official client photograph';
  expect(cinematicStudySchema.safeParse(study).success).toBe(false);
  study.sections[0].image.caption = 'Illustrative Art Direction';
  study.media.interface.category = 'VERIFIED_BRAND_PHOTOGRAPHY';
  expect(cinematicStudySchema.safeParse(study).success).toBe(false);
});
