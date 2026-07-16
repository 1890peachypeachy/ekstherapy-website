import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const SOURCE_ORIGIN = process.env.CLONE_SOURCE_ORIGIN || 'https://www.ekstherapy.com';

const ROUTES = [
  { label: 'home', sourcePath: '/', astroRoute: '/' },
  { label: 'about', sourcePath: '/about', astroRoute: '/about/' },
  { label: 'faqs', sourcePath: '/faqs', astroRoute: '/faqs/' },
  { label: 'get-in-touch', sourcePath: '/get-in-touch', astroRoute: '/contact/' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 1200 },
];

const out = {
  screenshots: path.join(ROOT, 'docs/design-references/original'),
  research: path.join(ROOT, 'docs/research/original-site'),
  snapshots: path.join(ROOT, 'docs/research/original-site/snapshots'),
  specs: path.join(ROOT, 'docs/research/original-site/specs'),
  assets: path.join(ROOT, 'public/original-assets'),
};

async function ensureDirs() {
  await Promise.all(Object.values(out).map((dir) => fs.mkdir(dir, { recursive: true })));
}

function absoluteUrl(sourcePath) {
  return new URL(sourcePath, SOURCE_ORIGIN).toString();
}

function fileSafe(input) {
  return String(input || 'asset')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'asset';
}

function extFromContentType(contentType) {
  if (!contentType) return '';
  if (contentType.includes('jpeg')) return '.jpg';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('svg')) return '.svg';
  if (contentType.includes('mp4')) return '.mp4';
  if (contentType.includes('woff2')) return '.woff2';
  if (contentType.includes('woff')) return '.woff';
  return '';
}

async function downloadAsset(asset, routeLabel) {
  if (!asset?.url || !/^https?:/i.test(asset.url)) return null;

  try {
    const response = await fetch(asset.url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AstroCloneExtractor/1.0)',
      },
    });
    if (!response.ok) {
      return { ...asset, downloaded: false, status: response.status, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type') || '';
    const buffer = Buffer.from(await response.arrayBuffer());
    const hash = crypto.createHash('sha1').update(asset.url).digest('hex').slice(0, 10);
    const urlPath = new URL(asset.url).pathname;
    const parsed = path.parse(urlPath);
    const inferredExt = parsed.ext || extFromContentType(contentType) || '.bin';
    const basename = fileSafe(parsed.name || asset.kind || 'asset');
    const localDir = path.join(out.assets, routeLabel);
    await fs.mkdir(localDir, { recursive: true });
    const localFile = path.join(localDir, `${hash}-${basename}${inferredExt}`);
    await fs.writeFile(localFile, buffer);

    return {
      ...asset,
      downloaded: true,
      status: response.status,
      contentType,
      bytes: buffer.length,
      localPath: path.relative(ROOT, localFile),
    };
  } catch (error) {
    return { ...asset, downloaded: false, error: error.message };
  }
}

async function safeGoto(page, url) {
  let response = null;
  try {
    response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(750);
  } catch (error) {
    return { response, error: error.message };
  }
  return { response, error: null };
}

