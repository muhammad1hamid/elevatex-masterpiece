import { defineConfig } from 'astro/config';
import { site } from './src/data/site';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: site.origin,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  integrations: [mdx()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
