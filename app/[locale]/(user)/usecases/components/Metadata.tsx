import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Icon, Text } from 'opub-ui';

import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';

const Metadata = ({ data, setOpen }: { data: any; setOpen?: any }) => {
  const metadata = [
    {
      label: 'Publisher',
      value: data.useCase.publishers[0]?.name || 'N/A',
    },
    {
      label: 'Website',
      value: (
        <Link
          href={data.useCase.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primaryBlue underline"
        >
          Visit Website
        </Link>
      ),
    },
    {
      label: 'Contact',
      value: (
        <Link
          className="text-primaryBlue underline"
          href={`mailto:${data.useCase.contactEmail}`}
        >
          Contact Publisher{' '}
        </Link>
      ),
    },
    {
      label: 'Started On',
      value: formatDate(data.useCase.created) || 'N/A',
    },
    {
      label: 'Status',
      value: data.useCase.runningStatus || 'N/A',
    },
    {
      label: 'Last Updated',
      value: formatDate(data.useCase.modified) || 'N/A',
    },
    {
      label: 'Sectors',
      value: (
        <Image
          src={`/Sectors/${data.useCase.sectors[0].name}.svg`}
          alt={data.useCase.sectors[0]?.name || ''}
          width={52}
          height={52}
          className="h-full w-full border-1 border-solid border-greyExtralight p-1"
        />
      ),
    },
    {
      label: 'SDG Goals',
      value:
        data.useCase.metadata?.find(
          (meta: any) => meta.metadataItem?.label === 'SDG Goal'
        )?.value || 'N/A',
    },
  ];

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
          {data?.organization?.logo?.url ? (
            <Image
              height={140}
              width={100}
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.useCase.publishers[0]?.logo?.url}`}
              alt={`${data.useCase.publishers?.name} logo`}
              className="w-full object-contain"
            />
          ) : (
            <Image
              height={140}
              width={100}
              src={'/fallback.svg'}
              alt={'fallback logo'}
              className="fill-current w-full object-contain"
            />
          )}
        </div>
        <div className="flex flex-col gap-8">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Text
                className="min-w-[120px]  basis-1/4 uppercase"
                variant="bodyMd"
              >
                {item.label}
              </Text>
              <Text
                className="max-w-xs truncate"
                variant="bodyLg"
                fontWeight="medium"
              >
                {typeof item.value === 'string' ? item.value : item.value}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
