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
        const urlItem = data.collaborative.platformUrl;

        if (urlItem && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setPlatformTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    if (data.collaborative.platformUrl === null) {
      setPlatformTitle('N/A');
    } else {
      fetchTitle();
    }
  }, [data.collaborative.platformUrl]);

  const getOrganizationLink = () => {
    if (!data) return '/publishers';

    if (data.collaborative.isIndividualCollaborative && data.collaborative.user) {
      return `/publishers/${data.collaborative.user.fullName + '_' + data.collaborative.user.id}`;
    }

    if (data.collaborative.organization) {
      return `/publishers/organization/${data.collaborative.organization.slug + '_' + data.collaborative.organization.id}`;
    }

    return '/publishers';
  };

  const metadata = [
    {
      label: data.collaborative.isIndividualCollaborative ? 'Publisher' : 'Organization',
      value: (
        <Tooltip
          content={
            data.collaborative.isIndividualCollaborative
              ? data.collaborative.user.fullName
              : data.collaborative.organization.name
          }
        >
          <Link href={getOrganizationLink()}>
            {data.collaborative.isIndividualCollaborative
              ? data.collaborative.user.fullName
              : data?.collaborative.organization?.name}
          </Link>
        </Tooltip>
      ),
    },
    {
      label: 'Contact',
      value: (
        <Link
          className="text-primaryBlue underline"
          href={`${data.collaborative.isIndividualCollaborative ? `mailto:${data.collaborative.user.email}` : `mailto:${data.collaborative.organization.contactEmail}`}`}
        >
          Contact{' '}
          {data.collaborative.isIndividualCollaborative ? 'Publisher' : 'Organization'}
        </Link>
      ),
    },
    {
      label: 'Platform URL',
      value:
        data.collaborative.platformUrl === null ? (
          'N/A'
        ) : (
          <Link
            className="text-primaryBlue underline"
            href={data.collaborative.platformUrl}
          >
            <Text className="underline" color="highlight" variant="bodyLg">
              {platformTitle?.trim() ? platformTitle : 'Visit Platform'}
            </Text>
          </Link>
        ),
      tooltipContent: data.collaborative.platformUrl === null ? 'N/A' : platformTitle,
    },
    {
      label: 'Started On',
      value: formatDate(data.collaborative.startedOn) || 'N/A',
      tooltipContent: formatDate(data.collaborative.startedOn) || 'N/A',
    },
    {
      label: 'Completed On',
      value: formatDate(data.collaborative.completedOn) || 'N/A',
      tooltipContent: formatDate(data.collaborative.completedOn) || 'N/A',
    },
    {
      label: 'Status',
      value: data.collaborative.status?.split('_').join('') || 'N/A',
      tooltipContent: data.collaborative.status?.split('_').join('') || 'N/A',
    },
    {
      label: 'Last Updated',
      value: formatDate(data.collaborative.modified) || 'N/A',
      tooltipContent: formatDate(data.collaborative.modified) || 'N/A',
    },
    {
      label: 'Sectors',
      value: (
        <div className="flex flex-wrap  gap-2">
          {data.collaborative.sectors.length > 0 ? (
            data.collaborative.sectors.map((sector: any, index: number) => (
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
          {data.collaborative.sdgs && data.collaborative.sdgs.length > 0 ? (
            data.collaborative.sdgs.map((sdg: any, index: number) => (
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
  const image = data.collaborative.isIndividualCollaborative
    ? data.collaborative?.user?.profilePicture
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborative.user.profilePicture.url}`
      : '/profile.png'
    : data?.collaborative.organization?.logo
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborative.organization.logo.url}`
      : '/org.png';

  return (
    <div className="flex flex-col gap-10 px-7 py-10">
      <div className=" flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Text
            variant="headingLg"
            fontWeight="semibold"
            className=" text-primaryBlue"
          >
            ABOUT THE COLLABORATIVE{' '}
          </Text>
          <Text variant="bodyLg">DETAILS</Text>
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
                data.collaborative.isIndividualCollaborative
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
              >
                {item.label}
              </Text>
              <Tooltip content={item?.tooltipContent}>
                <Text
                  className="max-w-xs truncate"
                  variant="bodyLg"
                  fontWeight="medium"
                  // title={item?.tooltipContent}
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
