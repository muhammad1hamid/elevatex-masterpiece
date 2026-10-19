import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, relative, sep } from 'node:path';

// An optional output path supports isolated candidate builds without touching dist.
const repository = fileURLToPath(new URL('../', import.meta.url));
const outputPath = resolve(repository, process.argv[2] ?? 'dist');
const outputRelative = relative(repository, outputPath);
if (
  !['dist', 'artifacts', 'test-results'].includes(outputRelative.split(sep)[0])
) {
  throw new Error(
    'Hosting output must be inside dist/, artifacts/ or test-results/.',
  );
}
const output = pathToFileURL(`${outputPath}${sep}`);

async function removeDirectoryMarkers(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(
      entry.name + (entry.isDirectory() ? '/' : ''),
      directory,
    );
    if (entry.isDirectory()) await removeDirectoryMarkers(url);
    else if (entry.name === '.gitkeep') await unlink(url);
  }
}
// Derive mode from the generated endpoint: the same Astro env controls both.
const robots = await readFile(new URL('robots.txt', output), 'utf8');
if (!/^# Deployment: (production|preview)\n/.test(robots)) {
  throw new Error(
    'Generate hosting files only for a completed ElevateX build.',
  );
}
await removeDirectoryMarkers(output);
const production = robots.startsWith('# Deployment: production\n');
const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n${production ? '' : '  X-Robots-Tag: noindex, follow\n'}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/404.html\n  X-Robots-Tag: noindex, follow\n`;
await writeFile(new URL('_headers', output), headers);

let reviewedRedirects = '';
try {
  reviewedRedirects = await readFile(
    new URL('../public/_redirects', import.meta.url),
    'utf8',
  );
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
// Rebuild from source each time; never retain old preview rules from dist/.
// Work, About and Contact have real pages and must stay on the requested host.
// Services is a temporary compatibility alias in both modes, not a migration rule.
const compatibility =
  '# Services compatibility; real content lives at /#services.\n/services /#services 302\n/services/ /#services 302\n';
if (/https?:\/\/(?:www\.)?elevatexlab\.com\b/i.test(reviewedRedirects)) {
  throw new Error(
    'Hosting redirects must not send the new site to the old .com identity.',
  );
}
const sourceHasServices =
  /^\/services\s+\/#services\s+302$/m.test(reviewedRedirects) &&
  /^\/services\/\s+\/#services\s+302$/m.test(reviewedRedirects);
await writeFile(
  new URL('_redirects', output),
  `${reviewedRedirects.trimEnd()}${reviewedRedirects.trim() ? '\n' : ''}${sourceHasServices ? '' : compatibility}`,
);

console.log(
  `Cloudflare headers generated for ${production ? 'production' : 'preview'} mode.`,
);