async function extractPage(page, route) {
  return page.evaluate(({ sourceUrl, sourcePath, astroRoute, label }) => {
    const text = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();
    const attr = (node, name) => node?.getAttribute(name) || '';
    const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const importantStyle = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: typeof el.className === 'string' ? el.className : null,
        text: clean(el.innerText).slice(0, 220),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        display: cs.display,
        position: cs.position,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        margin: cs.margin,
        padding: cs.padding,
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        gap: cs.gap,
        gridTemplateColumns: cs.gridTemplateColumns,
        flexDirection: cs.flexDirection,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
      };
    };

    const cssUrlToAbs = (cssUrl) => {
      const match = String(cssUrl || '').match(/url\(["']?([^"')]+)["']?\)/i);
      if (!match) return '';
      try { return new URL(match[1], location.href).toString(); } catch { return ''; }
    };

    const allElements = Array.from(document.querySelectorAll('*'));
    const sampledElements = [
      document.body,
      document.querySelector('header'),
      document.querySelector('nav'),
      document.querySelector('main'),
      ...Array.from(document.querySelectorAll('section, article, footer, .section, .sqs-block, .content, .container')).slice(0, 28),
      ...Array.from(document.querySelectorAll('a, button, input, textarea, select')).slice(0, 30),
    ].filter(Boolean);

    const computedSamples = sampledElements.map(importantStyle);

    const colors = new Set();
    const fonts = new Set();
    const fontSizes = new Set();
    const radii = new Set();
    const shadows = new Set();
    const spacing = new Set();

    for (const el of allElements.slice(0, 800)) {
      const cs = getComputedStyle(el);
      [cs.color, cs.backgroundColor, cs.borderColor].forEach((v) => v && v !== 'rgba(0, 0, 0, 0)' && colors.add(v));
      if (cs.fontFamily) fonts.add(cs.fontFamily);
      if (cs.fontSize) fontSizes.add(cs.fontSize);
      if (cs.borderRadius && cs.borderRadius !== '0px') radii.add(cs.borderRadius);
      if (cs.boxShadow && cs.boxShadow !== 'none') shadows.add(cs.boxShadow);
      [cs.marginTop, cs.marginBottom, cs.paddingTop, cs.paddingBottom, cs.gap].forEach((v) => v && v !== '0px' && spacing.add(v));
    }

    const backgroundAssets = allElements
      .map((el) => ({
        kind: 'background-image',
        url: cssUrlToAbs(getComputedStyle(el).backgroundImage),
        selector: el.id ? `#${el.id}` : (typeof el.className === 'string' && el.className ? `.${el.className.split(/\s+/).slice(0, 3).join('.')}` : el.tagName.toLowerCase()),
        alt: '',
      }))
      .filter((item) => item.url);

    const assets = [
      ...Array.from(document.images).map((img) => ({
        kind: 'img',
        url: img.currentSrc || img.src,
        src: img.getAttribute('src') || '',
        alt: img.alt || '',
        width: img.naturalWidth || img.width || null,
        height: img.naturalHeight || img.height || null,
      })),
      ...Array.from(document.querySelectorAll('source[srcset], img[srcset]')).flatMap((node) => {
        const srcset = attr(node, 'srcset');
        return srcset.split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean).map((src) => ({
          kind: 'srcset',
          url: new URL(src, location.href).toString(),
          alt: '',
        }));
      }),
      ...Array.from(document.querySelectorAll('video[src], video source[src]')).map((node) => ({
        kind: 'video',
        url: new URL(attr(node, 'src'), location.href).toString(),
        alt: '',
      })),
      ...Array.from(document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], meta[property="og:image"], meta[name="twitter:image"]')).map((node) => {
        const raw = attr(node, 'href') || attr(node, 'content');
        return raw ? { kind: 'metadata-image', url: new URL(raw, location.href).toString(), alt: attr(node, 'property') || attr(node, 'name') || attr(node, 'rel') } : null;
      }).filter(Boolean),
      ...backgroundAssets,
    ];

    const uniqueAssets = Array.from(new Map(assets.filter((a) => a.url).map((a) => [a.url, a])).values());

    const forms = Array.from(document.forms).map((form) => ({
      action: form.action || '',
      method: form.method || 'get',
      fields: Array.from(form.querySelectorAll('input, textarea, select, button')).map((field) => ({
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute('type') || field.tagName.toLowerCase(),
        name: field.getAttribute('name') || '',
        label: text(document.querySelector(`label[for="${field.id}"]`)) || field.getAttribute('aria-label') || field.getAttribute('placeholder') || '',
        placeholder: field.getAttribute('placeholder') || '',
        required: Boolean(field.required),
        text: text(field),
      })),
    }));

    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      text: text(a),
      href: a.href,
      localPath: (() => { try { return new URL(a.href).pathname; } catch { return ''; } })(),
    }));

    return {
      route: { label, sourceUrl, sourcePath, astroRoute, finalUrl: location.href },
      document: {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        lang: document.documentElement.lang || '',
      },
      content: {
        headings: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({ level: h.tagName.toLowerCase(), text: text(h) })),
        paragraphs: Array.from(document.querySelectorAll('p, li, blockquote')).map((p) => text(p)).filter(Boolean),
        buttons: Array.from(document.querySelectorAll('button, a')).filter((el) => /button|btn|sqs-block-button|cta/i.test(el.className || '') || el.tagName.toLowerCase() === 'button').map((el) => ({ text: text(el), href: el.href || '' })).filter((item) => item.text || item.href),
        links,
        forms,
      },
      assets: uniqueAssets,
      designTokens: {
        colors: Array.from(colors).slice(0, 120),
        fonts: Array.from(fonts).slice(0, 40),
        fontSizes: Array.from(fontSizes).sort((a, b) => parseFloat(a) - parseFloat(b)),
        radii: Array.from(radii).slice(0, 40),
        shadows: Array.from(shadows).slice(0, 40),
        spacing: Array.from(spacing).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 80),
      },
      computedSamples,
    };
  }, { sourceUrl: absoluteUrl(route.sourcePath), sourcePath: route.sourcePath, astroRoute: route.astroRoute, label: route.label });
}

