import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Icon, Text, Tooltip } from 'opub-ui';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { formatDate, getWebsiteTitle } from '@/lib/utils';

const Metadata = ({ data, setOpen }: { data: any; setOpen?: any }) => {
  const [platformTitle, setPlatformTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const urlItem = data.collaborativeBySlug.platformUrl;

        if (urlItem && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setPlatformTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    if (data.collaborativeBySlug.platformUrl === null) {
      setPlatformTitle('N/A');
    } else {
      fetchTitle();
    }
  }, [data.collaborativeBySlug.platformUrl]);

  const metadata = [
    {
      label: 'Platform URL',
      value:
        data.collaborativeBySlug.platformUrl === null ? (
          'N/A'
        ) : (
          <Link
            className="text-primaryBlue underline"
            href={data.collaborativeBySlug.platformUrl}
          >
            <Text className="underline" color="highlight" variant="bodyLg">
              {platformTitle?.trim() ? platformTitle : 'Visit Platform'}
            </Text>
          </Link>
        ),
      tooltipContent: data.collaborativeBySlug.platformUrl === null ? 'N/A' : platformTitle,
    },
    {
      label: 'Last Updated',
      value: formatDate(data.collaborativeBySlug.modified) || 'N/A',
      tooltipContent: formatDate(data.collaborativeBySlug.modified) || 'N/A',
    },
    {
      label: 'Sectors',
      value: (
        <div className="flex flex-wrap  gap-2">
          {data.collaborativeBySlug.sectors.length > 0 ? (
            data.collaborativeBySlug.sectors.map((sector: any, index: number) => (
              <Tooltip content={sector.name} key={index}>
                <Image
                  src={`/Sectors/${sector.name}.svg`}
                  alt={sector.name || ''}
                  width={52}
                  height={52}
                  className="border-1 border-solid border-greyExtralight p-1"
                />
              </Tooltip>
            ))
          ) : (
            <span>N/A</span> // Fallback if no sectors are available
          )}
        </div>
      ),
    },
    {
      label: 'SDG Goals',
      value: (
        <div className="flex flex-wrap  gap-2">
          {data.collaborativeBySlug.sdgs && data.collaborativeBySlug.sdgs.length > 0 ? (
            data.collaborativeBySlug.sdgs.map((sdg: any, index: number) => (
              <Tooltip content={`${sdg.code} - ${sdg.name}`} key={index}>
                <Image
                  src={`/SDG/${sdg.code}.svg`}
                  alt={sdg.name || ''}
                  width={60}
                  height={60}
                  className="border-1 border-solid border-greyExtralight p-1"
                />
              </Tooltip>
            ))
          ) : (
            <span>N/A</span>
          )}
        </div>
      ),
    },
  ];
  
  // Use collaborative logo if available, otherwise use a default
  const image = data.collaborativeBySlug?.logo?.path
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborativeBySlug.logo.path.replace('/code/files/', '')}`
    : '/org.png';

  return (
    <div className="flex flex-col gap-10 px-7 py-10">
      <div className=" flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Text
            variant="headingLg"
            fontWeight="semibold"
            color="onBgDefault"
          >
            ABOUT THE COLLABORATIVE{' '}
          </Text>
          <Text variant="bodyLg" color="onBgDefault">DETAILS</Text>
        </div>
        <div className="flex items-center justify-between">
          {setOpen && (
            <Button onClick={() => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          )}
        </div>
      </div>
      <Divider />
      <div className=" flex flex-col gap-8">
        <div className="hidden rounded-2 border-1 border-solid border-greyExtralight p-2 lg:block">
          <Image
            height={140}
            width={100}
            src={image}
            alt="Collaborative logo"
            className="w-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-8">
          {metadata.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Text
                className="min-w-[120px]  basis-1/4 uppercase"
                variant="bodyMd"
                color="onBgDefault"
              >
                {item.label}
              </Text>
              <Tooltip content={item?.tooltipContent}>
                <Text
                  className="max-w-xs truncate"
                  variant="bodyLg"
                  fontWeight="medium"
                  color="onBgDefault"
                >
                  {typeof item.value === 'string' ? item.value : item.value}
                </Text>
              </Tooltip>
            </div>
          ))}
          {/* Contributors Section */}
          {data.collaborativeBySlug.contributors && data.collaborativeBySlug.contributors.length > 0 && (
            <div className="flex gap-2">
              <Text
                className="min-w-[120px] basis-1/4 uppercase"
                variant="bodyMd"
                color="onBgDefault"
              >
                Contributors
              </Text>
              <div className="flex flex-wrap gap-2">
                {data.collaborativeBySlug.contributors.map((contributor: any) => (
                  <Link
                    href={`/publishers/${contributor.fullName + '_' + contributor.id}`}
                    key={contributor.id}
                  >
                    <Tooltip content={contributor.fullName}>
                      <Image
                        alt={contributor.fullName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        src={
                          contributor.profilePicture?.url
                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${contributor.profilePicture?.url}`
                            : '/profile.png'
                        }
                      />
                    </Tooltip>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
