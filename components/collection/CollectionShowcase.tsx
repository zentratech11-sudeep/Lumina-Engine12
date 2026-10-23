"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type WheelEvent } from "react";
import { media } from "@/config/breakpoints";
import { collectionTimeline, duration, ease } from "@/config/motion";
import { useCollection } from "@/hooks/useCollection";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/motion/gsap";
import { scrollToElement } from "@/lib/motion/scroll";
import { cn } from "@/lib/utils";
import { hasWebGL, prefersReducedData } from "@/lib/webgl";
import type { ResolvedCollection } from "@/types/collection";
import type { SceneConfig } from "@/types/scene";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ChevronIcon } from "@/components/ui/Icons";
import { CollectionCounter } from "./CollectionCounter";
import { ProductTitle } from "./ProductTitle";
import { StaticStage } from "./StaticStage";

// Three.js stays out of the server bundle and out of the first JS chunk (TRD §10).
const ExperienceCanvas = dynamic(() => import("@/components/three/ExperienceCanvas"), { ssr: false });

const SWIPE_DISTANCE = 48;
const WHEEL_DISTANCE = 60;

let webglSupport: boolean | undefined;
const subscribeNever = () => () => {};
/** WebGL available and the visitor hasn't asked to save data; otherwise the image stage is used (TRD §27, §29). */
const readWebGL = () => (webglSupport ??= hasWebGL() && !prefersReducedData());

export interface CollectionShowcaseProps {
  collections: ResolvedCollection[];
  scene: SceneConfig;
  brandName: string;
  displayFont: string;
  /** Element id the "Scroll down" button moves to. */
  nextSectionId?: string;
  /** h1 when the showcase opens the page, h2 when it sits further down. */
  headingLevel?: "h1" | "h2";
}

/**
 * The Exclusive Collection (PRD §10–16). One state (TRD §21) drives the 3D
 * stage, the environment, the title, the counter and the screen-reader
 * announcement. Navigate with the arrows, keyboard ← →, a horizontal swipe,
 * or a sideways trackpad gesture; vertical scrolling always scrolls the page.
 */
