import { defineConfig } from 'astro/config';
import { site } from './src/data/site';

export default defineConfig({
  site: site.origin,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
