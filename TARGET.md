# Clone Target — Esther K. Shin Therapy

This repo uses an Astro-specific adaptation of the external `clone-site` skill. The goal is to pull a high-fidelity/carbon-copy reference of the current Squarespace site, then rebuild it in Astro with controlled improvements.

## Source site

- Original Squarespace URL: https://www.ekstherapy.com/
- Current Astro/Vercel preview: https://ekstherapy-website.vercel.app/
- Local repo: `/Users/agent/ekstherapy-website`

## Clone scope

| Source page | Astro target route | Notes |
|---|---|---|
| `/` | `/` | Homepage, logo story, main brand impression |
| `/about` | `/about/` | Esther bio, credentials, services/approach |
| `/faqs` | `/faqs/` | Fees, insurance, location, teletherapy, logistics |
| `/get-in-touch` | `/contact/` | Contact form and conversion path |

If a source page redirects or 404s, capture the actual response and update `docs/research/original-site/PAGE_TOPOLOGY.md` instead of guessing.

## Carbon-copy intent

The extractor should preserve:

- real text and page hierarchy
- real assets and original asset URLs
- rendered screenshots at desktop and mobile
- computed design tokens: colors, fonts, spacing, borders, radii, shadows
- section-level layout measurements
- form fields and CTA labels
- navigation/footer topology

The Astro implementation may improve UX later, but the raw clone artifacts should stay as a faithful baseline.

## Commands

```bash
npm install
npm run clone:extract
npm run build
```

Outputs:

- `docs/design-references/original/` — desktop/mobile screenshots
- `docs/research/original-site/` — content inventory, topology, tokens, computed snapshots
- `public/original-assets/` — downloaded source assets for local Astro use
