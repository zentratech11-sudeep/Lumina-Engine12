"use client";

/** Last-resort boundary for errors in the root layout itself. Uses inline styles because global CSS may not have loaded. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#050708", color: "#eef1f2", fontFamily: "Georgia, serif" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontWeight: 300, fontSize: "2.5rem" }}>Something went wrong.</h1>
          <button type="button" onClick={reset} style={{ marginTop: 24, padding: "12px 28px", borderRadius: 999, border: "1px solid #c9ced1", background: "transparent", color: "inherit", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
