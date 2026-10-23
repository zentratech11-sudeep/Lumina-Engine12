import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[80svh] flex-col items-start justify-center pt-24">
      <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] font-light text-text">This page doesn’t exist.</h1>
      <p className="mt-5 max-w-[46ch] text-lg text-muted-text">The link may be old, or the address may have a typo.</p>
      <Link href="/" className="pill-button mt-10">
        Go to the home page
      </Link>
    </Container>
  );
}