function pageTopologyMarkdown(results) {
  const lines = [
    '# Original Site Page Topology',
    '',
    `Source origin: ${SOURCE_ORIGIN}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Label | Source path | Final URL | Status | Astro route | Screenshots |',
    '|---|---|---|---:|---|---|',
  ];

  for (const result of results) {
    const shots = VIEWPORTS.map((v) => `docs/design-references/original/${result.route.label}-${v.name}.png`).join('<br>');
    lines.push(`| ${result.route.label} | \`${result.route.sourcePath}\` | ${result.route.finalUrl} | ${result.status ?? 'n/a'} | \`${result.route.astroRoute}\` | ${shots} |`);
    if (result.error) lines.push(`| ${result.route.label} error |  | ${result.error} |  |  |  |`);
  }

  lines.push('', '## Navigation links discovered', '');
  for (const result of results) {
    lines.push(`### ${result.route.label}`);
    const localLinks = result.content.links
      .filter((link) => link.href && link.href.startsWith(SOURCE_ORIGIN))
      .slice(0, 40);
    if (!localLinks.length) lines.push('- No same-origin links found.');
    for (const link of localLinks) lines.push(`- ${link.text || '(no text)'} → ${link.localPath}`);
    lines.push('');
  }
  return lines.join('\n');
}

