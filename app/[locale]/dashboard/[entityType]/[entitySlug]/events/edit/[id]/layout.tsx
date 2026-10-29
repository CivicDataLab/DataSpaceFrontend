'use client';

import { ReactNode } from 'react';

import { EventEditFrame } from '../../wizard/EventEditFrame';
import { EventEditStatusProvider } from '../../wizard/context';

export default function EventEditLayout({ children }: { children: ReactNode }) {
  return (
    <EventEditStatusProvider>
      <EventEditFrame>{children}</EventEditFrame>
    </EventEditStatusProvider>
  );
}
