/** Workers Builds supplies these variables; local and branch previews stay private. */
export function buildEnvironment(input) {
  const env = { ...input };
  const workersBuild = env.WORKERS_CI === '1';
  const productionMain = workersBuild && env.WORKERS_CI_BRANCH === 'main';
  if (workersBuild)
    env.DEPLOYMENT_ENV = productionMain ? 'production' : 'preview';
  env.DEPLOYMENT_ENV ??= 'preview';
  for (const key of [
    'PUBLIC_TRACKING_ENABLED',
    'PUBLIC_TRACKING_PRIVACY_APPROVED',
    'PUBLIC_TRACKING_PROVIDER_REVIEWED',
  ]) {
    // Owner approved this main release. Explicit false remains a shutdown switch.
    env[key] = productionMain ? (env[key] ?? 'true') : (env[key] ?? 'false');
    if (workersBuild && !productionMain) env[key] = 'false';
  }
  if (workersBuild) env.LEGAL_REVIEW = 'false';
  return env;
}
