import React from 'react';
import Image from 'next/image';
import { Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import Initiatives from './components/Initiatives';

const About = () => {
  return (
    <main>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'About' },
        ]}
      />
      <div className="container py-5 lg:py-10 mb-5">
        <div className=" flex flex-wrap justify-center gap-14 lg:flex-nowrap ">
          <div className="flex flex-col gap-6">
            <Text variant="heading2xl">About us</Text>
            <Text
              variant="headingLg"
              fontWeight="regular"
              className=" leading-5"
            >
              CivicDataLab (CDL) works at the intersection of data, technology,
              design and social science to strengthen access to public
              information, evidence-based decision-making and citizen
              participation in governance. CDL harnesses the potential of open
              knowledge movements to strengthen the data-for-public-good
              ecosystem and enable citizens to engage in matters of public
              reform. We work closely with governments, non-profits,
              think-tanks, media houses and universities to enhance their data
              and technology capacity to better data-driven decision-making at
              scale.
            </Text>
          </div>
          <Image
            src={'/about-us-illustration.svg'}
            alt={'about-us-illustration'}
            width={536}
            height={350}
            className=" w-full"
            priority
          />
        </div>
      </div>
      <div className="bg-primaryBlue">
        <div className=" container flex flex-col gap-6 py-5 lg:py-10">
          <div>
            <Text variant="headingLg" fontWeight="regular" color="onBgDefault">
              Our current areas of expertise include digital public goods &
              infrastructure (DPGs & DPI), climate change, public finance, urban
              development, open contracting and law & justice. We have
              co-created digital public goods like open data platforms, data
              exchanges, data science models and citizen-led apps for improving
              participatory data-driven governance in India and other countries.
            </Text>
          </div>
          <div>
            <Text variant="headingLg" fontWeight="regular" color="onBgDefault">
              In the last five years, we have collected, cleaned and published
              nearly 30,000+ public interest datasets and are catering to an
              active user base of more than a million citizens. Some of our
              publicly available open data initiatives include Open Budgets
              India, Justice Hub, Open Contracting India, Open City, CogniCity
              among others. We have co-created digital public goods with
              National Informatics Center (NIC), Ministry of Electronic &
              Information Technology (MeitY) and the Government of Assam.
              Additionally, we actively build capacity for a diverse group of
              partners working to enhance social impact, situated in India,
              Indonesia, Philippines, Thailand, Panama and Scotland.
            </Text>
          </div>
        </div>
      </div>
      <div>
        <Initiatives />
      </div>
    </main>
  );
};

export default About;
