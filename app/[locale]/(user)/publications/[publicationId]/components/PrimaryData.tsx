'use client';

import { Text } from 'opub-ui';

type PublicationData = {
  title: string;
  description?: string | null;
  authors: string[];
  publicationDate?: string | null;
  externalSourceLink?: string | null;
  resourceType?: { name: string } | null;
};

/** Title, abstract, authors and the external source link — the resource's headline. */
export function PrimaryData({ data }: { data: PublicationData }) {
  return (
    <div className="flex flex-col gap-4">
      {data.resourceType?.name && (
        <Text variant="bodySm" className="uppercase text-textSubdued">
          {data.resourceType.name}
        </Text>
      )}
      <Text variant="heading2xl">{data.title}</Text>
      {data.authors?.length > 0 && (
        <Text variant="bodyMd" className="text-textSubdued">
          By {data.authors.join(', ')}
        </Text>
      )}
      {data.publicationDate && (
        <Text variant="bodySm" className="text-textSubdued">
          {data.publicationDate}
        </Text>
      )}
      {data.description && (
        <Text variant="bodyMd" className="whitespace-pre-line">
          {data.description}
        </Text>
      )}
      {data.externalSourceLink && (
        <a
          href={data.externalSourceLink}
          target="_blank"
          rel="noreferrer"
          className="text-actionPrimaryDefault underline"
        >
          External source
        </a>
      )}
    </div>
  );
}
