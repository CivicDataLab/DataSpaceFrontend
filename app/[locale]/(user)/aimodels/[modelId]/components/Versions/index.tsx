'use client';

import { formatDate } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Table,
  Text,
} from 'opub-ui';

interface VersionProvider {
  id: number;
  provider: string;
  providerModelId?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  apiEndpointUrl?: string | null;
  hfModelClass?: string | null;
  framework?: string | null;
}

interface ModelVersion {
  id: number;
  version: string;
  versionNotes?: string | null;
  lifecycleStage: string;
  isLatest: boolean;
  maxTokens?: number | null;
  supportedLanguages?: string[] | null;
  createdAt: string;
  updatedAt: string;
  providers: VersionProvider[];
}

interface VersionTableRow {
  lifecycleStage: string;
  providers: VersionProvider[];
  maxTokens?: number | null;
  updatedAt: string;
  createdAt: string;
}

interface VersionCellProps {
  row: { original: VersionTableRow };
}

interface VersionsProps {
  data: {
    versions?: ModelVersion[] | null;
  };
}

export default function Versions({ data }: VersionsProps) {
  if (!data?.versions || data.versions.length === 0) {
    return null;
  }

  const providerLabels: Record<string, string> = {
    OPENAI: 'OpenAI',
    LLAMA_OLLAMA: 'Llama (Ollama)',
    LLAMA_TOGETHER: 'Llama (Together AI)',
    LLAMA_REPLICATE: 'Llama (Replicate)',
    LLAMA_CUSTOM: 'Llama (Custom)',
    CUSTOM: 'Custom API',
    HUGGINGFACE: 'HuggingFace',
  };

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'lifecycleStage',
        header: 'Lifecycle Stage',
        cell: ({ row }: VersionCellProps) => (
          <Text variant="bodyMd">
            {row.original.lifecycleStage?.replace(/_/g, ' ') || 'Development'}
          </Text>
        ),
      },
      {
        accessorKey: 'providers',
        header: 'Access Methods',
        cell: ({ row }: VersionCellProps) => {
          const providers = row.original.providers || [];
          if (providers.length === 0) return <Text variant="bodyMd">N/A</Text>;
          return (
            <div className="flex flex-wrap gap-1">
              {providers.map((p) => (
                <Badge key={p.id}>
                  {providerLabels[p.provider] || p.provider}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'maxTokens',
        header: 'Max Tokens',
        cell: ({ row }: VersionCellProps) => (
          <Text variant="bodyMd">
            {row.original.maxTokens?.toLocaleString() || 'N/A'}
          </Text>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }: VersionCellProps) => (
          <Text variant="bodyMd">
            {formatDate(row.original.updatedAt || row.original.createdAt) || ''}
          </Text>
        ),
      },
    ];
  };

  const generateTableData = (version: ModelVersion) => {
    return [
      {
        lifecycleStage: version.lifecycleStage,
        providers: version.providers,
        maxTokens: version.maxTokens,
        updatedAt: version.updatedAt,
        createdAt: version.createdAt,
      },
    ];
  };

  return (
    <div className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-1">
        <Text variant="headingXl">Versions</Text>
        <Text variant="bodyLg">
          All versions linked to DataSpace and available for public viewing
        </Text>
      </div>
      <div>
        {data.versions.map((version) => (
          <div
            key={version.id}
            className="mt-5 flex flex-col gap-6 border-1 border-solid border-greyExtralight bg-surfaceDefault p-4 lg:mx-0 lg:p-6"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-none">
                <div className="flex flex-wrap items-center justify-between gap-4 md:flex-nowrap">
                  <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surfaceSubdued">
                      <svg
                        className="h-5 w-5 text-textSubdued"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <Text variant="headingMd" className="line-clamp-1">
                      Version {version.version}
                    </Text>
                    {version.isLatest && (
                      <Badge status="success">Primary</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <AccordionTrigger className="flex w-full items-center gap-2 p-0 hover:no-underline">
                      <Text
                        variant="bodyLg"
                        className="w-[100px] text-secondaryText"
                      >
                        View Details
                      </Text>
                    </AccordionTrigger>
                  </div>
                </div>
                <AccordionContent
                  className="flex w-full flex-col py-5"
                  style={{
                    backgroundColor: 'var(--base-pure-white)',
                    outline: '1px solid var(--base-pure-white)',
                  }}
                >
                  <Table
                    columns={generateColumnData()}
                    rows={generateTableData(version)}
                    hideFooter
                  />
                  {version.versionNotes && (
                    <div className="mt-4 border-t border-greyExtralight pt-4">
                      <Text variant="bodySm" className="mb-1 uppercase text-textSubdued">
                        Version Notes
                      </Text>
                      <Text variant="bodyMd">{version.versionNotes}</Text>
                    </div>
                  )}
                  {version.supportedLanguages && version.supportedLanguages.length > 0 && (
                    <div className="mt-4 border-t border-greyExtralight pt-4">
                      <Text variant="bodySm" className="mb-2 uppercase text-textSubdued">
                        Supported Languages
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {version.supportedLanguages.map((lang: string) => (
                          <Badge key={lang}>{lang.toUpperCase()}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {version.providers && version.providers.length > 0 && (
                    <div className="mt-4 border-t border-greyExtralight pt-4">
                      <Text variant="bodySm" className="mb-2 uppercase text-textSubdued">
                        Provider Configuration
                      </Text>
                      <div className="flex flex-col gap-3">
                        {version.providers.map((provider) => (
                          <div
                            key={provider.id}
                            className="rounded-1 border border-greyExtralight bg-surfaceSubdued p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Text variant="bodyMd" fontWeight="semibold">
                                  {providerLabels[provider.provider] || provider.provider}
                                </Text>
                                {provider.isPrimary && (
                                  <Badge status="success">Primary</Badge>
                                )}
                                {!provider.isActive && (
                                  <Badge status="warning">Inactive</Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-col gap-1">
                              {provider.providerModelId && (
                                <div className="flex gap-2">
                                  <Text variant="bodySm" className="text-textSubdued">Model:</Text>
                                  <Text variant="bodySm">{provider.providerModelId}</Text>
                                </div>
                              )}
                              {provider.apiEndpointUrl && (
                                <div className="flex gap-2">
                                  <Text variant="bodySm" className="text-textSubdued">Endpoint:</Text>
                                  <Text variant="bodySm" className="break-all">{provider.apiEndpointUrl}</Text>
                                </div>
                              )}
                              {provider.hfModelClass && (
                                <div className="flex gap-2">
                                  <Text variant="bodySm" className="text-textSubdued">Model Class:</Text>
                                  <Text variant="bodySm">{provider.hfModelClass}</Text>
                                </div>
                              )}
                              {provider.framework && (
                                <div className="flex gap-2">
                                  <Text variant="bodySm" className="text-textSubdued">Framework:</Text>
                                  <Text variant="bodySm">{provider.framework === 'pt' ? 'PyTorch' : provider.framework === 'tf' ? 'TensorFlow' : provider.framework}</Text>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
