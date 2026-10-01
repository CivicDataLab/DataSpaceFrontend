export const MAX_PUBLICATION_FILE_BYTES = 50 * 1024 * 1024;

export const PUBLICATION_FILE_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
] as const;

export const PUBLICATION_FILE_ACCEPT = PUBLICATION_FILE_EXTENSIONS.map(
  (extension) => `.${extension}`
).join(',');

export const LICENSE_OPTIONS = [
  {
    label: 'CC BY 4.0',
    value: 'CC_BY_4_0_ATTRIBUTION',
  },
  {
    label: 'CC BY-SA 4.0',
    value: 'CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE',
  },
  {
    label: 'Government Open Data License',
    value: 'GOVERNMENT_OPEN_DATA_LICENSE',
  },
  {
    label: 'Open Data Commons (Attribution)',
    value: 'OPEN_DATA_COMMONS_BY_ATTRIBUTION',
  },
  { label: 'Open Database License', value: 'OPEN_DATABASE_LICENSE' },
];

export type ContributorDraft = {
  id: string;
  name: string;
  username?: string;
  imageUrl?: string;
};

export type TagOption = {
  label: string;
  value: string;
};

export type DetailsDraft = {
  title: string;
  description: string;
  publicationDate: string;
  license: string;
  resourceTypeId: string;
  sectors: TagOption[];
  geographies: TagOption[];
  externalSourceLink: string;
  contributors: ContributorDraft[];
};

export type PendingBlock =
  | {
      id: string;
      kind: 'file';
      file: File;
      addedAt: string;
      title: string;
      description: string;
    }
  | {
      id: string;
      kind: 'video';
      url: string;
      videoId: string;
      addedAt: string;
      title: string;
      description: string;
    };

export function fileDisplayTitle(name: string) {
  const base = name.split(/[/\\]/).pop() ?? name;
  const stem = base.includes('.') ? base.slice(0, base.lastIndexOf('.')) : base;
  return stem || base;
}

export type NavigateResult = { id: string; step?: number };

export function publicationWriteInput(details: DetailsDraft) {
  return {
    title: details.title.trim(),
    description: details.description.trim(),
    authors: details.contributors
      .map((contributor) => contributor.name.trim())
      .filter(Boolean),
    publicationDate: details.publicationDate || null,
    license: details.license || null,
    resourceTypeId: details.resourceTypeId || null,
    sectorIds: (details.sectors ?? []).map((sector) => sector.value),
    geographyIds: (details.geographies ?? [])
      .map((geography) => Number.parseInt(geography.value, 10))
      .filter((id) => Number.isFinite(id)),
    externalSourceLink: details.externalSourceLink.trim() || null,
  };
}

export function emptyDetails(): DetailsDraft {
  return {
    title: '',
    description: '',
    publicationDate: '',
    license: '',
    resourceTypeId: '',
    sectors: [],
    geographies: [],
    externalSourceLink: '',
    contributors: [],
  };
}

export function licenseLabel(value?: string | null) {
  return LICENSE_OPTIONS.find((option) => option.value === value)?.label ?? value ?? '';
}

export function fileExtension(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return extension;
}

export function isAllowedPublicationFile(file: File) {
  return PUBLICATION_FILE_EXTENSIONS.includes(
    fileExtension(file.name) as (typeof PUBLICATION_FILE_EXTENSIONS)[number]
  );
}

export function formatFileSize(bytes?: number | null) {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadedAt(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', { hour12: false });
}

export function youtubeVideoId(url: string) {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] ?? null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] ?? null;
      }
      return parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

export function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export type DetailsErrors = Partial<Record<keyof DetailsDraft, string>>;

export function detailsErrors(details: DetailsDraft): DetailsErrors {
  const errors: DetailsErrors = {};
  if (!details.title.trim()) errors.title = 'Enter a resource name.';
  if (!details.description.trim()) errors.description = 'Enter a description.';
  if (details.contributors.length === 0) {
    errors.contributors = 'Add at least one contributor.';
  }
  if (!details.publicationDate) errors.publicationDate = 'Enter a date.';
  if (!details.license) errors.license = 'Select usage rights.';
  if (!details.resourceTypeId) errors.resourceTypeId = 'Select a resource type.';
  if ((details.sectors ?? []).length === 0) {
    errors.sectors = 'Select at least one sector.';
  }
  if ((details.geographies ?? []).length === 0) {
    errors.geographies = 'Select at least one geography.';
  }
  if (
    details.externalSourceLink.trim() &&
    !isHttpUrl(details.externalSourceLink)
  ) {
    errors.externalSourceLink = 'Enter a valid URL.';
  }
  return errors;
}

export function isDetailsComplete(details: DetailsDraft) {
  return Object.keys(detailsErrors(details)).length === 0;
}

export function mutationMessage(
  payload:
    | {
        success?: boolean | null;
        errors?: {
          nonFieldErrors?: Array<string | null> | null;
          fieldErrors?: Array<{
            messages?: Array<string | null> | null;
          } | null> | null;
        } | null;
      }
    | null
    | undefined,
  fallback: string
) {
  if (!payload || payload.success) return null;
  const fieldMessage = payload.errors?.fieldErrors
    ?.flatMap((item) => item?.messages ?? [])
    .find((message): message is string => Boolean(message));
  return (
    payload.errors?.nonFieldErrors?.find(
      (message): message is string => Boolean(message)
    ) ||
    fieldMessage ||
    fallback
  );
}

export function errorText(error: unknown, fallback: string) {
  return typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
    ? error.message
    : fallback;
}
