/**
 * Saves part of a public page (a dataset's data card, a collaborative's hero)
 * as a PNG the visitor can share. Stylesheets from other origins are taken
 * out while the picture is drawn, because the browser will not let the
 * drawing code read them.
 */

type DownloadCardOptions = {
  /** Ending of the file name, e.g. `data-card` gives `my-dataset-data-card.png`. */
  fileSuffix: string;
  backgroundColor: string;
};

/**
 * One light grey pixel, drawn in place of any image the browser still won't
 * let us copy. Without it a single blocked image makes the whole download fail.
 */
const IMAGE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

export async function downloadCardImage(
  title: string,
  element: HTMLElement,
  { fileSuffix, backgroundColor }: DownloadCardOptions
) {
  const { toPng } = await import('html-to-image');
  const blocked = remoteStylesheets();
  const markers = blocked.map((node) => {
    const marker = document.createComment('remote-stylesheet');
    node.replaceWith(marker);
    return { node, marker };
  });
  const restoreImages = await loadRemoteImagesSameOrigin(element);
  try {
    const href = await toPng(element, {
      pixelRatio: 2,
      backgroundColor,
      includeQueryParams: true,
      imagePlaceholder: IMAGE_PLACEHOLDER,
    });
    const link = document.createElement('a');
    link.href = href;
    link.download = cardFileName(title, fileSuffix);
    link.click();
  } finally {
    restoreImages();
    for (const { node, marker } of markers) marker.replaceWith(node);
  }
}

/**
 * Images on another host (the storage CDN) send no CORS header, so the
 * drawing code cannot copy them. While the picture is drawn, load them through
 * this site's own image route instead; the host must be allowed in
 * `images.remotePatterns`. Returns a function that puts the original sources
 * back.
 */
async function loadRemoteImagesSameOrigin(element: HTMLElement) {
  const swapped = [...element.querySelectorAll('img')].flatMap((img) => {
    const src = img.currentSrc || img.src;
    if (!src || new URL(src, location.href).origin === location.origin) {
      return [];
    }
    const original = { img, src: img.getAttribute('src'), srcset: img.srcset };
    img.removeAttribute('srcset');
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;
    return [original];
  });

  await Promise.all(
    swapped.map(({ img }) => img.decode().catch(() => undefined))
  );

  return () => {
    for (const { img, src, srcset } of swapped) {
      if (srcset) img.srcset = srcset;
      if (src !== null) img.setAttribute('src', src);
    }
  };
}

function cardFileName(title: string, suffix: string) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'page'}-${suffix}.png`;
}

function remoteStylesheets() {
  return [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
    (node): node is HTMLLinkElement => {
      if (!(node instanceof HTMLLinkElement) || !node.sheet) return false;
      try {
        void node.sheet.cssRules;
        return false;
      } catch {
        return true;
      }
    }
  );
}
