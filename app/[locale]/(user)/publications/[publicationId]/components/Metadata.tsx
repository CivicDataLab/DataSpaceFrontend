'use client';

import { Text } from 'opub-ui';

type Tag = { id: string; name: string };
type PublicationMeta = {
  license: string;
  downloadCount: number;
  sectors: Tag[];
  geographies: Tag[];
  organization?: { name: string } | null;
  user?: { fullName?: string | null } | null;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-solid border-greyExtralight py-3">
      <Text variant="bodySm" className="uppercase text-textSubdued">
        {label}
      </Text>
      <Text variant="bodyMd">{value}</Text>
    </div>
  );
}

/** The right-rail metadata panel: owner, license, tags and download count. */
export function Metadata({ data }: { data: PublicationMeta }) {
  const owner = data.organization?.name || data.user?.fullName || 'Individual';

  return (
    <div className="flex flex-col">
      <Row label="Published by" value={owner} />
      <Row label="License" value={data.license} />
      {data.sectors?.length > 0 && (
        <Row label="Sectors" value={data.sectors.map((s) => s.name).join(', ')} />
      )}
      {data.geographies?.length > 0 && (
        <Row
          label="Geographies"
          value={data.geographies.map((g) => g.name).join(', ')}
        />
      )}
      <Row label="Downloads" value={data.downloadCount} />
    </div>
  );
}
