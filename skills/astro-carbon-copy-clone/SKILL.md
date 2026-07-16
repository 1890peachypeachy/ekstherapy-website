---
name: astro-carbon-copy-clone
description: Use when cloning or migrating an existing website into this Astro/Vercel repo while preserving a carbon-copy baseline first: screenshots, computed styles, content inventory, assets, route topology, section specs, and visual QA before redesigning.
version: 1.0.0
author: Sila / Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [astro, website-migration, clone-site, squarespace, visual-qa]
    related_skills: [website-redesign-sketching, codebase-inspection]
---

# Astro Carbon-Copy Clone

## Overview

Adapted from the external `clone-site` methodology for this repo's setup: Astro static site, Vercel deployment, plain CSS, and brand-preserving redesign work.

Use this skill to create a faithful baseline of a source website before improving it. The baseline should capture rendered evidence, exact content, assets, design tokens, page topology, and section specs. Only then should the Astro implementation be modified.

This is especially useful for Squarespace → Astro migrations where source HTML alone is insufficient because important style/layout behavior is rendered by the platform.

## When to Use

- Victor asks to clone, copy, carbon-copy, migrate, or reverse-engineer a website into Astro.
- The current site should be used as a starting foundation before redesign.
- A live site needs to be preserved before UX changes.
- You need reliable screenshots/assets/tokens instead of guessing from memory.

Do not use this as a generic redesign-only workflow. If Victor wants new design directions, use `website-redesign-sketching` after this baseline is captured.

## Inputs

Create or update `TARGET.md` with:

- source URL
- local repo path
- framework/deploy target
- route mapping from source page → Astro route
- pages that must be captured
- whether the goal is carbon-copy baseline or brand-preserving redesign

Example route mapping:

| Source page | Astro target route |
|---|---|
| `/` | `/` |
| `/about` | `/about/` |
| `/faqs` | `/faqs/` |
| `/get-in-touch` | `/contact/` |

## Standard Outputs

```text
docs/
  design-references/original/
    <page>-desktop.png
    <page>-mobile.png
  research/original-site/
    PAGE_TOPOLOGY.md
    CONTENT_INVENTORY.md
    DESIGN_TOKENS.json
    ASSETS.json
    snapshots/<page>.json
    specs/<page>.md
public/
  original-assets/<page>/...
```

## Workflow

### 1. Preflight

From the repo root:

```bash
npm install
npm run build
```

Completion criteria:

- dependencies installed
- current app builds before extraction/implementation changes
- git status checked so generated artifacts are recognizable

### 2. Extract rendered source evidence

Use Playwright or browser automation to capture every scoped route at desktop and mobile.

Required extraction:

- response status and final URL
- full-page screenshots
- title and meta description
- navigation and footer links
- headings in order
- paragraphs/block text
- CTA/button labels
- forms and field names/types/required state
- image/video/SVG assets and original URLs
- computed style samples from body, nav, header/hero, sections, cards, buttons, form controls
- unique colors, fonts, radii, shadows, and spacing values

Completion criteria:

- screenshots exist for each page/viewport
- `PAGE_TOPOLOGY.md` records status/redirects/404s instead of hiding failures
- `CONTENT_INVENTORY.md` is useful to implement from without revisiting the browser
- `DESIGN_TOKENS.json` has computed values, not guessed palette notes
- `ASSETS.json` maps original asset URLs to local downloaded paths

### 3. Write section specs before coding

For each page, write `docs/research/original-site/specs/<page>.md`.

Each spec must include:

- source route and Astro route
- screenshot references
- ordered section list
- exact text to preserve
- local assets to use
- important computed styles
- forms/interactions
- deliberate deviations, if any

Completion criteria:

- an agent can implement the page without guessing text/assets/style
- deviations are explicit, not accidental

### 4. Implement in Astro

Use the repo's actual structure. Prefer:

- `src/layouts/BaseLayout.astro` for global tokens/nav/footer
- `src/pages/*.astro` for routes
- `public/original-assets/` for raw cloned assets
- `public/images/` for curated production assets
- CSS variables for source tokens
- semantic HTML for accessibility and SEO

Avoid:

- Next.js/Tailwind/shadcn assumptions unless the repo already uses them
- placeholder copy/assets
- claiming pixel-perfect fidelity without screenshot QA
- hiding source-route failures

### 5. Visual QA

After implementing:

```bash
npm run build
```

Then capture local screenshots at the same viewport sizes and compare them to `docs/design-references/original/`.

Completion criteria:

- production build passes
- desktop/mobile screenshots exist for original and local implementation
- obvious spacing/color/asset/crop bugs are fixed
- any UX improvements are documented as intentional deviations

## Carbon-copy versus Redesign Mode

| Mode | Purpose | Allowed changes |
|---|---|---|
| Carbon-copy baseline | Preserve current live site as evidence/foundation | Technical migration fixes only |
| Brand-preserving redesign | Improve journey while staying recognizable | Better hierarchy, CTAs, layout, mobile, SEO |

Always capture carbon-copy baseline first when Victor says "foundation," "copy/paste," or "carbon copy."

## Common Pitfalls

1. **Relying on extracted HTML only.** Squarespace styles are rendered; use computed styles and screenshots.
2. **Skipping route failures.** A 404/redirect is important topology evidence.
3. **Downloading assets without source mapping.** Keep original URL → local path mappings.
4. **Turning clone into redesign too early.** First preserve, then improve.
5. **Using Next.js assumptions.** This workflow is Astro/Vercel unless the repo says otherwise.
6. **Not checking git status.** Generated artifacts can be large; know what you changed before committing.

## Verification Checklist

- [ ] `TARGET.md` route map exists
- [ ] preflight `npm run build` passes or failure is documented
- [ ] extraction command exits 0
- [ ] screenshots for all scoped pages and viewports exist
- [ ] content inventory, topology, tokens, and assets files exist
- [ ] section specs exist before implementation
- [ ] Astro production build passes after implementation
- [ ] generated assets/artifacts are reviewed before commit
