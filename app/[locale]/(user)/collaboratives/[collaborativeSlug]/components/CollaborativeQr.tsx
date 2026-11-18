'use client';

import { QRCodeSVG } from 'qrcode.react';

/** White QR code of the page address, for the dark ecosystem hub. */
export function CollaborativeQr({ url }: { url: string }) {
  return (
    <QRCodeSVG
      value={url}
      size={160}
      level="M"
      marginSize={0}
      fgColor="#ffffff"
      bgColor="transparent"
      title="QR code that opens this collaborative's page"
      className="block aspect-square h-auto w-[44cqw]"
    />
  );
}
