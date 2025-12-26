'use client';

import { Badge, Icon, Text } from 'opub-ui';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/utils';

interface MetadataProps {
  data: any;
}

export default function Metadata({ data }: MetadataProps) {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <Text variant="headingLg" fontWeight="semibold">
        Metadata
      </Text>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <Text variant="bodySm" className="text-textSubdued">
          Status
        </Text>
        <Badge>{data.status}</Badge>
      </div>

      {/* Created Date */}
      {data.createdAt && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon source={Icons.calendar} />
            <Text variant="bodySm" className="text-textSubdued">
              Created
            </Text>
          </div>
          <Text variant="bodyMd">{formatDate(data.createdAt)}</Text>
        </div>
      )}

      {/* Updated Date */}
      {data.updatedAt && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon source={Icons.calendar} />
            <Text variant="bodySm" className="text-textSubdued">
              Last Updated
            </Text>
          </div>
          <Text variant="bodyMd">{formatDate(data.updatedAt)}</Text>
        </div>
      )}

      {/* Sectors */}
      {data.sectors && data.sectors.length > 0 && (
        <div className="flex flex-col gap-2">
          <Text variant="bodySm" className="text-textSubdued">
            Sectors
          </Text>
          <div className="flex flex-wrap gap-2">
            {data.sectors.map((sector: any) => (
              <Badge key={sector.id}>{sector.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Geographies */}
      {data.geographies && data.geographies.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon source={Icons.globe} />
            <Text variant="bodySm" className="text-textSubdued">
              Geographies
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.geographies.map((geo: any) => (
              <Badge key={geo.id}>{geo.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Visibility */}
      <div className="flex flex-col gap-2">
        <Text variant="bodySm" className="text-textSubdued">
          Visibility
        </Text>
        <Text variant="bodyMd">{data.isPublic ? 'Public' : 'Private'}</Text>
      </div>

      {/* Active Status */}
      <div className="flex flex-col gap-2">
        <Text variant="bodySm" className="text-textSubdued">
          Active
        </Text>
        <Text variant="bodyMd">{data.isActive ? 'Yes' : 'No'}</Text>
      </div>

      {/* Audit Count */}
      {data.auditCount > 0 && (
        <div className="flex flex-col gap-2">
          <Text variant="bodySm" className="text-textSubdued">
            Total Audits
          </Text>
          <Text variant="bodyMd">{data.auditCount}</Text>
        </div>
      )}
    </div>
  );
}
