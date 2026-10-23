# Luxury Brand Engine

A configuration-driven website engine for cinematic luxury brand sites. **LUMINA** is the reference brand; **Solenne** is a small demo brand that exists to prove a second brand can be built with data alone.

Stack: Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · React Three Fiber + Drei + Three.js + postprocessing · GSAP + ScrollTrigger · Framer Motion · Lenis · Zod · Vitest + React Testing Library · Playwright.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also validates all brand data) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js + React Compiler rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit and component tests (Vitest + React Testing Library) |
| `npm run test:e2e` | End-to-end tests (Playwright; builds and starts the site itself) |
| `npm run check` | Typecheck + lint + unit/component tests |

Switch brands with an environment variable:

```bash
NEXT_PUBLIC_BRAND=solenne npm run dev
```

Requires Node.js 20.9 or newer.

## How it is organised

```
app/                 Routes. Pages read the active brand and pass data to components.
brands/
  index.ts           Registry of every brand the engine can build
  lumina/            One folder per brand — all of its words, colors, products and scene settings
    brand.json       Name, logo, theme colors, fonts, contact, social, SEO, features, audio
    navigation.json  Menu items
    products.json    Products
    collections.json Exclusive Collection slides (which products stand where)
    scene.json       3D scene: camera, sky, glow, stars, water, lighting, product finishes
    content.json     Page copy, home section order, hero, bag and form wording
    gallery.json     Gallery images
    reviews.json     Customer reviews
    blog.json        Journal posts
components/
  collection/        The Exclusive Collection section (overlay UI, input handling, image fallback stage)
  hero/  home/       Configurable hero (image / video / 3D) and home page sections
  gallery/ reviews/ blog/ commerce/   Gallery + lightbox, reviews, journal, bag
  motion/            Smooth scrolling (Lenis) wired to GSAP ScrollTrigger
  three/             3D scene pieces: sky, glow, stars, water, lights, camera, products
  navigation/        Navbar, mobile menu, sound toggle, logo
  forms/             Contact form
  products/ footer/ seo/ ui/
config/              Engine-wide settings: animation tokens, breakpoints
hooks/               useCollection, useSound, useReducedMotion, useMediaQuery, useInView, useDialog
lib/                 Brand loading + validation, theme → CSS variables, SEO, utilities
  contact/           Contact form: schema, spam protection, email sending, submission handling
  commerce/          Bag logic, browser bag store, checkout extension point
  motion/            GSAP/ScrollTrigger setup and smooth-scroll helpers
app/api/             Read-only JSON API
prisma/              Database blueprint for the future CMS/shop phase (not wired up)
types/               TypeScript types, inferred from the Zod schemas in lib/validation.ts
public/
  brands/<slug>/     Each brand's images, audio and models
  fonts/             Self-hosted font files (OFL licences included)
  textures/water/    Shared water normal map
  draco/             Self-hosted Draco decoder for compressed GLB files
tests/               Unit tests (*.test.ts), component tests (tests/components), E2E tests (tests/e2e)
```

**The one rule:** components never contain brand names, colors, copy or asset paths. Those live in `brands/<slug>/`. Components read them through props, CSS variables (`--brand-*`) and Tailwind classes mapped onto those variables (`text-muted-text`, `bg-surface`…).

Every brand file is validated by Zod when the site builds (`lib/validation.ts`). A typo, a missing product or a bad color stops the build with a message pointing at the exact field, for example:

```
Invalid data in /brands/lumina:
✖ Unknown productId "noir-absolut"
  → at collections[0].slides[1].stage[0].productId
```

## Adding a new brand

1. Copy `brands/solenne/` to `brands/<your-slug>/` and set `"slug"` in `brand.json` to match the folder name.
2. Register it in `brands/index.ts`.
3. Put its assets under `public/brands/<your-slug>/` (images, audio, models).
4. Edit the JSON files: theme colors, fonts, products, collection slides, scene, copy.
5. `NEXT_PUBLIC_BRAND=<your-slug> npm run dev`, check every page, then `npm run build` and `npm test`.

No component should need editing. If one does, that is an engine bug: move the hard-coded value into the schema.

### Theme and fonts

