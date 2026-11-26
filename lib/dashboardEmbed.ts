/**
 * Which dashboard hosts may be embedded is decided by the backend: dashboards
 * carry `embedUrl` (null when not allowed) and `checkDashboardLink` runs the
 * same check while the user types. This only adjusts how an allowed link shows.
 */
export const toEmbedSrc = (embedUrl: string | null | undefined) => {
  if (!embedUrl) return null;

  try {
    const url = new URL(embedUrl);
    if (url.pathname.includes('/superset/')) {
      url.searchParams.set('standalone', '1');
    }
    return url.toString();
  } catch {
    return null;
  }
};
