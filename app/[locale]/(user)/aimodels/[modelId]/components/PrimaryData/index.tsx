'use client';

import RichTextRenderer from '@/components/RichTextRenderer/RichTextRenderer';
import { Tag, Text } from 'opub-ui';

interface PrimaryDataModel {
  displayName?: string | null;
  name: string;
  description?: string | null;
  tags?: Array<{ id: string; value: string }> | null;
  metadata?: {
    keyFeatures?: string[];
  } | null;
}

interface PrimaryDataProps {
  data: PrimaryDataModel;
  isLoading: boolean;
}

export default function PrimaryData({ data, isLoading }: PrimaryDataProps) {
  if (isLoading || !data) return null;

  return (
    <div className="flex flex-col gap-4">
      <Text variant="heading2xl">{data.displayName || data.name}</Text>

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <Tag
              key={tag.id}
              fillColor="var(--accent-tertiary-color)"
              borderColor="#5C9A91"
              textColor="black"
            >
              {tag.value}
            </Tag>
          ))}
        </div>
      )}

      {/* About Section */}
      <div className="flex flex-col gap-3">
        <Text variant="headingLg" fontWeight="semibold">
          About
        </Text>
        {data.description ? (
          <RichTextRenderer content={data.description} />
        ) : (
          <Text variant="bodyMd" className="text-textSubdued">
            No description available.
          </Text>
        )}
      </div>

      {/* Key Features - extracted from description if available */}
      {data.metadata?.keyFeatures && (
        <div className="flex flex-col gap-3">
          <Text variant="bodyMd" fontWeight="semibold">
            Key features:
          </Text>
          <ul className="list-disc pl-5">
            {data.metadata.keyFeatures.map((feature: string, index: number) => (
              <li key={index}>
                <Text variant="bodyMd">{feature}</Text>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