`brand.json → theme` sets nine colors (primary, secondary, accent, background, surface, text, mutedText, border, glow). `typography` lists the display (serif) and UI (sans) families with their `.woff2` files. Put font files in `public/fonts/` and keep their licence alongside.

### Products

```json
{
  "id": "luxe-renewal-cream",
  "name": "Luxe Renewal Cream",
  "slug": "luxe-renewal-cream",
  "description": "…",
  "category": "Skincare",
  "image": "/brands/lumina/images/products/luxe-renewal-cream.webp",
  "imageAlt": "…",
  "model3D": "/brands/lumina/models/products/luxe-renewal-cream.glb",
  "modelScale": 1,
  "sceneImage": "/brands/lumina/images/products/luxe-renewal-cream-cutout.webp",
  "placeholderShape": "jar",
  "featured": true
}
```

- `image` is the catalog picture used on cards (4:5 works best).
- In the 3D scene the engine tries `model3D` first, then `sceneImage` (a transparent cut-out), then `placeholderShape` (a code-built stand-in: `jar`, `flacon`, `slim`, `tube`, `pump`, `bottle`). If a file is missing or broken it quietly falls back to the next option.

### 3D models

- Export GLB with the product **standing on its base at the origin**, Y up, real-world-ish size (about 1–1.4 units tall). Adjust with `modelScale`.
- Compress with Draco or Meshopt, keep textures at 2K or below, and aim for under 1 MB per model: `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`.
- Models are loaded only when their slide is on stage.

### Collection slides

Each slide is one step of the `01 / 06` counter. `featuredProductId` names the product whose title shows; `stage` lists every product standing on the water during that step:

```json
{
  "id": "s1",
  "featuredProductId": "luxe-renewal-cream",
  "stage": [
    { "productId": "luxe-renewal-cream", "position": [-1.35, 0, 1.0], "rotation": [0, 0.35, 0], "scale": 1.15 },
    { "productId": "noir-absolu", "position": [2.3, 0, -3.2], "scale": 0.9 }
  ]
}
```

`x` is left/right, `z` is depth (negative is further away), `y` is normally 0 (the waterline). On portrait screens the featured product is moved to the centre automatically.

### Product pages

Every product gets a page at `/products/<slug>`, generated at build time. It shows the catalog image, category, name, price (only if `price` and `currency` are set), description, the `details` list, an enquiry button that opens the contact form with the product pre-selected, a link to the collection if the product appears in one, and up to three related products (same category first). Product and breadcrumb structured data are included, and every product is listed in `sitemap.xml`.

```json
"details": [{ "label": "Size", "value": "50 ml" }],
"price": 4500,
"currency": "NPR"
```

Button and heading wording comes from `content.json → productPage`.

### Contact form

The form posts to a Server Action (`app/contact/actions.ts`) and is validated on the server with Zod (`lib/contact/schema.ts`), so the rules are the same with or without JavaScript. Topics, the success message and the privacy note come from `content.json → contactForm`. `?product=<slug>` in the URL pre-selects a product.

Spam protection, in `lib/contact/spam.ts`:
- a hidden honeypot field (bots that fill it get a fake success and nothing is sent);
- submissions less than 3 seconds after the page rendered are rejected;
- 5 messages per visitor per 10 minutes. The limit is kept in memory, so on serverless hosts each instance counts separately. Swap in a shared store (Upstash, Redis) if the site attracts real abuse.

