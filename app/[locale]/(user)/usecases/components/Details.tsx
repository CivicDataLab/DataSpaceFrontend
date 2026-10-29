'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button, Icon, Spinner, Tag, Text, Tray } from 'opub-ui';

import { UseCasedetailsQuery } from '@/gql/generated/graphql';
import { Icons } from '@/components/icons';
import { ContentBlocksRenderer } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/components/ContentBlocksRenderer';
import { parseUseCaseContent } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import Metadata from './Metadata';

interface PrimaryDetailsProps {
  data: UseCasedetailsQuery;
  isLoading: boolean;
}

const PrimaryDetails = ({ data, isLoading }: PrimaryDetailsProps) => {
  const [open, setOpen] = useState(false);
  const content = parseUseCaseContent(data.useCase.summary);

  return (
    <div>
      <div>
        <Text variant="heading2xl">{data.useCase.title}</Text>
      </div>
      {content.subtitle ? (
        <div className="mt-2">
          <Text variant="bodyLg" color="subdued">
            {content.subtitle}
          </Text>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {data.useCase.tags?.map((item, index: number) => (
          <div key={index}>
            <Tag
              fillColor="var(--accent-tertiary-color)"
              borderColor="#5C9A91"
              textColor="black"
            >
              {item.value}
            </Tag>
          </div>
        ))}
      </div>
      <div
        className="mt-6 flex sm:block md:block lg:hidden"
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
                onClick={() => setOpen(true)}
              >
                <div className="flex items-center gap-2 py-2">
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
      <div className="mt-6 lg:mt-10">
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.useCase.logo?.path.replace('/code/files/', '')}`}
          alt={data.useCase.title ?? ''}
          width={100}
          height={100}
          className="h-full w-full"
          unoptimized
        />
      </div>
      <div className=" lg:pr-4">
        {data.useCase.geographies && data.useCase.geographies.length > 0 && (
          <div className="mt-6 lg:mt-10">
            <Text variant="headingXl">Geographies</Text>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.useCase.geographies.map((geo, index: number) => (
                <Tag
                  key={index}
                  fillColor="var(--orange-secondary-color)"
                  borderColor="var(--orange-secondary-text)"
                  textColor="black"
                >
                  {geo.name}
                </Tag>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 lg:mt-10">
          <ContentBlocksRenderer summary={data.useCase.summary} />
        </div>
      </div>
    </div>
  );
};

export default PrimaryDetails;
