"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Route-level error boundary (TRD §28): one broken section never takes the whole site down. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[80svh] max-w-[1440px] flex-col items-start justify-center px-5 pt-24 sm:px-8 lg:px-12">
      <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-light text-text">Something went wrong on this page.</h1>
      <p className="mt-5 max-w-[46ch] text-lg text-muted-text">Try again, or head back to the home page.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button type="button" onClick={reset} className="submit-button">
          Try again
        </button>
        <Link href="/" className="pill-button">
          Home page
        </Link>
      </div>
    </div>
  );
}