Email is sent through [Resend](https://resend.com) with a plain `fetch` call (`lib/contact/email.ts`); any provider with an HTTP API can replace `createResendSender`. Messages arrive with the visitor as Reply-To.

| Environment | What happens |
| --- | --- |
| Development, no variables | The email is printed in the terminal running `npm run dev`. |
| Production, all three variables set | Sent through Resend. |
| Production, variables missing | Nothing is sent; visitors are asked to email the brand's address directly, and the server logs an error. |

To go live: create a Resend account, verify your sending domain, then set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` in your host's environment settings.

### Scene

`scene.json` controls the camera, sky gradient, horizon glow, star count (separate mobile count), water color/ripples/reflection, lighting and the finish of placeholder products. `poster` is a still image shown while the 3D scene loads and used instead of it when WebGL is unavailable.

### Home page and hero

`content.json → home.sections` sets which sections appear and in what order (PRD §6). The default is
`["hero", "intro", "featured", "collection", "story", "gallery", "reviews", "cta"]`; remove one to hide it.

`home.hero.media` chooses the hero:

```json
{ "type": "image", "src": "/brands/lumina/images/backgrounds/hero.webp", "alt": "" }
{ "type": "video", "src": "/brands/solenne/videos/hero.mp4", "poster": "/brands/solenne/images/backgrounds/hero-poster.webp" }
{ "type": "collection" }
```

`collection` opens the page with the 3D scene, like the reference video. Videos play muted and looped, and only the poster is shown to visitors who prefer reduced motion. Add an `action` (`{ "label", "href" }`) for the hero button.

### More than one collection

`collections.json` can hold any number of collections; when there are several, the showcase shows a switcher. Each collection can set:

- `subtitle` and `description` (shown on `/exclusive`);
- `transition`: `"rise"` (out of the water), `"drift"` (sideways) or `"fade"`;
- `environment`: `glowColor`, `glowIntensity`, `horizonColor`. A slide can also set its own `environment`; it blends in during the transition.

Staged products accept `opacity` (0.05–1) to ghost a product in the distance.

### Gallery, reviews and journal

- `gallery.json`: `{ id, src, alt, caption?, width, height, productId? }`. Alt text is required. The gallery page opens images in a keyboard-accessible lightbox (← → to step, Esc to close).
- `reviews.json`: `{ id, author, rating 1–5, title?, body, productId?, date, sample? }`. Reviews with `"sample": true` are labelled on the page, left out of structured data, and the build prints a reminder to replace them.
- `blog.json`: posts with `slug, title, excerpt, date, author, cover?` and a `body` made of blocks: `paragraph`, `heading`, `quote` (with optional `cite`) and `image`. Each post gets `/blog/<slug>` with Article structured data.

### Bag

Set `brand.json → features.cart: true` to show the bag. Visitors add products from product pages, change quantities in the drawer, and the bag is kept in the browser between visits. If every product in the bag has a `price` and `currency`, the drawer shows a total.

There is no payment yet (PRD §29 treats checkout as a future feature). The drawer's button sends the bag to the contact form as an enquiry. To add real checkout, implement another provider in `lib/commerce/checkout.ts` (for example a Stripe Checkout session created on the server); the drawer already calls whatever provider is configured there.

### Effects and motion

- `scene.json → effects`: `bloom`, `bloomThreshold` and `vignette` (0 turns one off). Effects run on desktop only.
- Mouse-wheel scrolling is smoothed with Lenis and drives GSAP ScrollTrigger animations; touch scrolling stays native, and both are off for reduced motion.
- Animation durations live in `config/motion.ts`.

### API

Read-only JSON (TRD §1, §34), generated at build time:

| Endpoint | Returns |
| --- | --- |
| `GET /api/brand` | Brand settings and navigation |
| `GET /api/products` | All products |
| `GET /api/products/:slug` | One product (404 if unknown) |
| `GET /api/collections` | Collections and staging |
| `GET /api/reviews` | Reviews, with the `sample` flag |
| `GET /api/posts` | Journal posts without bodies |

Responses look like `{ "version": 1, "data": … }`. There are no write endpoints: add them only together with authentication and Zod validation (TRD §34–35).

### Future database

`prisma/schema.prisma` maps every data shape to PostgreSQL, plus Customer, Order, OrderItem, ContactMessage and SiteSetting (TRD §33). It is a blueprint: Prisma isn't installed. `prisma/README.md` explains how to adopt it without changing any page or component.

## Behaviour notes

- **Navigation in the collection:** arrow buttons, slide dots, keyboard ← →, horizontal swipe and sideways trackpad gestures. Vertical swipes and the mouse wheel scroll the page normally. Changes are rate-limited so rapid clicks don't stack transitions.
- **Transition timeline** (TRD §20) lives in `config/motion.ts`: products exit at 0 s, title exits at 0.2 s, counter flips at 0.6 s while new products rise, new title enters at 0.9 s.
- **Performance:** the 3D bundle is code-split and never rendered on the server; rendering stops when the section scrolls offscreen; phones and touch tablets get lower resolution, fewer stars, half-resolution reflections, no antialiasing and no effects. If a device can't hold a steady frame rate, the scene drops its resolution and effects on its own. Visitors with data saving turned on get the image stage instead of 3D.
- **Reduced motion:** transitions become instant swaps, stars and water stop moving, camera parallax is off.
- **Sound:** off on every visit; it only starts from a click on the speaker icon. Hidden for brands without `audio`.
- **Errors:** the 3D scene and every model sit behind error boundaries, and the app has its own error pages (`app/error.tsx`, `app/global-error.tsx`). If WebGL is missing or the scene crashes, an image stage shows the product photos with the same title, counter and controls. Missing images show a neutral panel instead of a broken-image icon.
- **SEO:** titles, descriptions, canonical URLs and Open Graph come from `brand.json → seo` and `content.json`; `sitemap.xml`, `robots.txt` and Organization JSON-LD are generated. Set `NEXT_PUBLIC_SITE_URL` in production.

## What is placeholder

Everything in `brands/lumina/` that a client would normally supply:

- **Product visuals** are the code-built placeholder shapes. The catalog images in `public/brands/lumina/images/products/` are renders of those placeholders, and so are the poster and `og.jpg`. Replace them with real photography and models.
- **Copy, product descriptions, email and social links** are drafts.
- **`audio/ambient.mp3`** is a generated 28-second ambient loop.
- **Gallery images** are renders of the placeholder products.
- **Reviews** are marked `"sample": true` and labelled "Sample review" on the site. Replace them with real reviews before launch.
- **Journal posts** say "Sample article" and need real text.
- **Solenne's hero video and its one GLB model** were generated to prove the video hero and the model loader work.
- **Contact topics and product sizes** are drafts.

## Decisions taken on open questions

| Question from the PRD/TRD review | Decision in this build |
| --- | --- |
| How do multiple brands coexist? | One folder per brand, chosen at build time with `NEXT_PUBLIC_BRAND`. One deployment per brand. |
| `config/*.ts` vs `data/*.json` | Brand data lives only in `brands/<slug>/*.json`; `config/` holds engine settings (motion, breakpoints). |
| What does the counter count? | Slides: one featured product plus supporting products. |
| Scroll-jacking vs discrete navigation | Discrete. The mouse wheel scrolls the page. |
| Home hero vs `/exclusive` | Same component on both. |
| Cart icon | A bag that sends its contents as an enquiry; payment is a later phase. Turn it on per brand with `features.cart`. |
| Breakpoints | 640 / 1024 / 1440 px, as suggested in TRD §26. |

## Testing

```bash
npm run check        # types, lint, unit + component tests
npm run test:e2e     # Playwright, desktop and mobile
```

- **Unit tests** cover brand validation, every asset path existing in `/public`, the bag, collection and environment logic, the contact form's server handling and spam protection, theme generation and utilities.
- **Component tests** (jsdom) cover the navbar and mobile menu, collection counter and showcase (including the no-WebGL fallback), product card, sound toggle, contact form, bag, gallery lightbox and reviews.
- **End-to-end tests** run against a production build in Chromium with software WebGL. They cover every page, navigation, the mobile menu and swipe, collection changes and transitions, the image fallback, the bag and enquiry flow, the contact form with and without JavaScript, 404s, SEO tags, the sitemap and the API, and they fail on any unexpected console error.
- First run of Playwright on a new machine: `npx playwright install chromium`.
- `CONTACT_DRY_RUN=1` makes the contact form log instead of email, even in a production build. The E2E suite sets it; never set it on the live site.

Visual QA against the reference video and Lighthouse checks are manual: run them on real devices, since the CI browser renders 3D in software.

## Git workflow

Branches follow TRD §47: `main` (released), `development` (integration), `feature/*` and `fix/*`. Merge features into `development` with `--no-ff`, and `development` into `main` for a release.

## Next phase

- Real checkout: a payment provider in `lib/commerce/checkout.ts`, then orders and inventory (PRD §29)
- Adopt the database blueprint, then an authenticated admin for products, collections, reviews and content (PRD §30, TRD §34)
- A shared store (Redis/Upstash) for the contact form rate limit on serverless hosting

## Deployment

Vercel or any Node host that runs Next.js:

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_BRAND`, `NEXT_PUBLIC_SITE_URL` and the three contact form variables in the host's environment settings. `RESEND_API_KEY` is a secret: never commit `.env.local`.
