import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

import { formatDateString } from '@/lib/utils';

interface MetadataItem {
  label: string;
}

interface MetadataEntry {
  metadata_item: MetadataItem;
  value: string;
}

interface Dataset {
  id: string;
  metadata: MetadataEntry[];
  tags: string[];
  categories: string[];
  formats: string[];
  title: string;
  description: string;
  created: string; // ISO 8601 date string
  modified: string; // ISO 8601 date string
  organization: string | null;
}
const Cards = ({ data }: { data: Dataset }) => {
  function getMetadataValue(data: Dataset, label: string): string | null {
    const metadataEntry = data.metadata.find(
      (entry) => entry.metadata_item.label === label
    );
    return metadataEntry ? metadataEntry.value : null;
  }

  return (
    <div className="border-b-2 border-solid border-baseGraySlateSolid4 mb-6">
      <Link href={`/datasets/${data.id}`}>
        <div className="w-full rounded-1 bg-surfaceDefault p-6  shadow-elementCard">
          <div className="flex flex-wrap items-start gap-6 flex-col lg:flex-row  ">
            <div className="flex flex-1 flex-col flex-wrap items-start gap-3 p-0">
              <Text
                className=" text-textSubdued "
                variant="headingLg"
                as="p"
                breakWord
                fontWeight="semibold"
              >
                {data.title}
              </Text>
              <Text
                color="default"
                className=" text-textDefault "
                variant="headingSm"
                fontWeight="medium"
              >
                Source: {getMetadataValue(data, 'Source') || 'NA'}
              </Text>
              <span className="flex flex-col items-start gap-1">
                <Text
                  color="default"
                  className="  text-textSubdued  "
                  variant="bodySm"
                  fontWeight="regular"
                >
                  LastUpdated : {getMetadataValue(data, 'Last Updated') || 'NA'} |
                  UpdateFreq : {getMetadataValue(data, 'Update Frequency') || 'NA'}
                </Text>
                <Text
                  color="default"
                  className="  text-textSubdued  "
                  variant="bodySm"
                  fontWeight="regular"
                >
                  Reference Period :{' '}
                  <span>
                    {formatDateString(getMetadataValue(data, 'Period From')) || 'NA'} to{' '}
                    {formatDateString(getMetadataValue(data, 'Period To')) || 'NA'}
                  </span>
                </Text>
              </span>

              <span className="flex items-center gap-4 py-1 pr-2">
                {data.formats?.length > 0 &&
                  data.formats.map((fileType, index) => (
                    <Tag key={index} background-color="#E1F0FF">
                      {fileType}
                    </Tag>
                  ))}
              </span>
            </div>

            <div className="flex max-h-[150px]  flex-1 flex-col gap-4 overflow-hidden">
              <Text
                className="line-clamp-3"
                variant="bodyMd"
                as="p"
                color="default"
              >
                {data.description}
              </Text>

              
              <span className="flex gap-2 py-1 pr-2">
                {data?.categories.length > 0 &&
                  data?.categories.map((category, index) => (
                    <Tag key={index} background-color="#E1F0FF">
                      {category}
                    </Tag>
                  ))}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Cards;
