import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { canIndex } from '../utils/seo';

export const GET: APIRoute = () => {
  const production = canIndex(true);
  const policy = import.meta.env.GPTBOT_POLICY ?? 'block';
  if (!['allow', 'block'].includes(policy))
    throw new Error('GPTBOT_POLICY must be allow or block.');
  const text = production
    ? `# Deployment: production\nUser-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\n${policy === 'allow' ? 'Allow' : 'Disallow'}: /\n\nSitemap: ${site.origin}/sitemap.xml\n`
    : // Let crawlers see the noindex meta/header. robots.txt is not authentication.
      '# Deployment: preview\n# Preview pages carry noindex; protect private previews with Cloudflare Access.\nUser-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n';
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
