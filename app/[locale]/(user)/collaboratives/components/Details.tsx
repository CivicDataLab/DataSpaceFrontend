'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button, Icon, Spinner, Tag, Text, Tray } from 'opub-ui';

import { Icons } from '@/components/icons';
import Metadata from './Metadata';

const PrimaryDetails = ({ data, isLoading }: { data: any; isLoading: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div>
        <Text variant="heading2xl">{data.collaborativeBySlug.title}</Text>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.collaborativeBySlug.tags.map((item: any, index: number) => (
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
        title="About the Collaborative"
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
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborativeBySlug.logo?.path.replace('/code/files/', '')}`}
          alt={data.collaborativeBySlug.title}
          width={100}
          height={100}
          className="h-full w-full"
          unoptimized
        />
      </div>
      <div className=" lg:pr-4">
        <div className="mt-6 lg:mt-10">
          <Text variant="headingXl">Geographies</Text>
          <div className="mt-4">
            <Tag
              fillColor="var(--orange-secondary-color)"
              borderColor="var(--orange-secondary-text)"
              textColor="black"
            >
              {
                data.collaborativeBySlug.metadata?.find(
                  (meta: any) => meta.metadataItem?.label === 'Geography'
                )?.value
              }
            </Tag>
          </div>
        </div>
        <div className="mt-6 lg:mt-10">
          <Text variant="headingXl">Summary</Text>
          <div className="mt-4">
            <Text variant="bodyLg" fontWeight="regular" className="leading-5">
              {data.collaborativeBySlug.summary}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryDetails;
