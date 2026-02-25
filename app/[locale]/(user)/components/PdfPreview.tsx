'use client';

import { useEffect, useState } from 'react';

interface PdfPreviewProps {
  url: string;
}

export default function PdfPreview({ url }: PdfPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchPdf = async () => {
      try {
        const response = await fetch(url);
        const blobData = await response.blob();

        // Manually set MIME type to PDF (in case it's sent as octet-stream)
        const pdfBlob = new Blob([blobData], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(pdfBlob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load PDF:', error);
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (!previewUrl) return <p>Loading PDF preview...</p>;

  return (
    <object
      data={previewUrl}
      type="application/pdf"
      width="100%"
      height="500px"
    >
      <p>PDF preview not available</p>
    </object>
  );
}
