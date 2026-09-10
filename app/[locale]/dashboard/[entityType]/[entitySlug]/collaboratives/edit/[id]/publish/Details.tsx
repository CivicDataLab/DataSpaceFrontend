import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

import { getWebsiteTitle } from '@/lib/utils';
import { RichTextRenderer } from '@/components/RichTextRenderer';

interface NamedItem {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  value?: string | null;
}

interface CollaborativePublishDetails {
  title?: string | null;
  summary?: string | null;
  runningStatus?: string | null;
  startedOn?: string | null;
  completedOn?: string | null;
  platformUrl?: string | { value?: string } | null;
  sectors?: NamedItem[] | null;
  sdgs?: NamedItem[] | null;
  tags?: NamedItem[] | null;
  metadata?: Array<{
    value?: string | null;
    metadataItem?: { label?: string | null } | null;
  }> | null;
  logo?: { path?: string | null } | null;
  coverImage?: { path?: string | null } | null;
}

interface DetailsProps {
  data?: { collaboratives?: Array<CollaborativePublishDetails | null> | null } | null;
}

const Details = ({ data }: DetailsProps) => {
  const collaborative = data?.collaboratives?.[0];
  const platformUrl = collaborative?.platformUrl;
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
    if (!collaborative || platformUrl === null) return;

    const fetchTitle = async () => {
      try {
        const urlItem = collaborative?.platformUrl;

        if (urlItem && typeof urlItem === 'object' && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setPlatformTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    fetchTitle();
  }, [collaborative, platformUrl]);

  const platformHref =
    typeof platformUrl === 'string'
      ? platformUrl
      : platformUrl && typeof platformUrl === 'object'
        ? platformUrl.value
        : undefined;

  const PrimaryDetails = [
    { label: 'Collaborative Name', value: collaborative?.title },
    { label: 'Summary', value: collaborative?.summary },
    {
      label: 'Running Status',
      value: collaborative?.runningStatus,
    },
    { label: 'Started On', value: collaborative?.startedOn },
    {
      label: 'Completed On',
      value: collaborative?.completedOn,
    },
    {
      label: 'Sectors',
      value: collaborative?.sectors?.length ? (
        <div className="flex flex-wrap gap-2">
          {collaborative.sectors.map((s, idx) => (
            <Tag key={s?.id ?? `${s?.name}-${idx}`}>{s?.name}</Tag>
          ))}
        </div>
      ) : null,
    },
    {
      label: 'SDG Goals',
      value: collaborative?.sdgs?.length ? (
        <div className="flex flex-wrap gap-2">
          {collaborative.sdgs.map((s, idx) => (
            <Tag key={s?.id ?? `${s?.code}-${idx}`}>{s?.name || s?.code}</Tag>
          ))}
        </div>
      ) : null,
    },
    {
      label: 'Tags',
      value: collaborative?.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {collaborative.tags.map((t, idx) => (
            <Tag key={t?.id ?? `${t?.value}-${idx}`}>{t?.value}</Tag>
          ))}
        </div>
      ) : null,
    },
    ...(collaborative?.metadata?.map((meta) => ({
      label: meta.metadataItem?.label,
      value: meta.value,
    })) || []),
  ];
  return (
    <div>
      <div className="flex flex-col gap-4 px-8 py-4">
        <>
          {PrimaryDetails.map((item, index) =>
            item.value ? (
              <div className="flex flex-wrap gap-2" key={index}>
                <div className="md:w-1/6 lg:w-1/6">
                  <Text variant="bodyMd">{item.label}:</Text>
                </div>
                <div>
                  {item.label === 'Summary' ? (
                    <RichTextRenderer
                      content={typeof item.value === 'string' ? item.value : ''}
                      className="text-black"
                    />
                  ) : (
                    <>
                      {typeof item.value === 'string' ||
                      typeof item.value === 'number' ? (
                        <Text variant="bodyMd">{item.value}</Text>
                      ) : (
                        item.value
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : null
          )}

          {platformHref && (
            <div className="flex flex-wrap gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text variant="bodyMd">External Link:</Text>
              </div>
              <div>
                <Link
                  className="text-primaryBlue underline"
                  href={platformHref}
                >
                  <Text
                    className="underline"
                    color="highlight"
                    variant="bodyMd"
                  >
                    {platformTitle?.trim() ? platformTitle : 'Open Link'}
                  </Text>
                </Link>
              </div>
            </div>
          )}

          {collaborative?.logo && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text className="" variant="bodyMd">
                  Logo:
                </Text>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${collaborative.logo.path?.replace('/code/files/', '') ?? ''}`}
                alt={collaborative.title ?? ''}
                width={240}
                className="object-contain"
                height={240}
              />
            </div>
          )}
          {collaborative?.coverImage && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text className="" variant="bodyMd">
                  Cover Image:
                </Text>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${collaborative.coverImage.path?.replace('/code/files/', '') ?? ''}`}
                alt={collaborative.title ?? ''}
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
