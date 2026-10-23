import { z } from "zod";

/**
 * Every brand file is validated against these schemas when the brand loads.
 * A typo in a brand's JSON fails the build with a readable message instead of
 * breaking a page at runtime. The TypeScript types in /types are inferred
 * from these schemas, so there is exactly one definition of each shape.
 */

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Use a hex color such as #c9ced1");

/** Paths under /public. Restricted characters keep them safe to inline in CSS and HTML. */
const publicPath = z
  .string()
  .regex(/^\/[A-Za-z0-9_\-./]+$/, "Asset paths must start with / (relative to /public) and use only letters, numbers, - _ . /");

const vec3 = z.tuple([z.number(), z.number(), z.number()]);

export const themeSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  background: hexColor,
  surface: hexColor,
  text: hexColor,
  mutedText: hexColor,
  border: hexColor,
  glow: hexColor,
  /** Form errors. Optional so existing brands keep working; pick a tone readable on `background`. */
  error: hexColor.default("#e8a3a3"),
});

const fontFaceSchema = z.object({
  src: publicPath,
  weight: z.number().int().min(100).max(900),
  style: z.enum(["normal", "italic"]).default("normal"),
});

const fontFamilySchema = z.object({
  family: z.string().regex(/^[A-Za-z0-9 -]+$/, "Font family names may only use letters, numbers, spaces and hyphens"),
  fallback: z.string().min(1),
  files: z.array(fontFaceSchema).min(1),
});

export const logoSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("wordmark"), text: z.string().min(1) }),
  z.object({ type: z.literal("image"), src: publicPath, alt: z.string().min(1), width: z.number(), height: z.number() }),
]);

export const brandSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tagline: z.string(),
  description: z.string(),
  logo: logoSchema,
  theme: themeSchema,
  typography: z.object({ display: fontFamilySchema, ui: fontFamilySchema }),
  contact: z.object({
    email: z.email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  social: z.array(z.object({ label: z.string(), href: z.url() })),
  seo: z.object({
    defaultTitle: z.string(),
    titleTemplate: z.string().includes("%s"),
    description: z.string().max(170, "Keep meta descriptions under ~170 characters"),
    ogImage: publicPath.optional(),
  }),
  features: z.object({
    /** Shows the sound toggle. Needs `audio` to be set as well. */
    sound: z.boolean(),
    /** Shows the shopping bag. Without prices it works as an enquiry list. */
    cart: z.boolean().default(false),
  }),
  audio: z
    .object({ ambient: publicPath, volume: z.number().min(0).max(1) })
    .optional(),
});

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith("/"),
});

/** Code-built stand-in shapes used when a product has no 3D model or image yet. */
export const placeholderShapes = ["jar", "bottle", "tube", "pump", "flacon", "slim"] as const;

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string(),
  category: z.string(),
  /** Catalog image used on cards and product listings. */
  image: publicPath.optional(),
  imageAlt: z.string().optional(),
  /** GLB/GLTF shown in the 3D scene. */
  model3D: publicPath.optional(),
  /** Transparent cut-out used in the 3D scene when there is no model. */
  sceneImage: publicPath.optional(),
  /** Uniform scale applied to the GLB so models from different sources sit at a consistent size. */
  modelScale: z.number().positive().default(1),
  placeholderShape: z.enum(placeholderShapes).default("bottle"),
  /** Short facts shown as a list on the product page, e.g. { "label": "Size", "value": "50 ml" }. */
  details: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).default([]),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  featured: z.boolean().default(false),
});

export const stagedProductSchema = z.object({
  productId: z.string(),
  position: vec3,
  rotation: vec3.default([0, 0, 0]),
  scale: z.number().positive().default(1),
  /** Below 1 the product is drawn translucent, e.g. a ghosted product far behind. */
  opacity: z.number().min(0.05).max(1).default(1),
});

/** Scene changes that blend in when a collection or slide becomes active (TRD §20 "environment transition"). */
export const environmentSchema = z.object({
  glowColor: hexColor.optional(),
  glowIntensity: z.number().min(0).max(3).optional(),
  horizonColor: hexColor.optional(),
});

/**
 * A slide is one step of the collection counter (01 / 06). It names the
 * product whose title is shown and lists every product standing on the water
 * during that step, so supporting products can share the stage.
 */
