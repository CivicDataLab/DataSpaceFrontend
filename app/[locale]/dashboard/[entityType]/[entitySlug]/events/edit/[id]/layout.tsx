'use client';

import { ReactNode } from 'react';

import { EventEditStatusProvider } from '../../wizard/context';
import { EventEditFrame } from '../../wizard/EventEditFrame';

export default function EventEditLayout({ children }: { children: ReactNode }) {
  return (
    <EventEditStatusProvider>
      <EventEditFrame>{children}</EventEditFrame>
    </EventEditStatusProvider>
  );
}
