'use client';

import { useEffect, useMemo, useRef } from 'react';
import { IconUser } from '@tabler/icons-react';
import { Button, Icon, SectionCard, Tag, Text, toast } from 'opub-ui';

import styles from './profile.module.scss';

export const BIO_MAX_LENGTH = 500;

export function normalizeProfileUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isProfileUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];

type ProfileImage = File | { url?: string | null; name?: string | null } | null;

export function ProfileSaveButton(props: React.ComponentProps<typeof Button>) {
  return (
    <span className={styles.saveChanges}>
      <Button {...props} />
    </span>
  );
}

export function ProfileShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className={`mb-10 flex flex-col rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault lg:mt-2 ${styles.profile}`}
    >
      <div className="px-6 py-4">
        <Text as="h1" variant="headingLg" color="highlight">
          {title}
        </Text>
        <Text as="p" variant="bodyMd" color="subdued" className="mt-1">
          {subtitle}
        </Text>
      </div>
      <div className="flex flex-col gap-6 border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-6">
        {children}
      </div>
      <div className="flex items-center justify-end gap-3 border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-4">
        {footer}
      </div>
    </div>
  );
}

export function ProfilePictureField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: ProfileImage;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => imageSrc(value), [value]);

  useEffect(() => {
    if (!(value instanceof File) || !preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview, value]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {preview ? (
          // Blob previews and stored uploads both need a plain image element.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surfaceSubdued">
            <Icon source={IconUser} color="subdued" size={18} />
          </span>
        )}
        <Text variant="bodyMd" fontWeight="medium">
          {label}
        </Text>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          className="sr-only"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!PROFILE_IMAGE_EXTENSIONS.includes(extension)) {
              toast.error('Use a JPG or PNG image.');
              return;
            }
            if (file.size > MAX_PROFILE_IMAGE_BYTES) {
              toast.error('Use an image that is 5 MB or smaller.');
              return;
            }
            onChange(file);
          }}
        />
        <Button
          kind="secondary"
          size="slim"
          onClick={() => inputRef.current?.click()}
        >
          Replace
        </Button>
        <Button
          kind="tertiary"
          variant="critical"
          size="slim"
          disabled={!value}
          onClick={() => onChange(null)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

export function ContributionCard({
  datasetCount,
  useCaseCount,
  areas,
  loading,
  failed,
}: {
  datasetCount?: number;
  useCaseCount?: number;
  areas: string[];
  loading: boolean;
  failed: boolean;
}) {
  return (
    <SectionCard
      title="Contributions"
      description="Your published contribution footprint on CivicDataSpace."
    >
      {loading ? (
        <Text as="p" variant="bodyMd" color="subdued">
          Loading your published contributions.
        </Text>
      ) : failed ? (
        <Text as="p" variant="bodyMd" color="critical">
          Couldn&apos;t load your contributions.
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          <Text as="p" variant="bodyMd">
            <Text as="span" fontWeight="semibold" color="interactive">
              {datasetCount ?? 0}
            </Text>
            {' Datasets · '}
            <Text as="span" fontWeight="semibold" color="interactive">
              {useCaseCount ?? 0}
            </Text>
            {' Use cases'}
          </Text>
          {areas.length > 0 ? (
            <div>
              <Text
                as="p"
                variant="bodySm"
                color="subdued"
                className="tracking-wide"
              >
                AREAS OF CONTRIBUTION
              </Text>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {areas.map((area) => (
                  <Tag
                    key={area}
                    variation="filled"
                    fillColor="var(--orange-secondary-color)"
                    textColor="var(--blue-primary-color)"
                    borderRadius="999px"
                  >
                    {area}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}

function imageSrc(value: ProfileImage) {
  if (!value) return null;
  if (value instanceof File) return URL.createObjectURL(value);
  const raw = value.url;
  if (!raw) return null;
  if (raw.startsWith('http') || raw.startsWith('blob:')) return raw;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${raw}`;
}
