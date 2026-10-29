/**
 * Builds the share destinations for a public page: X, LinkedIn, Facebook,
 * email, and copy-link. Copy has no href; the panel writes the URL itself.
 */

export type ShareTarget = {
  id: 'x' | 'linkedin' | 'facebook' | 'email' | 'copy';
  label: string;
  href?: string;
};

export function buildShareTargets(
  pageUrl: string,
  title: string
): ShareTarget[] {
  const url = encodeURIComponent(pageUrl);
  const text = encodeURIComponent(title);

  return [
    {
      id: 'x',
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    },
    {
      id: 'linkedin',
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    },
    {
      id: 'facebook',
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      id: 'email',
      label: 'Share by email',
      href: `mailto:?subject=${text}&body=${url}`,
    },
    {
      id: 'copy',
      label: 'Copy link',
    },
  ];
}
