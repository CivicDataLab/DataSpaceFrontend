export const EventStatus = {
  Draft: 'DRAFT',
  Published: 'PUBLISHED',
} as const;

const LUMA_HOSTS = new Set(['lu.ma', 'www.lu.ma', 'luma.com', 'www.luma.com']);

export type LumaEmbed = {
  src: string;
  width?: string | null;
  height?: string | null;
  style?: string | null;
  title?: string | null;
  allow?: string | null;
  allowfullscreen?: boolean | null;
  frameborder?: string | null;
  referrerpolicy?: string | null;
  loading?: string | null;
};

export type EventDraft = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  lumaEmbed: string;
};

export type EventFieldErrors = Partial<Record<keyof EventDraft, string>>;

export function emptyEventDraft(): EventDraft {
  return {
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    lumaEmbed: '',
  };
}

export function eventsBasePath(entityType: string, entitySlug: string) {
  return `/dashboard/${entityType}/${entitySlug}/events`;
}

export function entityHeaders(
  entityType: string,
  entitySlug: string
): Record<string, string> {
  if (entityType === 'self') return {};
  return { [entityType]: entitySlug };
}

function decodeEmbed(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const EMBED_ATTRS = [
  'width',
  'height',
  'style',
  'title',
  'allow',
  'frameborder',
  'referrerpolicy',
  'loading',
] as const;

function canonicalLumaSrc(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!LUMA_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (!url.pathname.startsWith('/embed/')) return null;
  url.hash = '';
  return url.toString();
}

export function parseLumaEmbed(value: string): LumaEmbed | null {
  const trimmed = decodeEmbed(value).trim();
  if (!trimmed) return null;
  if (/<\s*script/i.test(trimmed) || /\son[a-z]+\s*=/i.test(trimmed)) return null;

  const iframe = trimmed.match(/<iframe\b([^>]*)>/i);
  const source = iframe ? iframe[1] : '';
  const src = iframe
    ? canonicalLumaSrc(source.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? '')
    : canonicalLumaSrc(trimmed);
  if (!src) return null;
  if (!iframe) return { src };

  const embed: LumaEmbed = { src };
  for (const name of EMBED_ATTRS) {
    const match = source.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
    if (match?.[1]) embed[name] = match[1];
  }
  if (/\sallowfullscreen\b/i.test(source)) embed.allowfullscreen = true;
  return embed;
}

export function formatLumaEmbed(embed?: LumaEmbed | null): string {
  if (!embed?.src) return '';
  const parts = [`src="${embed.src}"`];
  for (const name of EMBED_ATTRS) {
    const value = embed[name];
    if (typeof value === 'string' && value && !value.includes('"')) {
      parts.push(`${name}="${value}"`);
    }
  }
  if (embed.allowfullscreen) parts.push('allowfullscreen');
  return `<iframe ${parts.join(' ')}></iframe>`;
}

export function extractLumaEmbedUrl(value: string): string | null {
  return parseLumaEmbed(value)?.src ?? null;
}

export function eventFieldErrors(
  draft: EventDraft,
  requireComplete: boolean
): EventFieldErrors {
  const errors: EventFieldErrors = {};
  const embed = draft.lumaEmbed.trim();
  const parsedEmbed = embed ? parseLumaEmbed(embed) : null;

  if (requireComplete && !draft.name.trim()) errors.name = 'Name is required.';
  if (requireComplete && !draft.location.trim()) {
    errors.location = 'Location is required.';
  }
  if (requireComplete && !draft.startDate) {
    errors.startDate = 'Start date is required.';
  }
  if (requireComplete && !draft.endDate) errors.endDate = 'End date is required.';
  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }
  if (embed && !parsedEmbed) {
    errors.lumaEmbed = 'Paste a Luma embed iframe or an https://lu.ma/embed/ URL.';
  } else if (requireComplete && !parsedEmbed) {
    errors.lumaEmbed = 'A Luma embed is required.';
  }
  return errors;
}

export function isEventComplete(draft: EventDraft) {
  return Object.keys(eventFieldErrors(draft, true)).length === 0;
}

export function eventWriteInput(draft: EventDraft) {
  const embed = draft.lumaEmbed.trim();
  return {
    name: draft.name.trim(),
    location: draft.location.trim(),
    startDate: draft.startDate || null,
    endDate: draft.endDate || null,
    lumaEmbed: embed || null,
  };
}

export function formatEventDate(value?: string | null) {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '—';
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function mutationMessage(
  payload:
    | {
        success?: boolean | null;
        errors?: {
          nonFieldErrors?: Array<string | null> | null;
          fieldErrors?: Array<{
            messages?: Array<string | null> | null;
          } | null> | null;
        } | null;
      }
    | null
    | undefined,
  fallback: string
) {
  if (!payload || payload.success) return null;
  const fieldMessage = payload.errors?.fieldErrors
    ?.flatMap((item) => item?.messages ?? [])
    .find((message): message is string => Boolean(message));
  return (
    payload.errors?.nonFieldErrors?.find(
      (message): message is string => Boolean(message)
    ) ||
    fieldMessage ||
    fallback
  );
}

export function errorText(error: unknown, fallback: string) {
  return typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
    ? error.message
    : fallback;
}
