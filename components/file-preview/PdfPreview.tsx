'use client';

import { useEffect, useRef, useState } from 'react';

import { PdfPreviewSkeleton } from './PreviewSkeleton';

interface PdfPreviewProps {
  url: string;
  height?: string;
  onError?: () => void;
}

export default function PdfPreview({
  url,
  height = '500px',
  onError,
}: PdfPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const fetchPdf = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          onErrorRef.current?.();
          return;
        }
        const blobData = await response.blob();
        if (!blobData.size) {
          onErrorRef.current?.();
          return;
        }
        const pdfBlob = new Blob([blobData], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(pdfBlob);
        if (!cancelled) setPreviewUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        onErrorRef.current?.();
      }
    };

    fetchPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (!previewUrl) return <PdfPreviewSkeleton height={height} />;

  return (
    <object
      data={previewUrl}
      type="application/pdf"
      width="100%"
      style={{
        display: 'block',
        width: '100%',
        height,
      }}
    >
      <p>PDF preview not available</p>
    </object>
  );
}
