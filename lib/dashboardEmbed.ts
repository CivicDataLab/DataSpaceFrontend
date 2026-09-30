/** Parse a pasted dashboard link or bare domain into an http(s) URL. */
const toHttpUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      return url;
    }
    if (trimmed.includes('://')) return null;
    return new URL(`https://${trimmed}`);
  } catch {
    return null;
  }
};

const hostnameOf = (value: string) =>
  toHttpUrl(value)?.hostname.toLowerCase().replace(/\.$/, '') ?? null;

const isHostAllowed = (host: string, allowed: Set<string>) => {
  for (const domain of allowed) {
    if (host === domain || host.endsWith(`.${domain}`)) return true;
  }
  return false;
};

/** Returns an iframe src if the link's domain is on NEXT_PUBLIC_DASHBOARD_EMBED_ORIGINS. */
export const getSafeEmbedUrl = (link: string | null | undefined) => {
  if (!link?.trim()) return null;

  const url = toHttpUrl(link);
  if (!url) return null;

  const configured = (process.env.NEXT_PUBLIC_DASHBOARD_EMBED_ORIGINS || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    const allowed = new Set<string>();
    for (const entry of configured) {
      const host = hostnameOf(entry);
      if (host) allowed.add(host);
    }
    const analytics = process.env.NEXT_PUBLIC_ANALYTICS_URL;
    if (analytics) {
      const host = hostnameOf(analytics);
      if (host) allowed.add(host);
    }
    const linkHost = hostnameOf(link);
    if (!linkHost || !isHostAllowed(linkHost, allowed)) return null;
  }

  if (url.pathname.includes('/superset/')) {
    url.searchParams.set('standalone', '1');
  }

  return url.toString();
};
