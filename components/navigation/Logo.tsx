import Image from "next/image";
import Link from "next/link";
import type { BrandLogo } from "@/types/brand";

/** The brand mark: an image if the brand provides one, otherwise a typeset wordmark. */
export function Logo({ logo, name }: { logo: BrandLogo; name: string }) {
  return (
    <Link href="/" className="inline-flex items-center rounded-sm" aria-label={`${name} home`}>
      {logo.type === "image" ? (
        <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} priority className="h-6 w-auto" />
      ) : (
        <span className="font-display text-[1.35rem] font-normal tracking-[0.14em] text-text">{logo.text}</span>
      )}
    </Link>
  );
}
