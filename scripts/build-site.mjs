import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { buildEnvironment } from './build-environment.mjs';

const env = buildEnvironment(process.env);
const output = resolve(process.argv[2] ?? 'dist');
const outputRelative = relative(process.cwd(), output);
if (
  !['dist', 'artifacts', 'test-results'].includes(outputRelative.split(sep)[0])
)
  throw new Error(
    'Build output must stay inside dist/, artifacts/ or test-results/.',
  );
for (const args of [
  ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', output],
  ['scripts/write-hosting-headers.mjs', output],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
// Public deployment identity only. Never serialize environment variables or tokens.
const commit = /^[a-f0-9]{40}$/.test(env.WORKERS_CI_COMMIT_SHA ?? '')
  ? env.WORKERS_CI_COMMIT_SHA
  : null;
await writeFile(
  resolve(output, 'release.json'),
  JSON.stringify({ commit, environment: env.DEPLOYMENT_ENV }) + '\n',
);
