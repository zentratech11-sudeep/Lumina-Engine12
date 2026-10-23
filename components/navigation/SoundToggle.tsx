"use client";

import { useSound } from "@/hooks/useSound";
import { SoundOffIcon, SoundOnIcon } from "@/components/ui/Icons";

/** Turns the brand's ambient audio on and off. Sound never starts without this click. */
export function SoundToggle({ src, volume }: { src: string; volume: number }) {
  const { isMuted, toggleSound } = useSound({ src, volume });
  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={!isMuted}
      aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
      className="icon-button"
    >
      {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
    </button>
  );
}
