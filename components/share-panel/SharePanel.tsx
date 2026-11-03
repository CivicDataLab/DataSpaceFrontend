'use client';

import { useEffect, useState } from 'react';
import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandX,
  IconCheck,
  IconCopy,
  IconLink,
  IconMail,
  IconPhoto,
} from '@tabler/icons-react';

import { buildShareTargets, type ShareTarget } from './share-targets';

type SharePanelProps = {
  label?: string;
  url: string;
  title: string;
  /** Dataset page: Copy link and Download Data Card sit above the share icons. */
  showPageActions?: boolean;
  onDownloadCard?: () => void;
};

const SHARE_ICON = {
  x: IconBrandX,
  linkedin: IconBrandLinkedin,
  facebook: IconBrandFacebook,
  email: IconMail,
  copy: IconLink,
} as const;

export function SharePanel({
  label,
  url,
  title,
  showPageActions = false,
  onDownloadCard,
}: SharePanelProps) {
  const targets = buildShareTargets(url, title).filter(
    (target) => !showPageActions || target.id !== 'copy'
  );
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFailed(false);
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }

  return (
    <div>
      {showPageActions ? (
        <div className="flex flex-col">
          <PageAction
            label={copied ? 'Link copied' : 'Copy link'}
            icon={copied ? IconCheck : IconCopy}
            onSelect={onCopy}
          />
          <PageAction
            label="Download Data Card"
            icon={IconPhoto}
            onSelect={() => onDownloadCard?.()}
          />
          <div className="mx-2 my-2 border-t-[0.8px] border-solid border-[#e5e5e5]" />
        </div>
      ) : null}
      {label ? (
        <p
          className={
            showPageActions
              ? 'm-0 px-2 font-primary text-75 font-medium uppercase leading-1 tracking-[0.6px] text-[#6b6b6b]'
              : 'text-75 font-medium uppercase leading-1 tracking-[0.3px] text-[#0a0a0a]'
          }
        >
          {label}
        </p>
      ) : null}
      <div
        className={
          label
            ? `${showPageActions ? 'mt-2 px-2' : 'mt-3'} flex flex-nowrap gap-1.5`
            : 'flex flex-nowrap gap-1.5'
        }
      >
        {targets.map((target) => (
          <ShareAction
            key={target.id}
            target={target}
            copied={copied}
            onCopy={onCopy}
          />
        ))}
      </div>
      <p
        className={copyFailed ? 'mt-2 text-75 text-textCritical' : 'sr-only'}
        aria-live="polite"
      >
        {copied ? 'Link copied' : copyFailed ? 'Could not copy the link' : ''}
      </p>
    </div>
  );
}

function PageAction({
  label,
  icon: IconComponent,
  onSelect,
}: {
  label: string;
  icon: typeof IconCopy;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full appearance-none items-center gap-2 rounded-[8px] border-[0px] bg-transparent px-2 py-2 text-left font-primary text-100 font-medium leading-2 text-[#0a0a0a] hover:bg-[#f4f4f5]"
      onClick={onSelect}
    >
      <IconComponent
        size={16}
        stroke={2}
        className="shrink-0 text-[#0a0a0a]"
        aria-hidden
      />
      {label}
    </button>
  );
}

function ShareAction({
  target,
  copied,
  onCopy,
}: {
  target: ShareTarget;
  copied: boolean;
  onCopy: () => void;
}) {
  const name = copied && target.id === 'copy' ? 'Link copied' : target.label;
  const className =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-1 border-solid border-[#e5e5e5] bg-transparent p-0 text-[#6b6b6b] transition-colors hover:border-primaryBlue hover:text-primaryBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue';
  const IconComponent =
    copied && target.id === 'copy' ? IconCheck : SHARE_ICON[target.id];

  if (!target.href) {
    return (
      <button
        type="button"
        className={className}
        aria-label={name}
        onClick={onCopy}
      >
        <IconComponent size={16} stroke={2} aria-hidden />
      </button>
    );
  }

  return (
    <a
      className={className}
      href={target.href}
      aria-label={target.label}
      target={target.id === 'email' ? undefined : '_blank'}
      rel={target.id === 'email' ? undefined : 'noopener noreferrer'}
    >
      <IconComponent size={16} stroke={2} aria-hidden />
    </a>
  );
}
