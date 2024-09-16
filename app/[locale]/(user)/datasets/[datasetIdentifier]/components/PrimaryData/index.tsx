'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Spinner, Text, Tray } from 'opub-ui';

import { handleRedirect } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Metadata from '../Metadata';

interface PrimaryDataProps {
  data: any;
  isLoading?: boolean;
}

const PrimaryData: React.FC<PrimaryDataProps> = ({ data, isLoading }) => {
  const sourceMetadata = data.metadata.find(
    (item: any) => item.metadataItem.label === 'Source'
  );
  const sourceLink = data.metadata.find(
    (item: any) => item.metadataItem.label === 'Source Website'
  );
  const githubLink = data.metadata.find(
    (item: any) => item.metadataItem.label === 'Github Repo Link'
  );

  const [open, setOpen] = useState(false);

  return (
    <div className=" flex flex-col gap-4 bg-surfaceDefault px-6 py-8 ">
      <div className="flex flex-col gap-1">
        <Text variant="headingLg">{data?.title}</Text>
        <div className="flex flex-wrap items-center">
          <div className="flex gap-2">
            <Text>Source:</Text>
            <Text>{sourceMetadata.value}</Text>
          </div>
        </div>
          <div
            className="flex sm:block md:block lg:hidden"
            title="About the Dataset"
          >
            <Tray
              size="narrow"
              open={open}
              onOpenChange={setOpen}
              trigger={
                <div>
                  <Button
                    kind="tertiary"
                    className="lg:hidden"
                    onClick={(e) => setOpen(true)}
                  >
                    <div className='flex items-center gap-2 py-2'>
                    <Icon source={Icons.info} size={24} color="default" />
                    <Text>Metadata</Text>
                    </div>
                  </Button>
                </div>
              }
            >
              {isLoading ? (
                <div className=" mt-8 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <Metadata data={data} setOpen={setOpen} />
              )}
            </Tray>
          </div>
      </div>

      <div>
        <Text variant="bodyMd">{data?.description}</Text>
      </div>
      <div className="flex flex-wrap gap-6 pt-2">
        <div>
          <Link
            href={sourceLink.value}
            onClick={(event) => handleRedirect(event, sourceLink.value)}
            className="flex gap-1 text-textInteractive underline"
          >
            <Text color="interactive">Visit Source Website</Text>
            <Icon source={Icons.link} color="interactive" />
          </Link>
        </div>
        <div>
          <Link
            href={githubLink.value}
            onClick={(event) => handleRedirect(event, githubLink.value)}
            className="flex gap-1 text-textInteractive underline"
          >
            <Text color="interactive">Go to Github Repo</Text>
            <Icon source={Icons.link} color="interactive" />
          </Link>
        </div>
        <div>
          <Link
            href={githubLink.value}
            onClick={(event) => handleRedirect(event, githubLink.value)}
            className="flex gap-1 text-textInteractive underline"
          >
            <Text color="interactive">Share Dataset</Text>
            <Icon source={Icons.link} color="interactive" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrimaryData;
