# Astro Carbon-Copy Clone Workflow

This is the project-specific adaptation of Eric Siu's `clone-site` skill for Esther K. Shin Therapy.

The external skill assumes Claude Code + Chrome MCP + Next.js/Tailwind/shadcn. This repo uses Astro, plain CSS, Vercel static output, and a therapy-site redesign process. So the workflow here keeps the useful parts — rendered evidence, computed styles, real assets, section specs, visual QA — and removes the stack-specific assumptions.

## Goal

Pull a faithful baseline of the original Squarespace site before redesigning it.

A good clone baseline lets us answer:

1. What did the original site actually say?
2. What pages/routes/assets exist?
3. What visual system did Squarespace render: colors, fonts, radii, spacing, photo crops, breakpoints?
4. Which pieces should be preserved exactly versus improved in Astro?

## Project setup

- Source: `https://www.ekstherapy.com/`
- Local repo: `/Users/agent/ekstherapy-website`
- Framework: Astro static site
- Deployment: Vercel
- Current pages: Home, About, FAQs, Contact
- Route mapping is stored in `TARGET.md`

## Commands

```bash
cd /Users/agent/ekstherapy-website
npm install
npm run clone:extract
npm run build
```

The extraction command creates:

```text
docs/
  design-references/original/
    home-desktop.png
    home-mobile.png
    about-desktop.png
    about-mobile.png
    ...
  research/original-site/
    PAGE_TOPOLOGY.md
    CONTENT_INVENTORY.md
    DESIGN_TOKENS.json
    ASSETS.json
    snapshots/*.json
public/
  original-assets/
    home/*
    about/*
    faqs/*
    get-in-touch/*
```

## Workflow

### 1. Extract first, do not redesign first

Run `npm run clone:extract` before changing page code.

Completion criteria:

- screenshots exist for every scoped page at desktop and mobile
- `CONTENT_INVENTORY.md` lists headings, paragraphs, links, forms, and images
- `DESIGN_TOKENS.json` contains real computed colors/fonts/radii/shadows
- `ASSETS.json` maps original URLs to local downloaded files

### 2. Treat extracted artifacts as the carbon-copy baseline

Use extracted screenshots and JSON as evidence. Do not claim a color, font, crop, or spacing value unless it appears in the artifacts or a rendered screenshot.

For Esther's site, preserve these brand anchors unless Victor changes direction:

```css
--rust: #AF6347;
--cream: #F6F2EF;
--sand: #F1EBE5;
--taupe: #CBBEB6;
--brown-gray: #7B635A;
--charcoal-brown: #61433E;
--sage: #597562;
--soft-sage: #728E79;
```

### 3. Write section specs before Astro implementation

For each page, create or update a spec under `docs/research/original-site/specs/` before coding.

Recommended files:

- `home.md`
- `about.md`
- `faqs.md`
- `contact.md`

Each spec should include:

- source route and Astro route
- screenshot references
- section list in order
- exact text/content to preserve
- local assets to use
- computed style notes: background, color, font, spacing, border radius
- interaction/form behavior
- deliberate deviations/improvements, if any

### 4. Build in Astro using real content/assets

Implementation should prefer:

- `src/layouts/BaseLayout.astro` for global tokens/nav/footer
- componentized sections only when repetition is real
- local assets from `public/original-assets/` or curated `public/images/`
- CSS variables for original brand tokens
- semantic HTML for SEO/accessibility

Avoid:

- fake placeholder copy
- invented imagery
- switching the site into a generic startup/SaaS layout
- hiding practical information that matters to prospective therapy clients

### 5. Visual QA against original

After implementation:

1. Run `npm run build`.
2. Capture local Astro screenshots at desktop/mobile.
3. Compare against `docs/design-references/original/`.
4. Fix obvious mismatches if the goal is carbon copy; document deliberate deviations if the goal is improved UX.

For carbon-copy mode, acceptable differences should be intentional, small, and named.

## Carbon-copy versus redesign mode

Use this distinction explicitly:

| Mode | Goal | Allowed changes |
|---|---|---|
| Carbon-copy baseline | Preserve original Squarespace experience as evidence | Only technical migration fixes |
| Brand-preserving redesign | Improve user journey while staying recognizably Esther's brand | Better hierarchy, clearer CTAs, better page structure, mobile polish |

Victor's current direction is: **carbon-copy baseline first, then iterate from there.**

## Pitfalls

1. **Do not trust source HTML alone.** Squarespace styles are rendered. Use screenshots and computed styles.
2. **Do not lose source URLs.** Keep original asset URLs in `ASSETS.json` even after downloading local copies.
3. **Do not mistake failed pages for absent pages.** Record status/redirect/404 in `PAGE_TOPOLOGY.md`.
4. **Do not overwrite redesigned work blindly.** If applying a carbon copy to production pages, commit first or work in a branch.
5. **Do not overfit to Next.js.** This repo is Astro; no shadcn/Tailwind/Next app assumptions.

## Verification checklist

- [ ] `npm run clone:extract` exits 0
- [ ] each scoped page has desktop and mobile screenshots
- [ ] image assets download to `public/original-assets/`
- [ ] content inventory is readable and page-specific
- [ ] design token JSON is populated from computed styles
- [ ] `npm run build` exits 0 after any implementation changes
- [ ] git status shows only intentional artifacts/code changes
