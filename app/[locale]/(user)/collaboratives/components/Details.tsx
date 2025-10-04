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
        <Text variant="heading2xl" color="onBgDefault">{data.collaborativeBySlug.title}</Text>
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
                  <Text color="onBgDefault">Metadata</Text>
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
      {data.collaborativeBySlug.coverImage && (
        <div className="mt-6 lg:mt-10">
          <Image
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.collaborativeBySlug.coverImage?.path.replace('/code/files/', '')}`}
            alt={data.collaborativeBySlug.title}
            width={1200}
            height={400}
            className="h-auto w-full rounded-2 object-cover"
            unoptimized
          />
        </div>
      )}
      
      {/* Stats Section */}
      <div className="mt-10 flex flex-wrap items-center gap-8 lg:mt-12 lg:gap-0">
        <div className="flex flex-col border-x-[1px] border-solid border-tertiaryAccent px-8">
          <Text variant="heading3xl" className="text-secondaryOrange">
            {data.collaborativeBySlug.useCases?.length || 0}
          </Text>
          <Text variant="bodyLg" color="onBgDefault" className="w-24">
            Use Cases
          </Text>
        </div>
        
        <div className="flex flex-col border-x-[1px] border-solid border-tertiaryAccent px-8">
          <Text variant="heading3xl" className="text-secondaryOrange">
            {data.collaborativeBySlug.datasets?.length || 0}
          </Text>
          <Text variant="bodyLg" color="onBgDefault" className="w-24">
            Datasets
          </Text>
        </div>
        
        <div className="flex flex-col border-x-[1px] border-solid border-tertiaryAccent px-8">
          <Text variant="heading3xl" className="text-secondaryOrange">
            {(data.collaborativeBySlug.supportingOrganizations?.length || 0) + 
             (data.collaborativeBySlug.partnerOrganizations?.length || 0)}
          </Text>
          <Text variant="bodyLg" color="onBgDefault" className="w-24">
            Organizations
          </Text>
        </div>
        
        <div className="flex flex-col border-x-[1px] border-solid border-tertiaryAccent px-8">
          <Text variant="heading3xl" className="text-secondaryOrange">
            {data.collaborativeBySlug.contributors?.length || 0}
          </Text>
          <Text variant="bodyLg" color="onBgDefault" className="w-24">
            Contributors
          </Text>
        </div>
      </div>
      
      <div className=" lg:pr-4">
        {data.collaborativeBySlug.geographies && data.collaborativeBySlug.geographies.length > 0 && (
          <div className="mt-6 lg:mt-10">
            <Text variant="headingXl" color="onBgDefault">Geographies</Text>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.collaborativeBySlug.geographies.map((geo: any, index: number) => (
                <Tag
                  key={index}
                  fillColor="var(--orange-secondary-color)"
                  borderColor="var(--orange-secondary-text)"
                  textColor="white"
                >
                  {geo.name}
                </Tag>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 lg:mt-10">
          <Text variant="headingXl" color="onBgDefault">Summary</Text>
          <div className="mt-4">
            <Text variant="bodyLg" fontWeight="regular" className="leading-5" color="onBgDefault">
              {data.collaborativeBySlug.summary}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryDetails;
