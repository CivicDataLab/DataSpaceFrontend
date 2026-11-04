import Image from 'next/image';

import { isLumaCoverHost } from '@/lib/luma-cover';

export function EventCover({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className: string;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-surfaceSubdued ${className}`}>
      {src && isLumaCoverHost(src) ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="160px" />
      ) : src ? (
        // Hosts outside the known Luma image domains still render.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
