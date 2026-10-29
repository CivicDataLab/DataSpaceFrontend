'use client';

import type { KeyboardEvent } from 'react';

export type UnderlineTab = {
  value: string;
  label: string;
};

type UnderlineTabsProps = {
  tabs: UnderlineTab[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  idPrefix?: string;
};

export function UnderlineTabs({
  tabs,
  value,
  onValueChange,
  label = 'Sections',
  idPrefix = 'underline-tab',
}: UnderlineTabsProps) {
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const last = tabs.length - 1;
    let next = index;

    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;

    event.preventDefault();
    const nextTab = tabs[next];
    onValueChange(nextTab.value);
    document.getElementById(`${idPrefix}-${nextTab.value}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-full min-w-0 max-w-full justify-between gap-0 border-b-1 border-solid border-[#e6e8ee] sm:justify-start sm:gap-8"
    >
      {tabs.map((tab, index) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            id={`${idPrefix}-${tab.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.value}`}
            tabIndex={selected ? 0 : -1}
            className={`-mb-px box-border min-w-0 cursor-pointer appearance-none whitespace-nowrap border-x-[0px] border-b-2 border-t-[0px] border-solid bg-transparent px-0 pb-3 pt-2 font-primary text-100 font-medium leading-2 tracking-[0px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue sm:px-1 ${
              selected
                ? 'border-b-primaryBlue text-primaryBlue'
                : 'border-b-transparent text-[#6b6b6b] hover:text-[#0a0a0a]'
            }`}
            onClick={() => onValueChange(tab.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
