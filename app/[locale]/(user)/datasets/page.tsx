'use client';

import { useState } from 'react';
import { Button, Pill, SearchInput, Select, Text, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import Card from './components/Card';
import Filter from './components/FIlter/Filter';
import { data } from './data';

const DatasetsListing = () => {
  const [open, setOpen] = useState(false);

  return (
    <main className="bg-surfaceDefault ">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Dataset Listing' },
        ]}
      />
      <section className="mx-6 md:mx-8 lg:mx-10 ">
        <div className="my-4 flex flex-wrap items-center justify-between gap-6 rounded-2 bg-baseBlueSolid4  p-2">
          <div>
            <Text>
              Showing {data.length} of {data.length} Datasets
            </Text>
          </div>
          <div className="w-full max-w-[550px] md:block">
            <SearchInput
              label={'Search'}
              name={'Search'}
              placeholder="Search for data"
            />
          </div>
          <div className="flex items-center gap-2">
            <Text variant="bodyLg" className=" font-bold text-baseBlueSolid8">
              Sort by:
            </Text>
            <Select
              label=""
              labelInline
              name="select"
              options={[
                {
                  label: 'Newest',
                  value: 'newestUpdate',
                },
                {
                  label: 'Oldest',
                  value: 'oldestUpdate',
                },
              ]}
            />
          </div>
          <Tray
            size="narrow"
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button
                kind="secondary"
                className=" lg:hidden"
                onClick={(e) => setOpen(true)}
              >
                Filter
              </Button>
            }
          >
            <Filter setOpen={setOpen} />
          </Tray>
        </div>
        <div className="row flex gap-5">
          <div className=" hidden min-w-64 lg:block">
            <Filter />
          </div>
          <div className="flex w-full flex-col  px-2 ">
            <div className=" flex gap-2 border-b-2 border-solid border-baseGraySlateSolid4 pb-4">
              <Pill onRemove={(e) => console.log('test')}>CSV</Pill>
              <Pill onRemove={(e) => console.log('test')}>PDF</Pill>
            </div>
            <div className="mb-16 flex flex-col gap-6">
              {data.map((item, index) => (
                <Card key={index} data={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DatasetsListing;
