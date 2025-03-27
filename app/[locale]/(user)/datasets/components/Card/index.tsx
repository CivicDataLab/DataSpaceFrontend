import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Tag, Text, Tooltip } from 'opub-ui';

import { formatDateString } from '@/lib/utils';
import { Icons } from '@/components/icons';

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
  sectors: string[];
  formats: string[];
  has_charts: boolean,
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

  const [showMore, setShowMore] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);

  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const toggleShowMore = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent link navigation
    event.stopPropagation(); // Stop event from propagating to the card's link
    setShowMore((prevState) => !prevState);
  };

  useEffect(() => {
    if (descriptionRef.current) {
      const isLong =
        descriptionRef.current.scrollHeight >
        descriptionRef.current.clientHeight;
      setIsDescriptionLong(isLong);
    }
  }, [data]);

  return (
    <div className="mb-6 border-b-2 border-solid border-baseGraySlateSolid4">
      <Link href={`/datasets/${data.id}`} passHref>
        <div className="w-full cursor-pointer rounded-1 bg-surfaceDefault p-4 shadow-elementCard">
          <div>
            <div className="flex flex-col flex-wrap items-start gap-3 lg:flex-row lg:gap-6">
              <div className="flex  flex-col flex-wrap items-start gap-3 p-0 lg:w-2/5">
                <Text
                  className="text-textSubdued"
                  variant="headingLg"
                  as="p"
                  breakWord
                  fontWeight="semibold"
                >
                  {data.title}
                </Text>
                <Text
                  color="default"
                  className="text-textDefault"
                  variant="headingSm"
                  fontWeight="medium"
                >
                  Source: {getMetadataValue(data, 'Source') || 'NA'}
                </Text>
                <span className="flex flex-col items-start gap-1">
                  <div className=" flex flex-col gap-2  lg:flex-row">
                    <Text
                      color="default"
                      className="text-textSubdued"
                      variant="bodySm"
                      fontWeight="regular"
                    >
                      Last Updated:{' '}
                      {getMetadataValue(data, 'Last Updated') || 'NA'}
                    </Text>
                    <Text
                      color="default"
                      className="hidden text-textSubdued  lg:block"
                      variant="bodySm"
                      fontWeight="regular"
                    >
                      |
                    </Text>
                    <Text
                      color="default"
                      className="text-textSubdued"
                      variant="bodySm"
                      fontWeight="regular"
                    >
                      Update Frequency:{' '}
                      {getMetadataValue(data, 'Update Frequency') || 'NA'}
                    </Text>
                  </div>
                </span>
              </div>

              <div className="flex flex-1 flex-col-reverse  gap-4 overflow-hidden lg:max-h-[150px] lg:flex-col">
                <div>
                  <div
                    ref={descriptionRef}
                    className={!showMore ? ' line-clamp-2 lg:line-clamp-5' : ''}
                  >
                    <Tooltip
                      content={data.description}
                      align="end"
                      width="wide"
                    >
                      <Text variant="bodyMd" as="p" color="default">
                        {data.description}
                      </Text>
                    </Tooltip>
                  </div>

                  {/* Only show the "Show more" button on medium and small screens */}
                  {isDescriptionLong && (
                    <div className="block md:hidden">
                      <Button
                        className="self-start p-2"
                        onClick={toggleShowMore}
                        variant="interactive"
                        size="slim"
                        kind="tertiary"
                      >
                        {showMore ? 'Show less' : 'Show more'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap  gap-3 lg:gap-6">
              <div className="flex items-center gap-1 align-middle lg:w-2/5">
                {data.formats?.length > 0 && (
                  <span className="flex items-center gap-4 py-1 pr-2 ">
                    {data.formats.map((fileType, index) => (
                      <Tag key={index} background-color="#E1F0FF">
                        {fileType}
                      </Tag>
                    ))}
                  </span>
                )}

              {data.has_charts &&  <Icon source={Icons.chart} size={20} />}
              </div>

              {data?.sectors.length > 0 && (
                <span className="flex flex-wrap gap-2 py-1 pr-2">
                  {data?.sectors.map((category, index) => (
                    <div
                      key={index}
                      className="rounded-1 border-1 px-2 py-1 text-75"
                      style={{
                        borderColor: '#95E79E',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Cards;
