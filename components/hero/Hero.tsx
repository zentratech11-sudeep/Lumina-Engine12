"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/motion/gsap";
import { scrollToElement } from "@/lib/motion/scroll";
import type { BrandContent } from "@/types/brand";
import { PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { SafeImage } from "@/components/ui/SafeImage";

type HeroContent = BrandContent["home"]["hero"];
type MediaHero = HeroContent & { media: Exclude<HeroContent["media"], { type: "collection" }> };

interface HeroProps {
  hero: MediaHero;
  nextSectionId?: string;
}

/**
 * The opening section (PRD §7) for brands whose hero is an image or a video.
 * Brands whose hero is the 3D collection use CollectionShowcase instead.
 * Video is muted, loops, never plays for reduced-motion visitors, and can be
 * paused (WCAG 2.2.2).
 */
export function Hero({ hero, nextSectionId }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const { media } = hero;
  const showVideo = media.type === "video" && !reducedMotion;

  // Scroll sequence: the media drifts slower than the page and the copy lifts away.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    const context = gsap.context(() => {
      const trigger = { trigger: section, start: "top top", end: "bottom top", scrub: true };
      if (mediaRef.current) gsap.to(mediaRef.current, { yPercent: 18, scale: 1.06, ease: "none", scrollTrigger: trigger });
      if (copyRef.current) gsap.to(copyRef.current, { y: -60, opacity: 0, ease: "none", scrollTrigger: trigger });
    }, section);
    return () => context.revert();
  }, [reducedMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <section ref={sectionRef} aria-labelledby="hero-heading" className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-background">
      <div ref={mediaRef} className="absolute inset-0 -z-10 origin-top">
        {media.type === "image" && <SafeImage src={media.src} alt={media.alt} fill priority sizes="100vw" className="object-cover" />}
        {media.type === "video" &&
          (showVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={media.poster}
              aria-hidden="true"
            >
              <source src={media.src} type={media.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            </video>
          ) : (
            <SafeImage src={media.poster} alt="" fill priority sizes="100vw" className="object-cover" />
          ))}
        <div aria-hidden="true" className="hero-scrim absolute inset-0" />
      </div>

      <div ref={copyRef} className="flex h-full flex-col items-center justify-end px-6 pb-[max(7rem,18svh)] text-center">
        {hero.eyebrow && <p className="mb-5 text-[0.72rem] tracking-[0.3em] text-muted-text uppercase">{hero.eyebrow}</p>}
        <h1 id="hero-heading" className="max-w-[18ch] font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-light leading-[1.04] text-text">
          {hero.heading}
        </h1>
        {hero.body && <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-text">{hero.body}</p>}
        {hero.action && (
          <Link href={hero.action.href} className="submit-button mt-10">
            {hero.action.label}
          </Link>
        )}
      </div>

      {showVideo && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={paused ? "Play background video" : "Pause background video"}
          aria-pressed={paused}
          className="icon-button absolute right-4 bottom-6 sm:right-8"
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      )}

      {nextSectionId && (
        <button
          type="button"
          className="pill-button absolute bottom-7 left-1/2 -translate-x-1/2"
          onClick={() => {
            const target = document.getElementById(nextSectionId);
            if (target) scrollToElement(target, reducedMotion);
          }}
        >
          Scroll down
        </button>
      )}
    </section>
  );
}
