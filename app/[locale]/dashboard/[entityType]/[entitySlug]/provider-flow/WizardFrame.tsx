'use client';

import { ReactNode } from 'react';
import { Stepper } from 'opub-ui';
import type { StepperItem } from 'opub-ui';

import { WizardHeader, WizardSaveStatus } from './WizardHeader';

interface WizardFrameProps {
  title: string;
  untitledLabel: string;
  goBackURL: string;
  status: WizardSaveStatus;
  steps: StepperItem[];
  currentStep: number;
  onStepClick: (step: number) => void;
  showNavigation: boolean;
  titlePending?: boolean;
  onTitleSave?: (title: string) => void;
  titleFieldName?: string;
  footer?: ReactNode;
  stepperClassName?: string;
}

export function WizardFrame({
  title,
  untitledLabel,
  goBackURL,
  status,
  steps,
  currentStep,
  onStepClick,
  showNavigation,
  titlePending,
  onTitleSave,
  titleFieldName,
  footer,
  stepperClassName,
}: WizardFrameProps) {
  return (
    <div className="mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault pb-6 lg:mt-2">
      <WizardHeader
        title={title}
        untitledLabel={untitledLabel}
        titlePending={titlePending}
        goBackURL={goBackURL}
        status={status}
        onTitleSave={onTitleSave}
        titleFieldName={titleFieldName}
        footer={footer}
      />
      <Stepper
        className={stepperClassName}
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepClick}
        restrictNavigation
        navigation={showNavigation}
        nextLabel="Continue"
        previousLabel="Previous"
      />
    </div>
  );
}
