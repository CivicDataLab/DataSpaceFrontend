'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

type MediaImageProps = ImageProps & {
  /** Shown when there is no src or the image fails to load. */
  fallback?: string;
};

// Media URLs point at S3/CloudFront. They are loaded unoptimized so next/image
// never checks them against images.remotePatterns: an unlisted host there
// throws during render and takes the whole page into its error boundary.
// Presigned URLs also change on every request, so optimizing them caches nothing.
export default function MediaImage({
  src,
  alt,
  fallback = '/org.png',
  onError,
  unoptimized,
  ...props
}: MediaImageProps) {
  // Remember which src failed, so a new one (e.g. after an upload) gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<ImageProps['src'] | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  const resolved = !src || failed ? fallback : src;
  const isRemote =
    typeof resolved === 'string' && /^https?:\/\//.test(resolved);

  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      unoptimized={unoptimized ?? isRemote}
      onError={(event) => {
        // 403/404 from the bucket, or an expired presigned URL.
        if (!failed) setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
