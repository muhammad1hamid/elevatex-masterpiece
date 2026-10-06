import { readFile } from 'node:fs/promises';

// Explicit editorial action: removed URLs are allowed as well as published URLs.
const args = process.argv.slice(2);
const submit = args.includes('--submit');
const urls = args.filter((argument) => !argument.startsWith('--'));
const robots = await readFile(
  new URL('../dist/robots.txt', import.meta.url),
  'utf8',
);
const sitemap = robots.match(/^Sitemap: (https:\/\/[^\s]+)$/m)?.[1];
if (!sitemap)
  throw new Error(
    'Build production mode before preparing IndexNow. Preview builds must not notify search engines.',
  );
const origin = new URL(sitemap).origin;
if (!urls.length || urls.length > 10000)
  throw new Error(
    'Provide between 1 and 10,000 genuinely changed or removed URLs.',
  );
const unique = [...new Set(urls)];
for (const input of unique) {
  const url = new URL(input);
  if (url.origin !== origin || url.search || url.hash)
    throw new Error(
      `Only canonical same-origin URLs without queries/fragments are accepted: ${input}`,
    );
}
if (!submit) {
  console.log(
    JSON.stringify(
      { mode: 'dry-run', host: new URL(origin).hostname, urlList: unique },
      null,
      2,
    ),
  );
} else {
  const key = process.env.INDEXNOW_KEY;
  if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key))
    throw new Error(
      'Set a valid INDEXNOW_KEY; publish its verification file first.',
    );
  const keyLocation = `${origin}/${key}.txt`;
  const verification = await fetch(keyLocation, {
    signal: AbortSignal.timeout(10000),
  });
  if (!verification.ok || (await verification.text()).trim() !== key)
    throw new Error(
      'IndexNow verification file is not published or does not match.',
    );
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: new URL(origin).hostname,
      key,
      keyLocation,
      urlList: unique,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (![200, 202].includes(response.status))
    throw new Error(`IndexNow rejected request: ${response.status}`);
  console.log(
    `IndexNow accepted ${unique.length} URLs (${response.status}). Acceptance is not a guarantee of indexing.`,
  );
}
