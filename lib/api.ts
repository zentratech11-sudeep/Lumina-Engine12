/**
 * Read-only JSON API (TRD §1 "API-server layer", §34). Everything returned is
 * already public on the website. Write endpoints are deliberately absent:
 * add them only together with authentication, as TRD §34 requires.
 */
export const API_VERSION = 1;

export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(
    { version: API_VERSION, data },
    {
      ...init,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        ...init?.headers,
      },
    },
  );
}

export function notFound(message: string): Response {
  return Response.json({ version: API_VERSION, error: message }, { status: 404 });
}
