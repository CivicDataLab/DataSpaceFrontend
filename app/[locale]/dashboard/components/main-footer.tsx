import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';
import { IconBinary, IconBinaryTree } from '@tabler/icons-react';

const MainFooter = () => {
  return (
    <>
      <div className="bg-primaryBlue">
        <div className="flex flex-col gap-8 p-6 lg:px-28 lg:py-10">
          <div className="flex flex-wrap justify-between gap-8 ">
            {' '}
            <div className="flex items-center gap-2">
              <Image src={'/logo.png'} width={38} height={38} alt="logo" />
              <Text variant="headingXl" className="text-surfaceDefault" as="h1">
                CivicDataSpace
              </Text>
            </div>
            <div className=" flex flex-col  lg:items-end gap-2">
              <div>
                {' '}
                <Text
                  color="highlight"
                  className=" font-bold text-borderWarningSubdued"
                >
                  Follow Us
                </Text>
              </div>

              <div className=" flex gap-3">
                <div className="  h-10  w-10 rounded-5 bg-secondaryOrange p-2">
                  <Icon source={Icons.twitter} size={24} color="onBgDefault" />
                </div>
                <div className="  h-10  w-10 rounded-5 bg-secondaryOrange p-2">
                  <Icon source={Icons.linkedin} size={24} color="onBgDefault" />
                </div>
                <div className="  h-10  w-10 rounded-5 bg-secondaryOrange p-2">
                  <Icon source={Icons.facebook} size={24} color="onBgDefault" />
                </div>
                <div className="  h-10  w-10 rounded-5 bg-secondaryOrange p-2">
                  <Icon source={Icons.github} size={24} color="onBgDefault" />
                </div>
              </div>
            </div>
          </div>
          <div className=" flex justify-between flex-wrap">
            <div className=" flex  gap-6">
              <Link href={'#'}>
                <Text color="onBgDefault"> About Us</Text>
              </Link>
              <Link href={'#'}>
                <Text color="onBgDefault"> Sitemap</Text>
              </Link>
              <Link href={'#'}>
                <Text color="onBgDefault"> Contact Us</Text>
              </Link>
            </div>
           
          </div>
        </div>
      </div>
    </>
  );
};

export default MainFooter;
