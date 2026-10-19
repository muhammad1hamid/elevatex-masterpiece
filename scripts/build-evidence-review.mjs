import { spawnSync } from 'node:child_process';
import { readFile, writeFile, unlink } from 'node:fs/promises';

// These exclusive fixtures exist only for this isolated, noindex review build.
// Draft material never changes the normal route or publication configuration.
const created = [];
try {
  for (const [target, source, transform] of [
    [
      'src/pages/qa-build-evidence-work.astro',
      'src/pages/work/index.astro',
      (text) =>
        text
          .replaceAll('../../', '../')
          .replace(
            '<BuildEvidencePanel />',
            '<BuildEvidencePanel includeDraft />',
          ),
    ],
    [
      'src/pages/qa-build-evidence-about.astro',
      'src/pages/about.astro',
      (text) =>
        text.replace('<AboutApproach />', '<AboutApproach evidenceReview />'),
    ],
  ]) {
    const original = await readFile(source, 'utf8');
    const content = transform(original);
    if (content === original)
      throw new Error(
        'The review fixture did not enable its explicit draft placement.',
      );
    await writeFile(target, content, { flag: 'wx' });
    created.push(target);
  }
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/astro/bin/astro.mjs',
      'build',
      '--outDir',
      'artifacts/implementation/2026-10-18-batch-04/review-dist',
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, DEPLOYMENT_ENV: 'preview' },
    },
  );
  if (result.status !== 0)
    throw new Error('The isolated build-evidence review did not complete.');
} finally {
  for (const file of created.reverse()) await unlink(file);
}
