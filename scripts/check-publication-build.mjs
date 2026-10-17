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
    const file = `src/content/${collection}/${slug}.${collection === 'insights' ? 'mdx' : 'md'}`;
    const data = {
      title: `Test-only ${slug}`,
      description: 'Synthetic QA fixture; not business content.',
      draft,
      publishedDate: date,
      ...(collection === 'insights'
        ? { author: { name: 'Test-only author' }, category: 'Digital Strategy' }
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
      `---\n${JSON.stringify(data, null, 2)}\n---\n\n${collection === 'insights' ? 'import ArticleCallout from \'../../components/insights/ArticleCallout.astro\';\n\n<ArticleCallout title="MDX fixture">This component validates future article authoring.</ArticleCallout>\n\n' : ''}## Fixture answer\n\nThis content exists only to validate publishing behavior.\n`,
      { flag: 'wx' },
    );
    created.push(file);
  }
  // A draft content fixture is mounted only in this isolated test build.
  // It never enters Work, sitemap or the ordinary dynamic project routes.
  const engineFixture = 'src/content/case-studies/qa-engine-fixture.md';
  await writeFile(
    engineFixture,
    `---\n${await readFile('tests/fixtures/cinematic-study.json', 'utf8')}\n---\n`,
    { flag: 'wx' },
  );
  created.push(engineFixture);
  const engineHost = 'src/pages/qa-engine-preview.astro';
  await writeFile(
    engineHost,
    `---\nimport {getEntry} from 'astro:content';\nimport CaseStudyLayout from '../components/case-studies/CaseStudyLayout.astro';\nconst entry=await getEntry('caseStudies','qa-engine-fixture');\nif(!entry||entry.data.entryType!=='showcase')throw new Error('Missing draft renderer fixture');\n---\n<CaseStudyLayout project={entry.data} id="qa-engine-fixture" indexable={false} />\n`,
    { flag: 'wx' },
  );
  created.push(engineHost);
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
  assert.match(article, /This component validates future article authoring/);
  assert.match(article, /index, follow, max-image-preview:large/);
  assert.match(caseStudy, /Test source/);

  // Completed services and Work are approved routes; preview handoffs
  // and the homepage retain their existing publication gates.
  const servicePath = '/services/web-development/';
  const serviceCanonical = `https://www.elevatexlab.com${servicePath}`;
  const serviceHtml = await readFile(
    `${output}${servicePath}index.html`,
    'utf8',
  );
  const serviceTitle =
    'Web Development Services for Modern Businesses | ElevateX';
  assert.match(serviceHtml, /index, follow, max-image-preview:large/);
  assert.equal(
    [...serviceHtml.matchAll(/<h1\b/g)].length,
    1,
    'The service must have one real HTML H1',
  );
  const canonicalTags = [
    ...serviceHtml.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g),
  ];
  assert.equal(canonicalTags.length, 1, 'The service needs one canonical');
  assert.ok(canonicalTags[0][0].includes(`href="${serviceCanonical}"`));
  assert.ok(serviceHtml.includes(`<title>${serviceTitle}</title>`));
  const description = serviceHtml.match(
    /<meta\b[^>]*name="description"[^>]*content="([^"]+)"/,
  )?.[1];
  assert.ok(description, 'The service needs its own description');
  assert.ok(description.length >= 120 && description.length <= 180);
  for (const [attribute, name, value] of [
    ['property', 'og:title', serviceTitle],
    ['property', 'og:description', description],
    ['property', 'og:url', serviceCanonical],
    [
      'property',
      'og:image',
      'https://www.elevatexlab.com/images/social/web-development.png',
    ],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', serviceTitle],
    ['name', 'twitter:description', description],
    [
      'name',
      'twitter:image',
      'https://www.elevatexlab.com/images/social/web-development.png',
    ],
  ]) {
    const tag = serviceHtml.match(
      new RegExp(`<meta\\b[^>]*${attribute}="${name}"[^>]*>`),
    )?.[0];
    assert.ok(tag?.includes(`content="${value}"`), `Missing ${name} metadata`);
  }
  const schemas = [
    ...serviceHtml.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].flatMap((match) => {
    const schema = JSON.parse(match[1]);
    return Array.isArray(schema) ? schema : [schema];
  });
  const byType = (type) => schemas.filter((schema) => schema['@type'] === type);
  for (const type of [
    'Organization',
    'WebSite',
    'WebPage',
    'Service',
    'BreadcrumbList',
  ]) {
    assert.equal(
      byType(type).length,
      1,
      `The service needs one ${type} entity`,
    );
  }
  const organization = byType('Organization')[0];
  const website = byType('WebSite')[0];
  const webPage = byType('WebPage')[0];
  const service = byType('Service')[0];
  assert.equal(
    organization['@id'],
    'https://www.elevatexlab.com/#organization',
  );
  assert.equal(service.name, 'Web Development');
  assert.equal(service.url, serviceCanonical);
  assert.equal(service.description, description);
  assert.equal(service.provider['@id'], organization['@id']);
  assert.equal(website.publisher['@id'], organization['@id']);
  assert.equal(webPage.url, serviceCanonical);
  assert.equal(webPage['@id'], `${serviceCanonical}#webpage`);
  assert.equal(webPage.isPartOf['@id'], website['@id']);
  assert.deepEqual(byType('BreadcrumbList')[0].itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.elevatexlab.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Web Development',
      item: serviceCanonical,
    },
  ]);
  for (const property of [
    'aggregateRating',
    'review',
    'offers',
    'priceRange',
    'award',
    'areaServed',
  ]) {
    assert.equal(
      service[property],
      undefined,
      `Unverified Service field: ${property}`,
    );
  }
  const socialImage = await readFile(
    `${output}/images/social/web-development.png`,
  );
  assert.deepEqual(
    socialImage.subarray(0, 8),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  assert.equal(socialImage.toString('ascii', 12, 16), 'IHDR');
  assert.equal(socialImage.readUInt32BE(16), 1200);
  assert.equal(socialImage.readUInt32BE(20), 630);

  const sitemap = await readFile(`${output}/sitemap.xml`, 'utf8');
  const feed = await readFile(`${output}/insights/rss.xml`, 'utf8');
  assert.match(feed, /qa-published-fixture/);
  assert.doesNotMatch(feed, /qa-draft-fixture|qa-scheduled-fixture/);
  for (const slug of [
    'what-makes-a-website-convert-in-2026',
    'where-ai-automation-saves-businesses-time',
    'ai-chatbots-vs-traditional-customer-support',
  ]) {
    const html = await readFile(
      `${output}/insights/${slug}/index.html`,
      'utf8',
    );
    assert.match(html, /index, follow, max-image-preview:large/);
    assert.ok(html.includes(`https://www.elevatexlab.com/insights/${slug}/`));
    assert.match(
      html,
      /"@type":"Organization","@id":"https:\/\/www\.elevatexlab\.com\/#organization","name":"ElevateX"/,
    );
    assert.match(html, /"datePublished":"2026-10-16T00:00:00.000Z"/);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(sitemap.includes(`/insights/${slug}/`));
    assert.ok(feed.includes(`/insights/${slug}/`));
  }
  assert.match(sitemap, /\/insights\/qa-published-fixture\//);
  assert.match(sitemap, /\/work\/qa-case-fixture\//);
  assert.equal(sitemap.split(`<loc>${serviceCanonical}</loc>`).length - 1, 1);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.elevatexlab\.com\/<\/loc>/);
  assert.doesNotMatch(sitemap, /qa-draft-fixture|qa-scheduled-fixture/);
  const automationCanonical =
    'https://www.elevatexlab.com/services/ai-automation/';
  const automationHtml = await readFile(
    `${output}/services/ai-automation/index.html`,
    'utf8',
  );
  assert.match(
    automationHtml,
    /<title>AI Automation Services for Businesses \| ElevateX<\/title>/,
  );
  assert.match(automationHtml, /index, follow, max-image-preview:large/);
  assert.ok(
    automationHtml.includes(`rel="canonical" href="${automationCanonical}"`),
  );
  assert.equal([...automationHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal(
    [...automationHtml.matchAll(/name="automation-faq"/g)].length,
    10,
  );
  const automationSchemas = [
    ...automationHtml.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].flatMap((match) => JSON.parse(match[1]));
  for (const type of [
    'Organization',
    'WebSite',
    'WebPage',
    'Service',
    'BreadcrumbList',
  ])
    assert.equal(
      automationSchemas.filter((schema) => schema['@type'] === type).length,
      1,
    );
  const automationService = automationSchemas.find(
    (schema) => schema['@type'] === 'Service',
  );
  assert.equal(automationService.name, 'AI Automation');
  assert.equal(automationService.url, automationCanonical);
  assert.equal(automationService.provider['@id'], organization['@id']);
  for (const property of [
    'aggregateRating',
    'review',
    'offers',
    'priceRange',
    'award',
    'areaServed',
  ])
    assert.equal(automationService[property], undefined);
  const automationImage = await readFile(
    `${output}/images/social/ai-automation.png`,
  );
  assert.equal(automationImage.readUInt32BE(16), 1200);
  assert.equal(automationImage.readUInt32BE(20), 630);
  assert.equal(
    sitemap.split(`<loc>${automationCanonical}</loc>`).length - 1,
    1,
  );
  const chatbotCanonical = 'https://www.elevatexlab.com/services/ai-chatbots/';
  const chatbotHtml = await readFile(
    `${output}/services/ai-chatbots/index.html`,
    'utf8',
  );
  assert.match(
    chatbotHtml,
    /<title>AI Chatbot Development Services for Businesses \| ElevateX<\/title>/,
  );
  assert.match(chatbotHtml, /index, follow, max-image-preview:large/);
  assert.ok(chatbotHtml.includes(`rel="canonical" href="${chatbotCanonical}"`));
  assert.equal([...chatbotHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal([...chatbotHtml.matchAll(/name="chatbot-faq"/g)].length, 12);
  const chatbotSchemas = [
    ...chatbotHtml.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].flatMap((match) => JSON.parse(match[1]));
  for (const type of [
    'Organization',
    'WebSite',
    'WebPage',
    'Service',
    'BreadcrumbList',
  ])
    assert.equal(
      chatbotSchemas.filter((schema) => schema['@type'] === type).length,
      1,
    );
  const chatbotService = chatbotSchemas.find(
    (schema) => schema['@type'] === 'Service',
  );
  assert.equal(chatbotService.name, 'AI Chatbot Development');
  assert.equal(chatbotService.url, chatbotCanonical);
  assert.equal(chatbotService.provider['@id'], organization['@id']);
  for (const property of [
    'aggregateRating',
    'review',
    'offers',
    'priceRange',
    'award',
    'areaServed',
  ])
    assert.equal(chatbotService[property], undefined);
  const chatbotImage = await readFile(
    `${output}/images/social/ai-chatbots.png`,
  );
  assert.equal(chatbotImage.readUInt32BE(16), 1200);
  assert.equal(chatbotImage.readUInt32BE(20), 630);
  assert.equal(sitemap.split(`<loc>${chatbotCanonical}</loc>`).length - 1, 1);
  for (const alias of ['chatbots', 'ai-chatbot', 'chatbot-development'])
    assert.ok(
      !sitemap.includes(`<loc>https://www.elevatexlab.com/${alias}/</loc>`),
    );
  const landingCanonical =
    'https://www.elevatexlab.com/services/landing-pages/';
  const landingHtml = await readFile(
    `${output}/services/landing-pages/index.html`,
    'utf8',
  );
  assert.match(
    landingHtml,
    /<title>Landing Page Design &amp; Development Services \| ElevateX<\/title>/,
  );
  assert.match(landingHtml, /index, follow, max-image-preview:large/);
  assert.ok(landingHtml.includes(`rel="canonical" href="${landingCanonical}"`));
  assert.equal([...landingHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal([...landingHtml.matchAll(/name="landing-faq"/g)].length, 12);
  const landingSchemas = [
    ...landingHtml.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].flatMap((match) => JSON.parse(match[1]));
  for (const type of [
    'Organization',
    'WebSite',
    'WebPage',
    'Service',
    'BreadcrumbList',
  ])
    assert.equal(
      landingSchemas.filter((schema) => schema['@type'] === type).length,
      1,
    );
  const landingService = landingSchemas.find(
    (schema) => schema['@type'] === 'Service',
  );
  assert.equal(landingService.name, 'Landing Page Design & Development');
  assert.equal(landingService.url, landingCanonical);
  assert.equal(landingService.provider['@id'], organization['@id']);
  for (const property of [
    'aggregateRating',
    'review',
    'offers',
    'priceRange',
    'award',
    'areaServed',
  ])
    assert.equal(landingService[property], undefined);
  const landingImage = await readFile(
    `${output}/images/social/landing-pages.png`,
  );
  assert.equal(landingImage.readUInt32BE(16), 1200);
  assert.equal(landingImage.readUInt32BE(20), 630);
  assert.equal(sitemap.split(`<loc>${landingCanonical}</loc>`).length - 1, 1);
  for (const alias of [
    'landing-page',
    'landing-pages-design',
    'services/landing-page',
  ]) {
    assert.ok(
      !sitemap.includes(`<loc>https://www.elevatexlab.com/${alias}/</loc>`),
    );
    await assert.rejects(access(`${output}/${alias}/index.html`));
  }
  const qadeerHtml = await readFile(
    `${output}/work/qadeer-jewellers/index.html`,
    'utf8',
  );
  assert.match(qadeerHtml, /index, follow, max-image-preview:large/);
  assert.match(
    qadeerHtml,
    /Qadeer Jewellers — Website Design Showcase \| ElevateX/,
  );
  assert.match(qadeerHtml, /Illustrative Art Direction/);
  assert.match(qadeerHtml, /Concept project/);
  assert.match(qadeerHtml, /"@type":"CreativeWork"/);
  assert.equal([...qadeerHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal(
    sitemap.split(
      '<loc>https://www.elevatexlab.com/work/qadeer-jewellers/</loc>',
    ).length - 1,
    1,
  );
  const infinityHtml = await readFile(
    `${output}/work/infinity-salon/index.html`,
    'utf8',
  );
  assert.match(infinityHtml, /index, follow, max-image-preview:large/);
  assert.match(
    infinityHtml,
    /Infinity Salon — Beauty Website Design Showcase \| ElevateX/,
  );
  assert.match(infinityHtml, /Illustrative Art Direction/);
  assert.match(infinityHtml, /Concept project/);
  assert.match(infinityHtml, /"@type":"CreativeWork"/);
  assert.match(infinityHtml, /"datePublished":"2026-10-15T00:00:00.000Z"/);
  assert.equal([...infinityHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal(
    sitemap.split('<loc>https://www.elevatexlab.com/work/infinity-salon/</loc>')
      .length - 1,
    1,
  );
  const apexHtml = await readFile(
    `${output}/work/apex-detailing-studio/index.html`,
    'utf8',
  );
  assert.match(
    apexHtml,
    /Apex Detailing Studio — Website Design Showcase \| ElevateX/,
  );
  assert.match(apexHtml, /index, follow, max-image-preview:large/);
  assert.match(apexHtml, /currently uses Classic Detailers branding/);
  assert.match(apexHtml, /"@type":"CreativeWork"/);
  assert.equal([...apexHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal(
    sitemap.split(
      '<loc>https://www.elevatexlab.com/work/apex-detailing-studio/</loc>',
    ).length - 1,
    1,
  );
  const engineHtml = await readFile(
    `${output}/qa-engine-preview/index.html`,
    'utf8',
  );
  assert.match(engineHtml, /QA Only Engine Fixture/);
  assert.match(engineHtml, /noindex, follow/);
  assert.match(engineHtml, /A reordered story/);
  assert.equal([...engineHtml.matchAll(/<h1\b/g)].length, 1);
  for (const id of ['apex-detailing', 'qa-engine-fixture']) {
    assert.doesNotMatch(sitemap, new RegExp(`/work/${id}/`));
    await assert.rejects(access(`${output}/work/${id}/index.html`));
  }
  for (const slug of ['qa-draft-fixture', 'qa-scheduled-fixture']) {
    await assert.rejects(access(`${output}/insights/${slug}/index.html`));
  }
  const robots = await readFile(`${output}/robots.txt`, 'utf8');
  const workHtml = await readFile(`${output}/work/index.html`, 'utf8');
  assert.doesNotMatch(
    workHtml,
    /QA Only Engine Fixture|qa-engine-fixture|qa-engine-preview/,
  );
  assert.doesNotMatch(sitemap, /qa-engine-fixture|qa-engine-preview/);
  assert.match(workHtml, /index, follow, max-image-preview:large/);
  assert.match(workHtml, /Selected Work &amp; Website Projects \| ElevateX/);
  assert.match(workHtml, /"@type":"CollectionPage"/);
  assert.match(workHtml, /"@type":"ItemList"/);
  assert.equal([...workHtml.matchAll(/<h1\b/g)].length, 1);
  assert.equal(
    sitemap.split('<loc>https://www.elevatexlab.com/work/</loc>').length - 1,
    1,
  );
  for (const id of ['defence-marquee', 'fortress-vision', 'bridal-house']) {
    await assert.rejects(access(`${output}/work/${id}/index.html`));
    assert.ok(!sitemap.includes(`/work/${id}/`));
  }
  const aboutHtml = await readFile(`${output}/about/index.html`, 'utf8');
  assert.match(
    aboutHtml,
    /About — Websites, AI &amp; Digital Systems \| ElevateX/,
  );
  assert.match(aboutHtml, /index, follow, max-image-preview:large/);
  assert.doesNotMatch(aboutHtml, /http-equiv="refresh"/);
  assert.equal([...aboutHtml.matchAll(/<h1\b/g)].length, 1);
  const aboutSchemas = JSON.parse(
    aboutHtml.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )[1],
  );
  for (const type of [
    'Organization',
    'WebSite',
    'AboutPage',
    'Person',
    'BreadcrumbList',
  ])
    assert.equal(
      aboutSchemas.filter((item) => item['@type'] === type).length,
      1,
    );
  const aboutOrganization = aboutSchemas.find(
    (item) => item['@type'] === 'Organization',
  );
  const aboutFounder = aboutSchemas.find((item) => item['@type'] === 'Person');
  assert.equal(aboutFounder.name, 'Hamid');
  assert.equal(aboutFounder['@id'], aboutOrganization.founder['@id']);
  assert.equal(aboutFounder.worksFor['@id'], aboutOrganization['@id']);
  assert.equal(
    aboutSchemas.find((item) => item['@type'] === 'AboutPage').url,
    'https://www.elevatexlab.com/about/',
  );
  assert.equal(
    sitemap.split('<loc>https://www.elevatexlab.com/about/</loc>').length - 1,
    1,
  );
  const contactHtml = await readFile(`${output}/contact/index.html`, 'utf8');
  assert.match(
    contactHtml,
    /Contact — Start a Website or AI Project \| ElevateX/,
  );
  assert.match(contactHtml, /noindex, follow/);
  assert.match(contactHtml, /"@type":"ContactPage"/);
  assert.match(contactHtml, /https:\/\/www\.elevatexlab\.com\/contact\//);
  assert.match(contactHtml, /Inquiry preview — sending is not available yet/);
  assert.doesNotMatch(contactHtml, /http-equiv="refresh"|type="submit"/);
  assert.equal([...contactHtml.matchAll(/<h1\b/g)].length, 1);
  assert.ok(
    !sitemap.includes('<loc>https://www.elevatexlab.com/contact/</loc>'),
  );
  for (const slug of [
    'web-development',
    'ai-automation',
    'ai-chatbots',
    'landing-pages',
  ]) {
    const html = await readFile(
      `${output}/services/${slug}/index.html`,
      'utf8',
    );
    assert.ok(html.includes(`/contact/?service=${slug}`));
  }
  for (const destination of ['services']) {
    await assert.rejects(access(`${output}/${destination}/index.html`));
    assert.ok(
      !sitemap.includes(
        `<loc>https://www.elevatexlab.com/${destination}/</loc>`,
      ),
    );
  }
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
  assert.match(robots, /User-agent: GPTBot\nAllow: \//);
  assert.match(
    await readFile(`${output}/index.html`, 'utf8'),
    /noindex, follow/,
  );
  assert.doesNotMatch(
    await readFile(`${output}/index.html`, 'utf8'),
    /<button[^>]*data-motion-replay/,
    'Local animation review controls must not ship in production HTML',
  );
  console.log(
    'Publication integration passed: services, About/founder graph, approved routes, case-study evidence, drafts, scheduling, sitemap and production robots.',
  );
} finally {
  for (const file of created) await unlink(file);
  // Keep the ordinary dist/ untouched; fixture output is ignored by Git.
  await mkdir(path.dirname(output), { recursive: true });
}
