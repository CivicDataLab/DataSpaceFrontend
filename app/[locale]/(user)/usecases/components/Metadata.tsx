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
        const urlItem = data.useCase.platformUrl;

        if (urlItem && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setPlatformTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    if (data.useCase.platformUrl === null) {
      setPlatformTitle('N/A');
    } else {
      fetchTitle();
    }
  }, [data.useCase.platformUrl]);

  const getOrganizationLink = () => {
    if (!data) return '/publishers';

    if (data.useCase.isIndividualUsecase && data.useCase.user) {
      return `/publishers/${data.useCase.user.fullName + '_' + data.useCase.user.id}`;
    }

    if (data.useCase.organization) {
      return `/publishers/organization/${data.useCase.organization.slug + '_' + data.useCase.organization.id}`;
    }

    return '/publishers';
  };

  const metadata = [
    {
      label: data.useCase.isIndividualUsecase ? 'Publisher' : 'Organization',
      value: (
        <Tooltip
          content={
            data.useCase.isIndividualUsecase
              ? data.useCase.user.fullName
              : data.useCase.organization.name
          }
        >
          <Link href={getOrganizationLink()}>
            {data.useCase.isIndividualUsecase
              ? data.useCase.user.fullName
              : data?.useCase.organization?.name}
          </Link>
        </Tooltip>
      ),
    },
    {
      label: 'Contact',
      value: (
        <Link
          className="text-primaryBlue underline"
          href={`${data.useCase.isIndividualUsecase ? `mailto:${data.useCase.user.email}` : `mailto:${data.useCase.organization.contactEmail}`}`}
        >
          Contact{' '}
          {data.useCase.isIndividualUsecase ? 'Publisher' : 'Organization'}
        </Link>
      ),
    },
    {
      label: 'Platform URL',
      value:
        data.useCase.platformUrl === null ? (
          'N/A'
        ) : (
          <Link
            className="text-primaryBlue underline"
            href={data.useCase.platformUrl}
          >
            <Text className="underline" color="highlight" variant="bodyLg">
              {platformTitle?.trim() ? platformTitle : 'Visit Platform'}
            </Text>
          </Link>
        ),
      tooltipContent: data.useCase.platformUrl === null ? 'N/A' : platformTitle,
    },
    {
      label: 'Started On',
      value: formatDate(data.useCase.startedOn) || 'N/A',
      tooltipContent: formatDate(data.useCase.startedOn) || 'N/A',
    },
    {
      label: 'Status',
      value: data.useCase.runningStatus.split('_').join('') || 'N/A',
      tooltipContent: data.useCase.runningStatus.split('_').join('') || 'N/A',
    },
    {
      label: 'Last Updated',
      value: formatDate(data.useCase.modified) || 'N/A',
      tooltipContent: formatDate(data.useCase.modified) || 'N/A',
    },
    {
      label: 'Sectors',
      value: (
        <div className="flex flex-wrap  gap-2">
          {data.useCase.sectors.length > 0 ? (
            data.useCase.sectors.map((sector: any, index: number) => (
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
        <div className="flex flex-wrap gap-2">
          {data.useCase.sdgs && data.useCase.sdgs.length > 0 ? (
            data.useCase.sdgs.map((sdg: any, index: number) => (
              <Tooltip content={`${sdg.code} - ${sdg.name}`} key={index}>
                <Image
                  src={`/SDG/${sdg.code}.svg`}
                  alt={sdg.name || ''}
                  width={50}
                  height={50}
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
  const image = data.useCase.isIndividualUsecase
    ? data.useCase?.user?.profilePicture
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.useCase.user.profilePicture.url}`
      : '/profile.png'
    : data?.useCase.organization?.logo
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.useCase.organization.logo.url}`
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
            ABOUT THE USE CASE{' '}
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
                data.useCase.isIndividualUsecase
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
                  className={`${item.label === 'SDG Goals' || item.label === 'Sectors' ? 'max-w-full' : 'max-w-xs truncate'}`}
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
