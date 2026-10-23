'use client';

import { ReactNode } from 'react';

import { ChartEditFrame } from '../../../wizard/ChartEditFrame';
import { ChartEditStatusProvider } from '../../../wizard/context';

export default function ChartImageEditLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ChartEditStatusProvider>
      <ChartEditFrame kind="image">{children}</ChartEditFrame>
    </ChartEditStatusProvider>
  );
}
