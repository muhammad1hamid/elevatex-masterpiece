import { spawnSync } from 'node:child_process';
import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

// Synthetic fixtures exist only during this check and are never deployed.
const fixtures = [
  ['insights', 'qa-published-fixture', false, '2020-01-01'],
  ['insights', 'qa-draft-fixture', true, '2020-01-01'],
  ['insights', 'qa-scheduled-fixture', false, '2999-01-01'],
  ['case-studies', 'qa-case-fixture', false, '2020-01-01'],
];
const created = [];
const output = 'test-results/publication-build';
try {
  for (const [collection, slug, draft, date] of fixtures) {
    const file = `src/content/${collection}/${slug}.md`;
    const data = {
      title: `Test-only ${slug}`,
      description: 'Synthetic QA fixture; not business content.',
      draft,
      publishedDate: date,
      ...(collection === 'insights'
        ? { author: { name: 'Test-only author' }, category: 'QA' }
        : {
            client: 'Test-only client',
            industry: 'QA',
            summary: 'Test-only summary',
            context: 'Test context',
            challenge: 'Test challenge',
            constraints: ['Test constraint'],
            role: 'Test role',
            strategy: 'Test strategy',
            solution: 'Test solution',
            before: 'Test before',
            after: 'Test after',
            timeline: 'Test timeline',
            technologies: ['Test technology'],
            results: [{ claim: 'Test claim', source: 'Test source' }],
          }),
    };
    // JSON is a YAML subset. Exclusive creation prevents replacing real author work.
    await writeFile(
      file,
      `---\n${JSON.stringify(data, null, 2)}\n---\n\n## Fixture answer\n\nThis content exists only to validate publishing behavior.\n`,
      { flag: 'wx' },
    );
    created.push(file);
  }
  const result = spawnSync(
    process.execPath,
    ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', output],
    {
      env: {
        ...process.env,
        DEPLOYMENT_ENV: 'production',
        GPTBOT_POLICY: 'allow',
      },
      stdio: 'inherit',
    },
  );
  assert.equal(result.status, 0, 'Publication fixture build must succeed');
  const article = await readFile(
    `${output}/insights/qa-published-fixture/index.html`,
    'utf8',
  );
  const caseStudy = await readFile(
    `${output}/work/qa-case-fixture/index.html`,
    'utf8',
  );
  assert.match(article, /Test-only author/);
  assert.match(article, /index, follow, max-image-preview:large/);
  assert.match(caseStudy, /Test source/);
  const sitemap = await readFile(`${output}/sitemap.xml`, 'utf8');
  assert.match(sitemap, /\/insights\/qa-published-fixture\//);
  assert.match(sitemap, /\/work\/qa-case-fixture\//);
  assert.doesNotMatch(sitemap, /qa-draft-fixture|qa-scheduled-fixture/);
  for (const slug of ['qa-draft-fixture', 'qa-scheduled-fixture']) {
    await assert.rejects(access(`${output}/insights/${slug}/index.html`));
  }
  const robots = await readFile(`${output}/robots.txt`, 'utf8');
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
  assert.match(robots, /User-agent: GPTBot\nAllow: \//);
  assert.match(
    await readFile(`${output}/index.html`, 'utf8'),
    /noindex, follow/,
  );
  console.log(
    'Publication integration passed: approved routes, case-study evidence, drafts, scheduling, sitemap and production robots.',
  );
} finally {
  for (const file of created) await unlink(file);
  // Keep the ordinary dist/ untouched; fixture output is ignored by Git.
  await mkdir(path.dirname(output), { recursive: true });
}
