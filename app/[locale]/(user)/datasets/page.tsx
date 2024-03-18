import React from 'react';
import { Button, SearchInput, Select, Text, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import Cards from './components/Cards';
import Filter from './components/FIlter/Filter';
import { data } from './data';

const DatasetsListing = () => {
  return (
    <main className="mx-5 py-5" style={{ backgroundColor: 'var(-pure-white)' }}>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Dataset Listing' },
        ]}
      />

      <section className="row flex gap-7 pt-2">
        <div className="hidden w-60 lg:block">
          <Filter />
        </div>
        <div className="w-full px-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Text>Showing {data.length} Datasets</Text>
            </div>
            <div className="w-full max-w-[550px] md:block">
              <SearchInput
                label={'Search'}
                name={'Search'}
                placeholder="Search for data"
              />
            </div>
            <Select
              label="Sort by "
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

            <Tray
              trigger={
                <Button kind="secondary" className=" lg:hidden">
                  Filter
                </Button>
              }
            >
              <Filter />
            </Tray>
          </div>
          {data.map((item, index) => (
            <Cards key={index} data={item} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default DatasetsListing;
