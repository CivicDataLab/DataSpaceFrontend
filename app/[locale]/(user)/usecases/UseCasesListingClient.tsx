'use client';

import Image from 'next/image';
import { Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import ListingComponent from '../components/ListingComponent';

const breadcrumbData = [
  { href: '/', label: 'Home' },
  { href: '#', label: 'Use Cases' },
];

const UseCasesListingClient = () => {
  return (
    <main>
      <BreadCrumbs data={breadcrumbData} />
      <div className="bg-primaryBlue">
        <div className="container flex flex-col-reverse justify-center gap-8 p-10 lg:flex-row">
          <div className="flex flex-col justify-center gap-6">
            <Text variant="heading2xl" className="text-surfaceDefault">
              Our Use Cases
            </Text>
            <Text
              variant="headingLg"
              fontWeight="regular"
              className="leading-3 text-surfaceDefault lg:leading-5"
            >
              By use case, we mean any data-led intervention across sectors that
              can address challenges from hyper-local to global levels
              effectively.
            </Text>
          </div>
          <Image
            src={'/Usecase_illustration.png'}
            width={600}
            height={316}
            alt={'Usecase Illustration'}
            className="m-auto h-auto w-full"
          />
        </div>
      </div>
      <div className="container p-6 lg:p-10 lg:pb-20">
        <div>
          <Text variant="heading2xl" fontWeight="bold">
            Explore Use Cases
          </Text>
        </div>
        <ListingComponent
          type="usecase"
          placeholder="Start typing to search for any Use Case"
          redirectionURL={`/usecases`}
        />
      </div>
    </main>
  );
};

export default UseCasesListingClient;