export const slideSchema = z.object({
  id: z.string(),
  featuredProductId: z.string(),
  stage: z.array(stagedProductSchema).min(1),
  environment: environmentSchema.optional(),
});

export const transitionStyles = ["rise", "drift", "fade"] as const;

export const collectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  /** How products move between slides: rise out of / sink into the water, glide sideways, or cross-fade. */
  transition: z.enum(transitionStyles).default("rise"),
  environment: environmentSchema.optional(),
  slides: z.array(slideSchema).min(1),
});

const imageRefSchema = z.object({ src: publicPath, alt: z.string() });

export const galleryItemSchema = z.object({
  id: z.string(),
  src: publicPath,
  alt: z.string().min(1, "Gallery images need alt text"),
  caption: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  productId: z.string().optional(),
});

export const reviewSchema = z.object({
  id: z.string(),
  author: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(1),
  productId: z.string().optional(),
  date: z.iso.date(),
  /** Sample reviews are labelled on the page and left out of structured data. Replace them with real reviews before launch. */
  sample: z.boolean().default(false),
});

const blogBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({ type: z.literal("quote"), text: z.string().min(1), cite: z.string().optional() }),
  z.object({ type: z.literal("image"), src: publicPath, alt: z.string(), caption: z.string().optional(), width: z.number().int().positive(), height: z.number().int().positive() }),
]);

export const blogPostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  excerpt: z.string().max(220),
  date: z.iso.date(),
  author: z.string(),
  cover: imageRefSchema.optional(),
  body: z.array(blogBlockSchema).min(1),
});

export const homeSections = ["hero", "intro", "featured", "collection", "story", "gallery", "reviews", "cta"] as const;

const heroMediaSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("image"), src: publicPath, alt: z.string() }),
  z.object({ type: z.literal("video"), src: publicPath, poster: publicPath }),
  /** Uses the cinematic collection scene as the hero. */
  z.object({ type: z.literal("collection") }),
]);

export const sceneSchema = z.object({
  /** Still image shown while the 3D scene loads, and instead of it when WebGL is unavailable. */
  poster: publicPath.optional(),
  camera: z.object({ position: vec3, target: vec3, fov: z.number().min(10).max(100) }),
  fog: z.object({ color: hexColor, near: z.number(), far: z.number() }),
  sky: z.object({ top: hexColor, horizon: hexColor }),
  glow: z.object({ color: hexColor, intensity: z.number().min(0).max(3), width: z.number().positive(), height: z.number().positive() }),
  stars: z.object({
    count: z.number().int().nonnegative(),
    mobileCount: z.number().int().nonnegative(),
    size: z.number().positive(),
    opacity: z.number().min(0).max(1),
    speed: z.number().nonnegative(),
    depth: z.number().positive(),
    color: hexColor,
  }),
  water: z.object({
    color: hexColor,
    /** Highlight color of the glints on the water. */
    sheen: hexColor,
    /** Larger values make smaller, denser ripples. */
    waveScale: z.number().positive(),
    /** How strongly ripples bend the reflection. */
    distortion: z.number().min(0),
    /** Time multiplier for the ripples. 0 freezes the water. */
    waveSpeed: z.number().min(0),
    normalMap: publicPath,
  }),
  lighting: z.object({
    ambient: z.number().min(0),
    key: z.object({ color: hexColor, intensity: z.number().min(0), position: vec3 }),
    rim: z.object({ color: hexColor, intensity: z.number().min(0), position: vec3 }),
  }),
  products: z.object({
    bodyColor: hexColor,
    metalColor: hexColor,
    labelColor: hexColor,
  }),
  /** Post-processing (TRD §12 "Effects"). Desktop only; 0 turns an effect off. */
  effects: z
    .object({
      bloom: z.number().min(0).max(3).default(0.6),
      bloomThreshold: z.number().min(0).max(1).default(0.55),
      vignette: z.number().min(0).max(1).default(0.45),
    })
    .default({ bloom: 0.6, bloomThreshold: 0.55, vignette: 0.45 }),
});

const pageIntroSchema = z.object({ title: z.string(), intro: z.string() });

