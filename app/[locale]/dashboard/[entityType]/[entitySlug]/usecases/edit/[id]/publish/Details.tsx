import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Text } from 'opub-ui';

import { getWebsiteTitle } from '@/lib/utils';
import { RichTextRenderer } from '@/components/RichTextRenderer';

interface NamedItem {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  value?: string | null;
}

interface UseCasePublishDetails {
  title?: string | null;
  summary?: string | null;
  runningStatus?: string | null;
  startedOn?: string | null;
  completedOn?: string | null;
  platformUrl?: string | { value?: string } | null;
  sectors?: Array<{ name?: string | null } | null> | null;
  geographies?: NamedItem[] | null;
  sdgs?: NamedItem[] | null;
  tags?: Array<{ value?: string | null } | null> | null;
  metadata?: Array<{
    value?: string | null;
    metadataItem?: { label?: string | null } | null;
  }> | null;
  logo?: { path?: string | null } | null;
}

interface DetailsProps {
  data?: { useCases?: Array<UseCasePublishDetails | null> | null } | null;
}

const Details = ({ data }: DetailsProps) => {
  const useCase = data?.useCases?.[0];
  const platformUrl = useCase?.platformUrl;
  const [platformTitle, setPlatformTitle] = useState<string | null>(
    platformUrl === null ? 'N/A' : null
  );
  const [prevPlatformUrl, setPrevPlatformUrl] = useState(platformUrl);
  if (platformUrl !== prevPlatformUrl) {
    setPrevPlatformUrl(platformUrl);
    if (platformUrl === null) {
      setPlatformTitle('N/A');
    }
  }

  useEffect(() => {
    if (!useCase || platformUrl === null) return;

    const fetchTitle = async () => {
      try {
        const urlItem = useCase?.platformUrl;

        if (urlItem && typeof urlItem === 'object' && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setPlatformTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    fetchTitle();
  }, [useCase, platformUrl]);

  const platformHref =
    typeof platformUrl === 'string'
      ? platformUrl
      : platformUrl && typeof platformUrl === 'object'
        ? platformUrl.value
        : undefined;

  const PrimaryDetails = [
    { label: 'Use Case Name', value: useCase?.title },
    { label: 'Summary', value: useCase?.summary },
    {
      label: 'Running Status',
      value: useCase?.runningStatus,
    },
    { label: 'Started On', value: useCase?.startedOn },
    {
      label: 'Completed On',
      value: useCase?.completedOn,
    },
    { label: 'Sector', value: useCase?.sectors?.[0]?.name },
    {
      label: 'Geography',
      value: useCase?.geographies
        ?.map((geo) => geo?.name)
        .join(', '),
    },
    {
      label: 'SDG Goals',
      value: useCase?.sdgs
        ?.map((sdg) => `${sdg?.code} - ${sdg?.name}`)
        .join(', '),
    },
    { label: 'Tags', value: useCase?.tags?.[0]?.value },
    ...(useCase?.metadata?.map((meta) => ({
      label: meta.metadataItem?.label,
      value: meta.value,
    })) || []),
  ];
  return (
    <div>
      <div className="flex flex-col gap-4 px-8 py-4">
        <>
          {PrimaryDetails.map(
            (item, index) =>
              item.value && (
                <div className="flex flex-wrap gap-2" key={index}>
                  <div className="md:w-1/6 lg:w-1/6">
                    <Text variant="bodyMd">{item.label}:</Text>
                  </div>
                  <div>
                    <Text variant="bodyMd">
                      <RichTextRenderer content={item.value} />
                    </Text>
                  </div>
                </div>
              )
          )}

          <div className="flex flex-wrap gap-2">
            <div className="md:w-1/6 lg:w-1/6">
              <Text variant="bodyMd">Platform URL:</Text>
            </div>
            <div>
              {platformHref ? (
                <Link
                  className="text-primaryBlue underline"
                  href={platformHref}
                >
                  <Text
                    className="underline"
                    color="highlight"
                    variant="bodyMd"
                  >
                    {platformTitle?.trim() ? platformTitle : 'Visit Platform'}
                  </Text>
                </Link>
              ) : (
                <Text variant="bodyMd">Not provided</Text>
              )}
            </div>
          </div>

          {useCase?.logo && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text className="" variant="bodyMd">
                  Image:
                </Text>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${useCase.logo.path?.replace('/code/files/', '') ?? ''}`}
                alt={useCase.title ?? ''}
                width={240}
                className="object-contain"
                height={240}
              />
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default Details;