export function CollectionShowcase({
  collections,
  scene,
  brandName,
  displayFont,
  nextSectionId,
  headingLevel = "h1",
}: CollectionShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const wheel = useRef({ total: 0, timer: 0 });

  const slideCounts = useMemo(() => collections.map((c) => c.slides.length), [collections]);
  const { collection, slide, direction, next, prev, goTo, selectCollection } = useCollection(slideCounts);
  const [shown, setShown] = useState({ collection, slide });
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery(media.mobile);
  const isTouchTablet = useMediaQuery(`${media.coarsePointer} and ${media.belowDesktop}`);
  const quality = isMobile || isTouchTablet ? "low" : "high";
  const inView = useInView(sectionRef);
  const webgl = useSyncExternalStore(subscribeNever, readWebGL, () => true);
  const showCanvas = webgl && !sceneFailed;

  const active = collections[collection] ?? collections[0];
  const activeSlide = active?.slides[slide] ?? active?.slides[0];
  const shownCollection = collections[shown.collection] ?? active;
  const shownSlide = shownCollection?.slides[shown.slide] ?? activeSlide;
  const Heading = headingLevel;

  // Title and counter follow the TRD §20 timeline: old title out, counter flips, new title in.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const nameEl = titleRef.current;
    const headingEl = headingRef.current;
    const collectionChanged = collection !== shown.collection;
    const timeline = gsap.timeline();
    const swap = () => setShown({ collection, slide });
    if (reducedMotion || !nameEl) {
      timeline.call(swap, [], 0);
    } else {
      const outTargets = collectionChanged && headingEl ? [nameEl, headingEl] : [nameEl];
      timeline
        .to(outTargets, { opacity: 0, y: 10, filter: "blur(6px)", duration: duration.normal, ease: ease.in }, collectionTimeline.titleExit)
        .call(swap, [], collectionTimeline.counterUpdate)
        .fromTo(
          outTargets,
          { opacity: 0, y: -10, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: duration.slow, ease: ease.out },
          collectionTimeline.titleEnter,
        );
    }
    return () => {
      timeline.kill();
    };
    // `shown` is read only to compare; it must not retrigger the timeline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, slide, reducedMotion]);

  // Scroll sequence (TRD §18): as the section leaves the screen the copy lifts away and the scene dims.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    const context = gsap.context(() => {
      const trigger = { trigger: section, start: "top top", end: "bottom top", scrub: true };
      if (overlayRef.current) gsap.to(overlayRef.current, { y: -80, opacity: 0, ease: "none", scrollTrigger: trigger });
      if (stageRef.current) gsap.to(stageRef.current, { opacity: 0.35, scale: 1.04, ease: "none", scrollTrigger: trigger });
    }, section);
    return () => context.revert();
  }, [reducedMotion]);

  // Arrow keys work while the section is on screen and focus isn't in a form field or dialog.
  useEffect(() => {
    if (!inView) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, next, prev]);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }, []);

  // Swipe left → next, swipe right → previous (TRD §23). Mostly-vertical drags are left to the page.
  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) next();
      else prev();
    },
    [next, prev],
  );

  // Sideways trackpad gestures change slides; vertical wheel movement never does (TRD §22).
  const onWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const state = wheel.current;
      state.total += event.deltaX;
      window.clearTimeout(state.timer);
      state.timer = window.setTimeout(() => (state.total = 0), 180);
      if (Math.abs(state.total) < WHEEL_DISTANCE) return;
      if (state.total > 0) next();
      else prev();
      state.total = 0;
    },
    [next, prev],
  );

  const scrollToNext = useCallback(() => {
    const target = nextSectionId ? document.getElementById(nextSectionId) : null;
    if (target) scrollToElement(target, reducedMotion);
  }, [nextSectionId, reducedMotion]);

  if (!active || !activeSlide || !shownCollection || !shownSlide) return null;

  const announcement = `${active.title}, ${slide + 1} of ${active.slides.length}: ${activeSlide.featured.name}`;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={active.title}
      className="collection-stage relative isolate h-[100svh] min-h-[560px] w-full touch-pan-y select-none overflow-hidden bg-background"
      style={scene.poster ? { backgroundImage: `url(${scene.poster})` } : undefined}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeStart.current = null)}
      onWheel={onWheel}
    >
      <div ref={stageRef} className="absolute inset-0 origin-center">
        {showCanvas ? (
          <div className={cn("absolute inset-0 transition-opacity duration-1000 ease-out", sceneReady ? "opacity-100" : "opacity-0")}>
            <ErrorBoundary fallback={null} label="3D scene" onError={() => setSceneFailed(true)}>
              <ExperienceCanvas
                scene={scene}
                collections={collections}
                collection={collection}
                slide={slide}
                direction={direction}
                environment={activeSlide.environment}
                brandName={brandName}
                displayFont={displayFont}
                quality={quality}
                reducedMotion={reducedMotion}
                active={inView}
                pointer={pointer}
                onReady={() => setSceneReady(true)}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <StaticStage slide={activeSlide} />
        )}
      </div>

      {showCanvas && !sceneReady && (
        <div role="status" className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-live="polite">
          <span className="sr-only">Loading the 3D scene</span>
          <span className="scene-loader block h-full w-1/3 bg-primary/70" aria-hidden="true" />
        </div>
      )}

      {/* Keeps the heading and navigation legible over bright frames. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background/80 to-transparent" />

      <div ref={overlayRef} className="pointer-events-none absolute inset-0 flex flex-col items-center px-6">
        <header className="mt-[max(6.5rem,15svh)] flex flex-col items-center gap-3 text-center">
          <div ref={headingRef} className="flex flex-col items-center gap-2">
            <Heading className="font-display text-[clamp(2.1rem,4.2vw,3.6rem)] font-normal leading-none tracking-[0.005em] text-text">
              {shownCollection.title}
            </Heading>
            {shownCollection.subtitle && <p className="font-display text-lg italic text-muted-text">{shownCollection.subtitle}</p>}
          </div>
          <CollectionCounter index={shown.slide} count={shownCollection.slides.length} />
          {collections.length > 1 && (
            <div role="group" aria-label="Collections" className="pointer-events-auto mt-2 flex flex-wrap justify-center gap-1">
              {collections.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={i === collection}
                  onClick={() => selectCollection(i)}
                  className={cn("collection-tab", i === collection && "is-active")}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="mt-auto mb-[max(6.5rem,14svh)] w-full max-w-3xl">
          <ProductTitle ref={titleRef} name={shownSlide.featured.name} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-6">
        <button type="button" onClick={prev} aria-label="Previous product" className="stage-arrow">
          <ChevronIcon direction="left" width={22} height={22} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-6">
        <button type="button" onClick={next} aria-label="Next product" className="stage-arrow">
          <ChevronIcon direction="right" width={22} height={22} />
        </button>
      </div>

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2" role="group" aria-label="Slides">
        {nextSectionId ? (
          <button type="button" onClick={scrollToNext} className="pill-button">
            Scroll down
          </button>
        ) : (
          active.slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.featured.name}`}
              aria-current={i === slide ? "true" : undefined}
              onClick={() => goTo(i)}
              className={cn("slide-dot", i === slide && "is-active")}
            />
          ))
        )}
      </div>
    </section>
  );
}
