import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

import { getWebsiteTitle } from '@/lib/utils';
import { RichTextRenderer } from '@/components/RichTextRenderer';

const Details = ({ data }: { data: any }) => {
  const [platformTitle, setPlatformTitle] = useState<string | null>(null);
  const collaborative = data?.collaboratives?.[0];

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const urlItem = data.collaboratives[0].platformUrl;

        if (urlItem && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setPlatformTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    if (data.collaboratives[0].platformUrl === null) {
      setPlatformTitle('N/A');
    } else {
      fetchTitle();
    }
  }, [data?.collaboratives[0]?.platformUrl]);

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
          {collaborative.sectors.map((s: any, idx: number) => (
            <Tag key={s?.id ?? `${s?.name}-${idx}`}>{s?.name}</Tag>
          ))}
        </div>
      ) : null,
    },
    {
      label: 'SDG Goals',
      value: collaborative?.sdgs?.length ? (
        <div className="flex flex-wrap gap-2">
          {collaborative.sdgs.map((s: any, idx: number) => (
            <Tag key={s?.id ?? `${s?.code}-${idx}`}>{s?.name || s?.code}</Tag>
          ))}
        </div>
      ) : null,
    },
    {
      label: 'Tags',
      value: collaborative?.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {collaborative.tags.map((t: any, idx: number) => (
            <Tag key={t?.id ?? `${t?.value}-${idx}`}>{t?.value}</Tag>
          ))}
        </div>
      ) : null,
    },
    ...(collaborative?.metadata?.map((meta: any) => ({
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
                      content={item.value as any}
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

          {data.collaboratives[0].platformUrl && (
            <div className="flex flex-wrap gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text variant="bodyMd">External Link:</Text>
              </div>
              <div>
                <Link
                  className="text-primaryBlue underline"
                  href={data.collaboratives[0].platformUrl}
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

          {data?.collaboratives[0]?.logo && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text className="" variant="bodyMd">
                  Logo:
                </Text>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data?.collaboratives[0]?.logo?.path.replace('/code/files/', '')}`}
                alt={data?.collaboratives[0]?.title}
                width={240}
                className="object-contain"
                height={240}
              />
            </div>
          )}
          {data?.collaboratives[0]?.coverImage && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text className="" variant="bodyMd">
                  Cover Image:
                </Text>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data?.collaboratives[0]?.coverImage?.path.replace('/code/files/', '')}`}
                alt={data?.collaboratives[0]?.title}
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
