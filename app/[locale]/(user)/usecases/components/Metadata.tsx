import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Icon, Text, Tooltip } from 'opub-ui';

import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';

const Metadata = ({ data, setOpen }: { data: any; setOpen?: any }) => {
  const metadata = [
    {
      label: data.useCase.isIndividualUsecase ? 'Publisher' : 'Organization',
      value: data.useCase.isIndividualUsecase
        ? data.useCase.user.fullName
        : data?.useCase.organization?.name,
      tooltipContent: data.useCase.isIndividualUsecase
        ? data.useCase.user.fullName
        : data?.useCase.organization?.name,
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
      label: 'Started On',
      value: formatDate(data.useCase.created) || 'N/A',
    },
    {
      label: 'Status',
      value: data.useCase.runningStatus.split('_').join('') || 'N/A',
    },
    {
      label: 'Last Updated',
      value: formatDate(data.useCase.modified) || 'N/A',
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
        <div className="flex flex-wrap  gap-2">
          {data.useCase.metadata.length > 0 ? (
            data.useCase.metadata
              ?.find((meta: any) => meta.metadataItem?.label === 'SDG Goal')
              ?.value.split(', ')
              .map((item: any, index: number) => (
                <Tooltip content={item} key={index}>
                  <Image
                    src={`/SDG/${item}.svg`}
                    alt={item || ''}
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
            ABOUT THE USECASE{' '}
          </Text>
          <Text variant="bodyLg">METADATA</Text>
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
        <div className=" hidden rounded-2 border-1 border-solid border-greyExtralight p-2 lg:block">
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
