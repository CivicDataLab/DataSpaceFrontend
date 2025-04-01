'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SearchInput, Text } from 'opub-ui';

import { cn } from '@/lib/utils';
import Styles from '../page.module.scss';

export const Content = () => {
  const router = useRouter();
  const handleSearch = (value: string) => {
    if (value) {
      router.push(`/datasets?query=${encodeURIComponent(value)}`);
    }
  };
  return (
    <main>
      <div className="flex items-center justify-center gap-20 bg-primaryBlue p-8 lg:p-16">
        <div className="flex flex-col gap-11">
          <div className="flex flex-col">
            <Text variant="heading3xl" color="onBgDefault">
              Collaborate to advance
            </Text>
            <Text
              variant="heading3xl"
              color="onBgDefault"
              className=" text-tertiaryAccent"
            >
              Data-driven Impact and Action
            </Text>
            <Text variant="heading3xl" color="onBgDefault">
              with CivicDataLab{' '}
            </Text>
          </div>
          <div className="w-full">
            <SearchInput
              className={cn(Styles.Search)}
              onSubmit={handleSearch}
              label={''}
              placeholder="Search for any data"
              name={''}
              withButton
            />
          </div>
        </div>
        <div className=" hidden lg:block">
          <Image
            src={'/homepage_illustartion.png'}
            width={500}
            height={400}
            alt="illustartion"
          />
        </div>
      </div>
    </main>
  );
};
