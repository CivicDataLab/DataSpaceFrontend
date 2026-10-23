'use client';

import { ReactNode } from 'react';

import { ChartEditFrame } from '../../wizard/ChartEditFrame';
import { ChartEditStatusProvider } from '../../wizard/context';

export default function ChartEditLayout({ children }: { children: ReactNode }) {
  return (
    <ChartEditStatusProvider>
      <ChartEditFrame kind="viz">{children}</ChartEditFrame>
    </ChartEditStatusProvider>
  );
}