function contentInventoryMarkdown(results) {
  const lines = ['# Original Site Content Inventory', '', `Generated: ${new Date().toISOString()}`, ''];

  for (const result of results) {
    lines.push(`## ${result.route.label}`);
    lines.push('', `- Source: ${result.route.finalUrl}`, `- Astro route: \`${result.route.astroRoute}\``, `- Title: ${result.document.title || '(missing)'}`, `- Meta description: ${result.document.metaDescription || '(missing)'}`, '');

    lines.push('### Headings');
    if (!result.content.headings.length) lines.push('- None found.');
    for (const h of result.content.headings) lines.push(`- ${h.level}: ${h.text}`);
    lines.push('');

    lines.push('### Body copy');
    const paragraphs = result.content.paragraphs.filter((p, index, arr) => p && arr.indexOf(p) === index).slice(0, 120);
    if (!paragraphs.length) lines.push('- None found.');
    for (const p of paragraphs) lines.push(`- ${p}`);
    lines.push('');

    lines.push('### Buttons / CTAs');
    if (!result.content.buttons.length) lines.push('- None found.');
    for (const button of result.content.buttons) lines.push(`- ${button.text || '(no text)'}${button.href ? ` → ${button.href}` : ''}`);
    lines.push('');

    lines.push('### Forms');
    if (!result.content.forms.length) lines.push('- None found.');
    for (const form of result.content.forms) {
      lines.push(`- Form: ${form.method.toUpperCase()} ${form.action || '(no action)'}`);
      for (const field of form.fields) {
        lines.push(`  - ${field.tag}/${field.type} name=\`${field.name}\` label=\`${field.label}\`${field.required ? ' required' : ''}`);
      }
    }
    lines.push('');

    lines.push('### Assets');
    if (!result.downloadedAssets.length) lines.push('- None downloaded.');
    for (const asset of result.downloadedAssets.slice(0, 80)) {
      lines.push(`- ${asset.kind}: ${asset.url}${asset.localPath ? ` → \`${asset.localPath}\`` : ''}${asset.alt ? ` — ${asset.alt}` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function tokenSummary(results) {
  const merge = (key) => Array.from(new Set(results.flatMap((r) => r.designTokens[key] || [])));
  return {
    sourceOrigin: SOURCE_ORIGIN,
    generatedAt: new Date().toISOString(),
    routes: results.map((r) => ({ label: r.route.label, sourcePath: r.route.sourcePath, finalUrl: r.route.finalUrl, status: r.status })),
    colors: merge('colors'),
    fonts: merge('fonts'),
    fontSizes: merge('fontSizes'),
    radii: merge('radii'),
    shadows: merge('shadows'),
    spacing: merge('spacing'),
    samplesByPage: Object.fromEntries(results.map((r) => [r.route.label, r.computedSamples])),
  };
}

function starterSpec(routeLabel, result) {
  return `# Section Spec — ${routeLabel}\n\nSource: ${result.route.finalUrl}\nAstro route: \`${result.route.astroRoute}\`\n\nScreenshots:\n\n- \`docs/design-references/original/${routeLabel}-desktop.png\`\n- \`docs/design-references/original/${routeLabel}-mobile.png\`\n\n## Sections\n\nTODO: Translate the extracted headings/body copy below into ordered sections before coding.\n\n## Content to preserve\n\n### Headings\n\n${result.content.headings.map((h) => `- ${h.level}: ${h.text}`).join('\n') || '- None found'}\n\n### Key body copy\n\n${result.content.paragraphs.slice(0, 25).map((p) => `- ${p}`).join('\n') || '- None found'}\n\n## Assets\n\n${result.downloadedAssets.filter((a) => a.localPath).slice(0, 30).map((a) => `- \`${a.localPath}\` from ${a.url}${a.alt ? ` — ${a.alt}` : ''}`).join('\n') || '- No local assets downloaded'}\n\n## Computed style notes\n\nSee \`docs/research/original-site/snapshots/${routeLabel}.json\` and \`docs/research/original-site/DESIGN_TOKENS.json\`.\n\n## Deliberate deviations\n\n- None yet. Carbon-copy baseline mode should avoid UX/design changes until the source is preserved.\n`;
}

async function main() {
  await ensureDirs();

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const route of ROUTES) {
      console.log(`\n=== Extracting ${route.label}: ${absoluteUrl(route.sourcePath)} ===`);
      const context = await browser.newContext({ viewport: VIEWPORTS[0] });
      const page = await context.newPage();
      const { response, error } = await safeGoto(page, absoluteUrl(route.sourcePath));

      const extracted = await extractPage(page, route).catch((extractError) => ({
        route: { label: route.label, sourceUrl: absoluteUrl(route.sourcePath), sourcePath: route.sourcePath, astroRoute: route.astroRoute, finalUrl: page.url() },
        document: {},
        content: { headings: [], paragraphs: [], buttons: [], links: [], forms: [] },
        assets: [],
        designTokens: { colors: [], fonts: [], fontSizes: [], radii: [], shadows: [], spacing: [] },
        computedSamples: [],
        extractError: extractError.message,
      }));

      extracted.status = response?.status() ?? null;
      extracted.error = error || extracted.extractError || null;
      extracted.downloadedAssets = [];

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(extracted.route.finalUrl || absoluteUrl(route.sourcePath), { waitUntil: 'domcontentloaded', timeout: 45_000 }).catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await page.screenshot({ path: path.join(out.screenshots, `${route.label}-${viewport.name}.png`), fullPage: true });
        console.log(`screenshot: docs/design-references/original/${route.label}-${viewport.name}.png`);
      }

      const assets = extracted.assets || [];
      for (const asset of assets) {
        const downloaded = await downloadAsset(asset, route.label);
        if (downloaded) extracted.downloadedAssets.push(downloaded);
      }
      console.log(`assets: ${extracted.downloadedAssets.filter((a) => a.downloaded).length}/${assets.length} downloaded`);

      await fs.writeFile(path.join(out.snapshots, `${route.label}.json`), JSON.stringify(extracted, null, 2));
      await fs.writeFile(path.join(out.specs, `${route.label}.md`), starterSpec(route.label, extracted));
      results.push(extracted);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(path.join(out.research, 'PAGE_TOPOLOGY.md'), pageTopologyMarkdown(results));
  await fs.writeFile(path.join(out.research, 'CONTENT_INVENTORY.md'), contentInventoryMarkdown(results));
  await fs.writeFile(path.join(out.research, 'DESIGN_TOKENS.json'), JSON.stringify(tokenSummary(results), null, 2));
  await fs.writeFile(path.join(out.research, 'ASSETS.json'), JSON.stringify({
    sourceOrigin: SOURCE_ORIGIN,
    generatedAt: new Date().toISOString(),
    assets: results.flatMap((r) => r.downloadedAssets.map((asset) => ({ page: r.route.label, ...asset }))),
  }, null, 2));

  console.log('\nDone. Review docs/ASTRO_CARBON_COPY_CLONE.md and docs/research/original-site/.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
