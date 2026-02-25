'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Divider, Tag, Text, Tooltip } from 'opub-ui';

interface MetadataProps {
  data: any;
}

export default function Metadata({ data }: MetadataProps) {
  if (!data) return null;

  const isIndividual = !data.organization;

  const image = isIndividual
    ? data?.user?.profilePicture?.url
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.user.profilePicture.url}`
      : '/profile.png'
    : data?.organization?.logo?.url
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.organization.logo.url}`
      : '/org.png';

  const publisherName = isIndividual
    ? data?.user?.fullName
    : data?.organization?.name;

  const getPublisherURL = () => {
    if (isIndividual && data.user) {
      return `/publishers/${data.user.fullName}_${data.user.id}`;
    }
    if (data.organization) {
      return `/publishers/organization/${data.organization.slug || data.organization.name}_${data.organization.id}`;
    }
    return '/publishers';
  };

  const modelTypeLabels: Record<string, string> = {
    TRANSLATION: 'Translation',
    TEXT_GENERATION: 'Text Generation',
    SUMMARIZATION: 'Summarisation',
    QUESTION_ANSWERING: 'Question Answering',
    SENTIMENT_ANALYSIS: 'Sentiment Analysis',
    TEXT_CLASSIFICATION: 'Text Classification',
    NAMED_ENTITY_RECOGNITION: 'Named Entity Recognition',
    TEXT_TO_SPEECH: 'Text to Speech',
    SPEECH_TO_TEXT: 'Speech to Text',
    OTHER: 'Other',
  };

  const domainLabels: Record<string, string> = {
    HEALTHCARE: 'Healthcare',
    EDUCATION: 'Education',
    LEGAL: 'Legal',
    FINANCE: 'Finance',
    AGRICULTURE: 'Agriculture',
    ENVIRONMENT: 'Environment',
    GOVERNMENT: 'Government',
    TECHNOLOGY: 'Technology',
    SCIENCE: 'Science',
    SOCIAL_SERVICES: 'Social Services',
    TRANSPORTATION: 'Transportation',
    ENERGY: 'Energy',
    GENERAL: 'General',
    OTHER: 'Other',
  };

  // Get primary version info
  const primaryVersion =
    data.versions?.find((v: any) => v.isLatest) || data.versions?.[0];
  const primaryProvider =
    primaryVersion?.providers?.find((p: any) => p.isPrimary) ||
    primaryVersion?.providers?.[0];

  const providerLabels: Record<string, string> = {
    OPENAI: 'OpenAI',
    LLAMA_OLLAMA: 'Llama (Ollama)',
    LLAMA_TOGETHER: 'Llama (Together AI)',
    LLAMA_REPLICATE: 'Llama (Replicate)',
    LLAMA_CUSTOM: 'Llama (Custom)',
    CUSTOM: 'Custom API',
    HUGGINGFACE: 'HuggingFace',
  };

  const licenseLabels: Record<string, string> = {
    MIT: 'MIT License',
    'Apache-2.0': 'Apache 2.0',
    'GPL-3.0': 'GPL v3',
    'BSD-3-Clause': 'BSD 3-Clause',
    'CC-BY-4.0': 'Creative Commons Attribution License (cc-by)',
    'CC-BY-SA-4.0': 'Creative Commons Attribution-ShareAlike',
    'CC-BY-NC-4.0': 'Creative Commons Attribution-NonCommercial',
    Proprietary: 'Proprietary',
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Text
          variant="headingLg"
          fontWeight="semibold"
          className="text-primaryBlue"
        >
          ABOUT THE MODEL
        </Text>
        <Text variant="bodyLg">METADATA</Text>
      </div>

      <Divider />

      <div className="flex flex-col gap-8">
        {/* Organization Logo */}
        <div className="hidden rounded-2 border-1 border-solid border-greyExtralight bg-white p-2 lg:block">
          <Link href={getPublisherURL()}>
            <Image
              height={140}
              width={100}
              src={image}
              alt={isIndividual ? 'Publisher logo' : 'Organization logo'}
              className="w-full object-contain"
            />
          </Link>
        </div>

        {/* Organization */}
        <div className="flex items-center gap-2">
          <Text className="min-w-[120px] basis-1/4 uppercase" variant="bodyMd">
            {isIndividual ? 'Publisher' : 'Organization'}
          </Text>
          <Tooltip content={publisherName}>
            <Link href={getPublisherURL()}>
              <Text
                className="line-clamp-2"
                variant="bodyLg"
                fontWeight="medium"
              >
                {publisherName}
              </Text>
            </Link>
          </Tooltip>
        </div>

        {/* Model Type */}
        <div className="flex items-center gap-2">
          <Text className="min-w-[120px] basis-1/4 uppercase" variant="bodyMd">
            Model Type
          </Text>
          <Text variant="bodyLg" fontWeight="medium">
            {modelTypeLabels[data.modelType] || data.modelType}
          </Text>
        </div>

        {/* Domain */}
        {data.domain && (
          <div className="flex items-center gap-2">
            <Text
              className="min-w-[120px] basis-1/4 uppercase"
              variant="bodyMd"
            >
              Domain
            </Text>
            <Text variant="bodyLg" fontWeight="medium">
              {domainLabels[data.domain] || data.domain}
            </Text>
          </div>
        )}

        {/* Source/Provider */}
        {primaryProvider && (
          <div className="flex items-center gap-2">
            <Text
              className="min-w-[120px] basis-1/4 uppercase"
              variant="bodyMd"
            >
              Source
            </Text>
            <Text
              variant="bodyLg"
              fontWeight="medium"
              className="text-primaryBlue"
            >
              {providerLabels[primaryProvider.provider] ||
                primaryProvider.provider}
            </Text>
          </div>
        )}

        {/* License */}
        {data.metadata?.usageLicense && (
          <div className="flex gap-2">
            <Text
              className="min-w-[120px] basis-1/4 uppercase"
              variant="bodyMd"
            >
              License
            </Text>
            <Text variant="bodyLg" fontWeight="medium">
              {licenseLabels[data.metadata.usageLicense] ||
                data.metadata.usageLicense}
            </Text>
          </div>
        )}

        {/* Sectors */}
        {data.sectors && data.sectors.length > 0 && (
          <div className="flex gap-2">
            <Text
              className="min-w-[120px] basis-1/4 uppercase"
              variant="bodyMd"
            >
              Sector
            </Text>
            <div className="flex flex-wrap gap-2">
              {data.sectors.map((sector: any, index: number) => (
                <Tooltip content={sector.name} key={index}>
                  <Image
                    src={`/Sectors/${sector.name}.svg`}
                    alt={sector.name || ''}
                    width={52}
                    height={52}
                    className="border-1 border-solid border-greyExtralight p-1"
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Geographies */}
        {data.geographies && data.geographies.length > 0 && (
          <div className="flex items-center gap-2">
            <Text
              className="min-w-[120px] basis-1/4 uppercase"
              variant="bodyMd"
            >
              Geography
            </Text>
            <div className="flex flex-wrap gap-2">
              {data.geographies.map((geo: any, index: number) => (
                <Tag
                  key={index}
                  fillColor="var(--orange-secondary-color)"
                  borderColor="var(--orange-secondary-text)"
                  textColor="black"
                >
                  {geo.name}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
