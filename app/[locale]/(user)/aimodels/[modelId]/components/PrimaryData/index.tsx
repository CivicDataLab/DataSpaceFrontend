'use client';

import { Badge, Icon, Text } from 'opub-ui';
import { Icons } from '@/components/icons';

interface PrimaryDataProps {
  data: any;
  isLoading: boolean;
}

export default function PrimaryData({ data, isLoading }: PrimaryDataProps) {
  if (isLoading || !data) return null;

  const isIndividual = !data.organization;
  
  const publisherImage = isIndividual
    ? data?.user?.profilePicture?.url
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.user.profilePicture.url}`
      : '/profile.png'
    : data?.organization?.logo?.url
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.organization.logo.url}`
      : '/org.png';

  const publisherName = isIndividual
    ? data?.user?.fullName
    : data?.organization?.name;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge>{data.modelType}</Badge>
          <Badge>{data.provider}</Badge>
          {data.version && <Badge>{`v${data.version}`}</Badge>}
        </div>
        
        <Text variant="heading2xl" fontWeight="bold">
          {data.displayName || data.name}
        </Text>

        {data.providerModelId && (
          <Text variant="bodyMd" className="text-textSubdued">
            Model ID: {data.providerModelId}
          </Text>
        )}
      </div>

      {/* Publisher Info */}
      <div className="flex items-center gap-3 rounded-lg border border-greyExtralight p-4">
        <img
          src={publisherImage}
          alt={publisherName}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <Text variant="bodyMd" className="text-textSubdued">
            Published by
          </Text>
          <Text variant="bodyLg" fontWeight="semibold">
            {publisherName}
          </Text>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Text variant="headingLg" fontWeight="semibold">
          Description
        </Text>
        <Text variant="bodyMd" className="whitespace-pre-wrap">
          {data.description}
        </Text>
      </div>

      {/* Capabilities */}
      {(data.maxTokens || data.supportsStreaming || data.supportedLanguages?.length > 0) && (
        <div className="flex flex-col gap-3">
          <Text variant="headingLg" fontWeight="semibold">
            Capabilities
          </Text>
          <div className="grid gap-3 md:grid-cols-2">
            {data.maxTokens && (
              <div className="flex items-center gap-2 rounded-lg border border-greyExtralight p-3">
                <Icon source={Icons.info} />
                <div>
                  <Text variant="bodySm" className="text-textSubdued">
                    Max Tokens
                  </Text>
                  <Text variant="bodyMd" fontWeight="semibold">
                    {data.maxTokens.toLocaleString()}
                  </Text>
                </div>
              </div>
            )}
            
            {data.supportsStreaming && (
              <div className="flex items-center gap-2 rounded-lg border border-greyExtralight p-3">
                <Icon source={Icons.check} />
                <div>
                  <Text variant="bodyMd" fontWeight="semibold">
                    Supports Streaming
                  </Text>
                </div>
              </div>
            )}

            {data.supportedLanguages && data.supportedLanguages.length > 0 && (
              <div className="flex flex-col gap-2 rounded-lg border border-greyExtralight p-3 md:col-span-2">
                <Text variant="bodySm" className="text-textSubdued">
                  Supported Languages
                </Text>
                <div className="flex flex-wrap gap-2">
                  {data.supportedLanguages.map((lang: string) => (
                    <Badge key={lang}>
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {(data.averageLatencyMs || data.successRate || data.lastAuditScore) && (
        <div className="flex flex-col gap-3">
          <Text variant="headingLg" fontWeight="semibold">
            Performance Metrics
          </Text>
          <div className="grid gap-3 md:grid-cols-3">
            {data.averageLatencyMs && (
              <div className="flex flex-col gap-1 rounded-lg border border-greyExtralight p-3">
                <Text variant="bodySm" className="text-textSubdued">
                  Avg Latency
                </Text>
                <Text variant="bodyLg" fontWeight="semibold">
                  {data.averageLatencyMs.toFixed(0)} ms
                </Text>
              </div>
            )}
            
            {data.successRate && (
              <div className="flex flex-col gap-1 rounded-lg border border-greyExtralight p-3">
                <Text variant="bodySm" className="text-textSubdued">
                  Success Rate
                </Text>
                <Text variant="bodyLg" fontWeight="semibold">
                  {data.successRate.toFixed(1)}%
                </Text>
              </div>
            )}

            {data.lastAuditScore && (
              <div className="flex flex-col gap-1 rounded-lg border border-greyExtralight p-3">
                <Text variant="bodySm" className="text-textSubdued">
                  Audit Score
                </Text>
                <Text variant="bodyLg" fontWeight="semibold">
                  {data.lastAuditScore.toFixed(1)}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <Text variant="headingLg" fontWeight="semibold">
            Tags
          </Text>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag: any) => (
              <Badge key={tag.id}>
                {tag.value}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
