import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Icon, Text, Tooltip } from 'opub-ui';

import { formatDate, getWebsiteTitle } from '@/lib/utils';
import { Icons } from '@/components/icons';

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

  const getOrganizationLink = () => {
    if (!data) return '/publishers';

    if (data.collaborativeBySlug.isIndividualCollaborative && data.collaborativeBySlug.user) {
      return `/publishers/${data.collaborativeBySlug.user.fullName + '_' + data.collaborativeBySlug.user.id}`;
    }

    if (data.collaborativeBySlug.organization) {
      return `/publishers/organization/${data.collaborativeBySlug.organization.slug + '_' + data.collaborativeBySlug.organization.id}`;
    }

    return '/publishers';
  };

  const metadata = [
    {
      label: data.collaborativeBySlug.isIndividualCollaborative ? 'Publisher' : 'Organization',
      value: (
        <Tooltip
          content={
            data.collaborativeBySlug.isIndividualCollaborative
              ? data.collaborativeBySlug.user.fullName
              : data.collaborativeBySlug.organization.name
          }
        >
          <Link href={getOrganizationLink()}>
            {data.collaborativeBySlug.isIndividualCollaborative
              ? data.collaborativeBySlug.user.fullName
              : data?.collaborativeBySlug.organization?.name}
          </Link>
        </Tooltip>
      ),
    },
    {
      label: 'Contact',
      value: (
        <Link
          className="text-primaryBlue underline"
          href={`${data.collaborativeBySlug.isIndividualCollaborative ? `mailto:${data.collaborativeBySlug.user.email}` : `mailto:${data.collaborativeBySlug.organization.contactEmail}`}`}
        >
          Contact{' '}
          {data.collaborativeBySlug.isIndividualCollaborative ? 'Publisher' : 'Organization'}
        </Link>
      ),
    },
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
      label: 'Started On',
      value: formatDate(data.collaborativeBySlug.startedOn) || 'N/A',
      tooltipContent: formatDate(data.collaborativeBySlug.startedOn) || 'N/A',
    },
    {
      label: 'Completed On',
      value: formatDate(data.collaborativeBySlug.completedOn) || 'N/A',
      tooltipContent: formatDate(data.collaborativeBySlug.completedOn) || 'N/A',
    },
    {
      label: 'Status',
      value: data.collaborativeBySlug.status?.split('_').join('') || 'N/A',
      tooltipContent: data.collaborativeBySlug.status?.split('_').join('') || 'N/A',
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
  const image = data.collaborativeBySlug.isIndividualCollaborative
    ? data.collaborativeBySlug?.user?.profilePicture
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborativeBySlug.user.profilePicture.url}`
      : '/profile.png'
    : data?.collaborativeBySlug.organization?.logo
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborativeBySlug.organization.logo.url}`
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
        <Link href={getOrganizationLink()}>
          <div className="hidden rounded-2 border-1 border-solid border-greyExtralight p-2 lg:block">
            <Image
              height={140}
              width={100}
              src={image}
              alt={
                data.collaborativeBySlug.isIndividualCollaborative
                  ? 'Publisher logo'
                  : 'Organization logo'
              }
              className="w-full object-contain"
            />
          </div>
        </Link>
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
        </div>
      </div>
    </div>
  );
};

export default Metadata;
