import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';

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
await removeDirectoryMarkers(new URL('../dist/', import.meta.url));

// Derive mode from the generated endpoint: the same Astro env controls both.
const robots = await readFile(
  new URL('../dist/robots.txt', import.meta.url),
  'utf8',
);
const production = robots.startsWith('# Deployment: production\n');
const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n${production ? '' : '  X-Robots-Tag: noindex, follow\n'}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/404.html\n  X-Robots-Tag: noindex, follow\n`;
await writeFile(new URL('../dist/_headers', import.meta.url), headers);
console.log(
  `Cloudflare headers generated for ${production ? 'production' : 'preview'} mode.`,
);
