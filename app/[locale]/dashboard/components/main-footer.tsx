import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

const MainFooter = () => {
  return (
    <>
      <div
        style={{
          backgroundColor: 'var( --background-alpha-medium)',
        }}
      >
        <div className="flex flex-wrap items-center justify-start gap-8 p-10 md:justify-center lg:justify-center lg:gap-32 ">
          <div className="flex  gap-8 ">
            <div className="flex items-center gap-2">
              <Icon source={Icons.logo} size={24} color="success" />
              <Text variant="headingLg" className="text-surfaceDefault" as="h1">
                CivicDataSpace
              </Text>
            </div>
            <div>
              <Image src={'/cdl.svg'} width={96} alt={'cdl'} height={94} />
            </div>
          </div>
          <div className=" flex  gap-6">
            <Link href={'#'} className=" text-baseIndigoSolid2">
              About Us
            </Link>
            <Link href={'#'} className=" text-baseIndigoSolid2">
              Sitemap
            </Link>
            <Link href={'#'} className=" text-baseIndigoSolid2">
              Contact Us
            </Link>
          </div>
          <div className=" flex flex-col gap-2">
            <Text
              color="highlight"
              className=" font-bold text-borderWarningSubdued"
            >
              Follow Us
            </Text>
            <div className=" flex gap-3">
              <div className="  h-10  w-10 rounded-5 bg-baseBlueSolid8 p-2">
                <Icon source={Icons.twitter} size={24} color="onBgDefault" />
              </div>
              <div className="  h-10  w-10 rounded-5 bg-baseBlueSolid8 p-2">
                <Icon source={Icons.linkedin} size={24} color="onBgDefault" />
              </div>
              <div className="  h-10  w-10 rounded-5 bg-baseBlueSolid8 p-2">
                <Icon source={Icons.facebook} size={24} color="onBgDefault" />
              </div>
              <div className="  h-10  w-10 rounded-5 bg-baseBlueSolid8 p-2">
                <Icon source={Icons.github} size={24} color="onBgDefault" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="  bg-baseBlueSolid6 p-2">
        <div className=" m-auto flex  items-center gap-2 md:pl-4 lg:w-5/6 lg:pl-8">
          <Icon source={Icons.info} size={24} />

          <Text variant="bodyMd">
            This Platform is designed, developed and hosted by CivicDataLab for
            Open Data PLatform
          </Text>
        </div>
      </div>
    </>
  );
};

export default MainFooter;
