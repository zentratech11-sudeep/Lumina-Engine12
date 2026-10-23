"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SoundOptions {
  src?: string;
  volume?: number;
}

/**
 * Ambient audio that only ever starts from a click (browsers block autoplay,
 * and visitors should choose to hear sound). Starts muted on every visit.
 */
export function useSound({ src, volume = 0.35 }: SoundOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const fadeTo = useCallback((audio: HTMLAudioElement, target: number, onDone?: () => void) => {
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const start = audio.volume;
    const startTime = performance.now();
    const length = 600;
    const tick = (now: number) => {
      // rAF timestamps can precede startTime slightly; clamp so volume never leaves 0..1 (which throws).
      const t = Math.min(1, Math.max(0, (now - startTime) / length));
      audio.volume = Math.min(1, Math.max(0, start + (target - start) * t));
      if (t < 1) fadeRef.current = requestAnimationFrame(tick);
      else onDone?.();
    };
    fadeRef.current = requestAnimationFrame(tick);
  }, []);

  const toggleSound = useCallback(() => {
    if (!src) return;
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    if (isMuted) {
      audio
        .play()
        .then(() => {
          fadeTo(audio, volume);
          setIsMuted(false);
        })
        .catch(() => setIsMuted(true));
    } else {
      fadeTo(audio, 0, () => audio.pause());
      setIsMuted(true);
    }
  }, [src, isMuted, volume, fadeTo]);

  // Pause in background tabs and resume on return, if the visitor had sound on.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio || isMuted) return;
      if (document.hidden) audio.pause();
      else void audio.play().catch(() => setIsMuted(true));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isMuted]);

  useEffect(
    () => () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  return { isMuted, toggleSound, isAvailable: Boolean(src) };
}
