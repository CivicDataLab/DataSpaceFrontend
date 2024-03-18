import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  SearchInput,
  Select,
  Text,
  Tray,
} from 'opub-ui';

import CardsListing from './components/CardsListing/CardsListing';
import Filter from './components/FIlter/Filter';

const DatasetsListing = () => {
  const data = [
    {
      id: 777,
      datasetTitle:
        'Assam, India : Historical Weather Data : 2011-2020 - Guwahati(name may extend upto two lines after which ...)',
      description:
        ' Daily weather summaries for Guwahati, Assam, India, covering 2011-2020. Variables available for this period include MaxTemperature, Min Temperature, and Total Precipitation.Evapotranspiration, Potential Evapotranspiration, Solar Radiation,& Total Hours of Sunshine are also available, but sometimes missing.',
      metadata: {
        update: 'Monthly',
        category: 'Industrial',
        tags: [
          {
            title: 'HVD',
          },
          { title: 'Must Explore' },
        ],
        formats: [
          {
            type: 'CSV',
          },
          { type: 'JSON' },
        ],
        accessModels: [
          {
            type: 'Open',
          },
          { type: 'Restricted' },
        ],
        accessModelsCount: '8',
      },
    },
    {
      id: 888,
      datasetTitle:
        'Monthly Production of Petroleum Products by Refineries & Fractionators HVD of year 2023-2024',
      description:
        ' Source - RAJYA SABHA SESSION - 259 UNSTARRED QUESTION No 3106. ANSWERED ON, 28TH MARCH 2023. Data Figures are in Percentage. FY 2022-23 (April-February). Source - MOSPI. Note - Data for February 2023 is provisional.',
      metadata: {
        update: 'Monthly',
        category: 'Petroleum',
        tags: [
          {
            title: 'HVD',
          },
          { title: 'Most Viewed' },
        ],
        formats: [
          {
            type: 'PDF',
          },
          { type: 'JSON' },
        ],
        accessModels: [
          {
            type: 'Registered',
          },
          { type: 'Restricted' },
        ],
        accessModelsCount: '2',
      },
    },
    {
      id: 999,
      datasetTitle:
        'Assam, India : Historical Weather Data : 2011-2020 - Guwahati(name may extend upto two lines after which ...)',
      description:
        ' Daily weather summaries for Guwahati, Assam, India, covering 2011-2020. Variables available for this period include MaxTemperature, Min Temperature, and Total Precipitation.Evapotranspiration, Potential Evapotranspiration, Solar Radiation,& Total Hours of Sunshine are also available, but sometimes missing.',
      metadata: {
        update: 'Monthly',
        category: 'Industrial',
        tags: [
          {
            title: 'HVD',
          },
          { title: 'Must Explore' },
        ],
        formats: [
          {
            type: 'CSV',
          },
          { type: 'JSON' },
        ],
        accessModels: [
          {
            type: 'Open',
          },
          { type: 'Restricted' },
        ],
        accessModelsCount: '8',
      },
    },
  ];

  return (
    <main className="mx-5 py-5" style={{ backgroundColor: 'var(-pure-white)' }}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dataset Listing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
            <CardsListing key={index} data={item} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default DatasetsListing;
