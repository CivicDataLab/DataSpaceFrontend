const getConfiguredProtocol = () => {
  const configured = process.env.NEXT_PUBLIC_PLATFORM_PROTOCOL?.trim();
  if (configured) {
    return configured.endsWith(':') ? configured : `${configured}:`;
  }

  try {
    return new URL(
      process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'
    ).protocol;
  } catch {
    return 'http:';
  }
};

const getConfiguredDomain = () => {
  const configured = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN?.trim();
  if (configured) {
    return configured
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .toLowerCase();
  }

  try {
    return new URL(
      process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'
    ).hostname.toLowerCase();
  } catch {
    return null;
  }
};

const getConfiguredPortSuffix = () => {
  const configuredPort = process.env.NEXT_PUBLIC_PLATFORM_PORT?.trim();
  if (configuredPort) {
    return configuredPort.startsWith(':')
      ? configuredPort
      : `:${configuredPort}`;
  }

  try {
    const url = new URL(
      process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'
    );
    return url.port ? `:${url.port}` : '';
  } catch {
    return '';
  }
};

const getCurrentLocalePrefix = () => {
  if (typeof window === 'undefined') return '';
  const match = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/i);
  if (!match) return '';
  return `/${match[1].toLowerCase()}`;
};

const RESERVED_SUBDOMAINS = new Set([
  'www',
  // env / infra
  'dev',
  'staging',
  'stage',
  'test',
  'qa',
  'prod',
  'production',
  // common app/service hosts
  'app',
  'api',
  'admin',
  'assets',
  'static',
  'cdn',
  // existing path-like prefix used in this app
]);

export const isCollaborativeSubdomainHost = (
  hostname: string,
  configuredDomain?: string | null
) => {
  const currentHost = (hostname || '').toLowerCase();
  if (!currentHost) return false;

  const domain = (
    configuredDomain ||
    getConfiguredDomain() ||
    ''
  ).toLowerCase();
  if (!domain || currentHost === domain) return false;

  let slug: string | null = null;

  // Local development support: <slug>.collab.localhost
  if (domain === 'collab.localhost' || domain === 'collab.127.0.0.1') {
    const localSuffix =
      domain === 'collab.localhost' ? '.collab.localhost' : '.collab.127.0.0.1';
    if (!currentHost.endsWith(localSuffix)) return false;
    slug = currentHost.slice(0, -localSuffix.length);
  } else {
    const suffix = `.${domain}`;
    if (!currentHost.endsWith(suffix)) return false;
    slug = currentHost.slice(0, -suffix.length);
  }

  if (!slug) return false;
  if (slug.includes('.')) return false; // prevent nested subdomains
  if (RESERVED_SUBDOMAINS.has(slug)) return false;
  return true;
};

export const getCollaborativeDetailUrl = (slug?: string | null) => {
  if (!slug) return '/collaboratives';

  const domain = getConfiguredDomain();
  if (!domain) return `/collaboratives/${slug}`;

  const protocol = getConfiguredProtocol();
  const localePrefix = getCurrentLocalePrefix();

  if (domain === 'collab.localhost' || domain === 'collab.127.0.0.1') {
    const portSuffix = getConfiguredPortSuffix();
    console.log('portSuffix', portSuffix);
    const host =
      domain === 'collab.127.0.0.1' ? 'collab.127.0.0.1' : 'collab.localhost';
    return `${protocol}//${slug}.${host}${portSuffix}${localePrefix}`;
  }
  return `${protocol}//${slug}.${domain}${localePrefix}`;
};

export const getPlatformRootUrl = () => {
  const domain = getConfiguredDomain();
  if (!domain) return '/';

  const protocol = getConfiguredProtocol();
  const localePrefix = getCurrentLocalePrefix();

  // Local dev: keep port (e.g. collab.localhost:3000)
  if (domain === 'collab.localhost' || domain === 'collab.127.0.0.1') {
    const portSuffix = getConfiguredPortSuffix();
    return `${protocol}//${domain}${portSuffix}${localePrefix}`;
  }

  return `${protocol}//${domain}${localePrefix}`;
};
