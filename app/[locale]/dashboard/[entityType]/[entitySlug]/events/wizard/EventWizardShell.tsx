'use client';

import { ReactNode } from 'react';
import { IconCalendarEvent, IconEye } from '@tabler/icons-react';
import type { StepperItem } from 'opub-ui';
import { Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';
import type { ProviderSaveStatus } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/edit-status';
import { WizardFrame } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/WizardFrame';
import { wizardStepContent } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/step-content';

import styles from './wizard.module.scss';

export function EventWizardShell({
  title,
  titlePending,
  onTitleSave,
  goBackURL,
  status,
  currentStep,
  detailsComplete,
  onStepClick,
  setStepShowErrors,
  children,
}: {
  title: string;
  titlePending?: boolean;
  onTitleSave?: (title: string) => void;
  goBackURL: string;
  status: ProviderSaveStatus;
  currentStep: number;
  detailsComplete: boolean;
  onStepClick: (step: number) => void;
  setStepShowErrors: (show: boolean) => void;
  children: ReactNode;
}) {
  const steps: StepperItem[] = [
    {
      step: 1,
      label: 'Details',
      description: 'Name, location, dates, and Luma embed',
      icon: IconCalendarEvent,
      isCompleted: detailsComplete,
      content: wizardStepContent(currentStep === 1, children, setStepShowErrors),
    },
    {
      step: 2,
      label: 'Review & Publish',
      description: 'Check readiness',
      icon: IconEye,
      isCompleted: false,
      content: wizardStepContent(currentStep === 2, children, setStepShowErrors),
    },
  ];

  return (
    <WizardFrame
      title={title}
      untitledLabel="Untitled event"
      titlePending={titlePending}
      onTitleSave={onTitleSave}
      titleFieldName="eventTitle"
      goBackURL={goBackURL}
      status={status}
      stepperClassName={styles.eventStepper}
      steps={steps}
      currentStep={currentStep}
      onStepClick={onStepClick}
      showNavigation={currentStep !== 2}
      footer={
        <div className="border ml-3 flex w-fit items-center gap-2 rounded-full border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault px-2 py-1">
          <Icon source={Icons.globe} size={16} color="default" />
          <Text variant="bodySm" color="subdued">
            Public visibility · Public once published
          </Text>
        </div>
      }
    />
  );
}
