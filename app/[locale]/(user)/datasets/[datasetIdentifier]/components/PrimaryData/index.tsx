'use client';

import React, { useState } from 'react';
import { Button, Icon, Spinner, Tag, Text, Tray } from 'opub-ui';

import { Icons } from '@/components/icons';
import Metadata from '../Metadata';

interface PrimaryDataProps {
  data: any;
  isLoading?: boolean;
}

const PrimaryData: React.FC<PrimaryDataProps> = ({ data, isLoading }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Text variant="headingLg">{data?.title}</Text>
        <div className="flex gap-2">
          {data?.tags.map((item: any, index: any) => (
            <Tag key={index}>{item.value}</Tag>
          ))}
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
      </div>
    </div>
  );
};

export default PrimaryData;
