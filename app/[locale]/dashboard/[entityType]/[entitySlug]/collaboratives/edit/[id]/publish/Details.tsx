import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Text } from 'opub-ui';

import { getWebsiteTitle } from '@/lib/utils';

const Details = ({ data }: { data: any }) => {
  const [platformTitle, setPlatformTitle] = useState<string | null>(null);

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
    { label: 'Collaborative Name', value: data?.collaboratives[0]?.title },
    { label: 'Summary', value: data?.collaboratives[0]?.summary },
    {
      label: 'Running Status',
      value: data?.collaboratives[0]?.runningStatus,
    },
    { label: 'Started On', value: data?.collaboratives[0]?.startedOn },
    {
      label: 'Completed On',
      value: data?.collaboratives[0]?.completedOn,
    },
    { label: 'Sector', value: data?.collaboratives[0]?.sectors[0]?.name },
    { label: 'Tags', value: data?.collaboratives[0]?.tags[0]?.value },
    ...(data?.collaboratives[0]?.metadata?.map((meta: any) => ({
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
                    <Text variant="bodyMd">{item.value}</Text>
                  </div>
                </div>
              )
          )}

          <div className="flex flex-wrap gap-2">
            <div className="md:w-1/6 lg:w-1/6">
              <Text variant="bodyMd">Platform URL:</Text>
            </div>
            <div>
              <Link
                className="text-primaryBlue underline"
                href={data.collaboratives[0].platformUrl}
              >
                <Text className="underline" color="highlight" variant="bodyLg">
                  {platformTitle?.trim() ? platformTitle : 'Visit Platform'}
                </Text>
              </Link>
            </div>
          </div>

          {data?.collaboratives[0]?.logo && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="md:w-1/6 lg:w-1/6">
                <Text className="" variant="bodyMd">
                  Image:
                </Text>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data?.collaboratives[0]?.logo?.path.replace('/code/files/', '')}`}
                alt={data?.collaboratives[0]?.title}
                width={240}
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
