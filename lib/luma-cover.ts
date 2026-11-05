/**
 * Cover images for public event cards. The embed URL already contains the
 * Luma event id. The cover is read on the server and cached; the browser
 * never calls Luma.
 */

const LUMA_EVENT_ID = /\/embed\/event\/(evt-[A-Za-z0-9]+)/;
const COVER_HOSTS = new Set([
  'images.lumacdn.com',
  'images.lu.ma',
  'cdn.lu.ma',
]);

export type LumaCover = {
  coverUrl: string | null;
  startAt: string | null;
};

const emptyCover: LumaCover = { coverUrl: null, startAt: null };

export function lumaEventIdFromEmbed(src: string | null | undefined) {
  if (!src) return null;
  return src.match(LUMA_EVENT_ID)?.[1] ?? null;
}

export function isLumaCoverHost(url: string) {
  try {
    return COVER_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

export async function lumaCover(
  src: string | null | undefined
): Promise<LumaCover> {
  const eventId = lumaEventIdFromEmbed(src);
  if (!eventId) return emptyCover;

  try {
    const response = await fetch(
      `https://api2.luma.com/event/get?event_api_id=${encodeURIComponent(eventId)}`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return emptyCover;
    const body = (await response.json()) as {
      event?: { cover_url?: unknown; start_at?: unknown };
      cover_url?: unknown;
      start_at?: unknown;
    };
    const event = body.event ?? body;
    const coverUrl = text(event.cover_url);
    return {
      coverUrl: coverUrl?.startsWith('https://') ? coverUrl : null,
      startAt: text(event.start_at),
    };
  } catch {
    return emptyCover;
  }
}