export const contentSchema = z.object({
  home: z.object({
    /** Order of the home page sections (PRD §6). Leave a section out to hide it. */
    sections: z.array(z.enum(homeSections)).min(1),
    hero: z.object({
      eyebrow: z.string().optional(),
      heading: z.string(),
      body: z.string().optional(),
      action: navItemSchema.optional(),
      media: heroMediaSchema,
    }),
    gallery: z.object({ heading: z.string(), limit: z.number().int().positive().default(4) }),
    reviews: z.object({ heading: z.string(), limit: z.number().int().positive().default(3) }),
    intro: z.object({ heading: z.string(), body: z.string() }),
    featured: z.object({ heading: z.string() }),
    story: z.object({ heading: z.string(), paragraphs: z.array(z.string()).min(1) }),
    cta: z.object({ heading: z.string(), body: z.string(), action: navItemSchema }),
  }),
  pages: z.object({
    about: pageIntroSchema,
    products: pageIntroSchema,
    exclusive: pageIntroSchema,
    gallery: pageIntroSchema,
    reviews: pageIntroSchema,
    blog: pageIntroSchema,
    contact: pageIntroSchema,
  }),
  footer: z.object({ note: z.string() }),
  cart: z.object({
    title: z.string(),
    empty: z.string(),
    addLabel: z.string(),
    addedLabel: z.string(),
    checkoutLabel: z.string(),
    note: z.string(),
  }),
  reviewsPage: z.object({ sampleLabel: z.string(), averageLabel: z.string() }),
  productPage: z.object({
    enquiryLabel: z.string(),
    collectionLabel: z.string(),
    relatedHeading: z.string(),
  }),
  contactForm: z.object({
    /** Options for the "What is this about?" field. The first is the default. */
    topics: z.array(z.string().min(1).max(60)).min(1),
    /** Topic pre-selected when the visitor arrives from a product page. */
    productTopic: z.string().min(1),
    successHeading: z.string(),
    successBody: z.string(),
    privacyNote: z.string(),
  }),
});

export const brandBundleSchema = z
  .object({
    brand: brandSchema,
    navigation: z.array(navItemSchema).min(1),
    products: z.array(productSchema).min(1),
    collections: z.array(collectionSchema).min(1),
    scene: sceneSchema,
    content: contentSchema,
    gallery: z.array(galleryItemSchema),
    reviews: z.array(reviewSchema),
    posts: z.array(blogPostSchema),
  })
  .superRefine((bundle, ctx) => {
    if (!bundle.content.contactForm.topics.includes(bundle.content.contactForm.productTopic)) {
      ctx.addIssue({
        code: "custom",
        message: "productTopic must be one of the topics",
        path: ["content", "contactForm", "productTopic"],
      });
    }
    const slugs = new Set(bundle.products.map((p) => p.slug));
    if (slugs.size !== bundle.products.length) {
      ctx.addIssue({ code: "custom", message: "Product slugs must be unique", path: ["products"] });
    }
    const ids = new Set(bundle.products.map((p) => p.id));
    if (ids.size !== bundle.products.length) {
      ctx.addIssue({ code: "custom", message: "Product ids must be unique", path: ["products"] });
    }
    const sections = bundle.content.home.sections;
    if (new Set(sections).size !== sections.length) {
      ctx.addIssue({ code: "custom", message: "Each home section can appear once", path: ["content", "home", "sections"] });
    }
    const postSlugs = new Set(bundle.posts.map((post) => post.slug));
    if (postSlugs.size !== bundle.posts.length) {
      ctx.addIssue({ code: "custom", message: "Blog post slugs must be unique", path: ["posts"] });
    }
    const checkProductRef = (id: string | undefined, path: Array<string | number>) => {
      if (id && !ids.has(id)) ctx.addIssue({ code: "custom", message: `Unknown productId "${id}"`, path });
    };
    bundle.gallery.forEach((item, i) => checkProductRef(item.productId, ["gallery", i, "productId"]));
    bundle.reviews.forEach((review, i) => checkProductRef(review.productId, ["reviews", i, "productId"]));
    bundle.collections.forEach((collection, c) => {
      collection.slides.forEach((slide, s) => {
        if (!ids.has(slide.featuredProductId)) {
          ctx.addIssue({
            code: "custom",
            message: `Unknown featuredProductId "${slide.featuredProductId}"`,
            path: ["collections", c, "slides", s, "featuredProductId"],
          });
        }
        slide.stage.forEach((staged, i) => {
          if (!ids.has(staged.productId)) {
            ctx.addIssue({
              code: "custom",
              message: `Unknown productId "${staged.productId}"`,
              path: ["collections", c, "slides", s, "stage", i, "productId"],
            });
          }
        });
      });
    });
  });
