# Redesign Research — Esther K. Shin Therapy

Date: 2026-07-15
Live target: https://ekstherapy-website.vercel.app/
Original reference: https://www.ekstherapy.com/

## Constraints

- Same pages: Home, About, FAQs, Get in Touch
- Same core brand feel: warm, gentle, relational, calm, healing/wholeness language
- Better UX: clearer prospective-client journey, stronger conversion to consultation, local SEO, agent-friendly semantic HTML
- Design can be completely new, but should visibly descend from the original Squarespace site

## Original website visual language to preserve

Captured screenshots:

- `/tmp/ekstherapy-original/original-home-desktop.png`
- `/tmp/ekstherapy-original/original-home-mobile.png`
- `/tmp/ekstherapy-original/original-about-desktop.png`
- `/tmp/ekstherapy-original/original-faqs-desktop.png`
- `/tmp/ekstherapy-original/original-contact-desktop.png`

Observed original traits:

1. **Warm calm, not corporate healthcare**
   - Original uses warm neutral/soft natural tones.
   - The emotional register is quiet, relational, reassuring.

2. **Photography-forward**
   - Original relies heavily on Esther's professional portraits and nature/interior imagery.
   - The new site should not reduce photos to small decorations; images should act as editorial anchors.

3. **Logo symbolism matters**
   - Lotus + marigold story is part of the brand narrative and should remain, but not dominate the hero.

4. **Editorial pacing**
   - Original Squarespace layout had a more magazine/portfolio rhythm than our current markdown-like implementation.
   - Preserve generous breathing room, but add composition and scannable sections.

5. **Soft shapes**
   - Original uses rounded/oval imagery and calming section spacing. New design can modernize this with large rounded image masks and cards.

## Current site problems

1. Homepage hero is weak: `welcome` is too generic and does not answer “what is this / who is this for / where do I start?”
2. Layout is repetitive: centered heading + paragraph + button over and over.
3. Photos feel pasted in, not art-directed.
4. Services are buried on About instead of surfaced on Home.
5. Pricing/location/teletherapy are hidden in FAQs despite being major decision factors.
6. Contact form lacks conversion support: no “what happens next,” weak trust reassurance, long ungrouped fields.
7. Mobile nav is cramped.

## External design/UX findings

### Therapist website conventions

Sources reviewed:
- SimplePractice: “The top 10 therapist websites”
- Headway: “12 top therapist website examples to inspire you”
- Private Practice Elevation: “Optimizing Therapist Websites for Local SEO Success”

Key takeaways:

1. **Therapist websites are first impressions**
   - SimplePractice notes that therapist websites are often the first impression potential clients have and should communicate who the therapist is, what services they offer, and why they may be a good fit.

2. **Professional headshot matters**
   - SimplePractice highlights clean, friendly, professional headshots as trust-building.
   - Headway specifically recommends a warm, friendly photo in a professional setting.

3. **Clients need pricing clarity**
   - Headway names session cost as one of the three elements of an effective therapist website.
   - Pricing should not be hidden only in FAQs.

4. **Booking path must be obvious**
   - Headway recommends clear CTAs like “Set up your free 15 minute consultation.”
   - This should replace vague CTAs like “Get in Touch” as the primary action.

5. **Services/populations should be visible early**
   - SimplePractice examples praise sites that include populations served, services offered, and fee structure.
   - Home should quickly show Individual / Couples / Family.

6. **Local SEO matters for therapists**
   - Private Practice Elevation emphasizes local keywords, Google Business Profile consistency, mobile optimization, structured data, and location-specific content.
   - The redesign should include visible Fullerton / Orange County / California teletherapy language.

## Design systems / style references

### Claude / Anthropic style
Good fit for this project:
- Warm parchment background
- Editorial serif headings
- Terracotta accent
- Thoughtful, calm, human tone
- Section rhythm like chapters

Use cautiously:
- Avoid making it look like an AI/product page.
- Use the warmth and typography idea, not the tech layout.

### Airbnb style
Good fit:
- Photography-first cards
- Warm near-black text
- Soft rounded containers
- Trust through real imagery

Use cautiously:
- Avoid marketplace look.
- Use image-first composition and card polish.

### Notion style
Good fit:
- Warm neutral surfaces
- Whisper borders
- Clean content hierarchy
- Friendly, readable information architecture

Use cautiously:
- Too much Notion minimalism risks becoming generic again.

## Recommended redesign direction

Recommended stance: **Warm Editorial Therapist Site**

Blend:
- Original Squarespace warmth/photo-forward identity
- Claude-like parchment/editorial typography
- Airbnb-like image confidence and rounded photo cards
- Notion-like warm neutral cards, light borders, clean scannability

## Page architecture

### Home

Goal: answer who Esther helps and how to start.

Sections:
1. Hero
   - Eyebrow: Fullerton, Orange County + Teletherapy throughout California
   - H1: Compassionate relational therapy for individuals, couples, and families
   - Short intro
   - Primary CTA: Schedule a free 15-minute consultation
   - Secondary CTA: Meet Esther
   - Large editorial portrait/photo

2. Trust/practical strip
   - LMFT #123390
   - Fullerton office
   - Teletherapy in California
   - Superbill available

3. Who I help
   - Individual Therapy
   - Couples Therapy
   - Family Therapy

4. Meet Esther preview
   - Photo + short bio excerpt
   - CTA to About

5. How therapy begins
   - Reach out
   - Free consultation
   - Begin sessions

6. Fees/location quick facts
   - Individual $200
   - Couples/Family $215
   - Fullerton / Teletherapy

7. Behind the logo
   - Keep lotus + marigold story as brand section near bottom

### About

Goal: human trust + credentials + approach.

Sections:
1. Editorial hero with portrait and short “Meet Esther” intro
2. My Story — split into shorter paragraphs / pull quote
3. Credentials cards
4. Services detail cards
5. Approach / modalities chips
6. CTA: Schedule consultation

### FAQs

Goal: reduce anxiety and answer decision blockers.

Sections:
1. FAQ hero: “Common questions before beginning therapy”
2. Top quick facts card row: fees, insurance/superbill, location, teletherapy
3. FAQ accordion/list grouped by category:
   - Fees & insurance
   - Starting therapy
   - Sessions & logistics
   - Office & accessibility
4. CTA

### Contact

Goal: make reaching out feel easy and safe.

Sections:
1. Hero: “Schedule a free 15-minute consultation”
2. What happens next card
3. Form grouped into sections
4. Location/contact reassurance
5. Privacy note near submit

## Design tokens draft

- Background: #f7f1e8 / #fbf8f3
- Surface: #fffdf9
- Alternate surface: #efe5d8
- Text: #352723 or #3d2c2e
- Muted text: #6f625e
- Accent terracotta/gold: #b87955 or #b9855f
- Deep accent: #6f4636
- Border: rgba(61, 44, 46, 0.12)
- Radius: 20px large cards, 999px pills
- Headings: serif, editorial, warm; body: system/Inter-like sans

## Implementation recommendation

Do not iterate from the current layout. Replace the layout system with a new shared component system:

- `BaseLayout.astro`: global tokens/nav/footer
- `Section.astro` optional
- `Button.astro` optional
- `InfoCard.astro` optional
- `ServiceCard.astro` optional
- `FaqItem.astro` optional

Use a single strong homepage design first. Then adapt About/FAQs/Contact to that system.
