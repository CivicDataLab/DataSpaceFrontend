import Image from 'next/image';
import { Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import Team from './components/Team';

const About = () => {
  return (
    <main>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'About' },
        ]}
      />
      <div className="container mb-5 py-5 lg:py-10">
        <Text variant="heading2xl">About CivicDataSpace</Text>
        <div className=" flex flex-col gap-4 pt-4 lg:gap-6 lg:pt-6">
          <Text variant="headingLg" fontWeight="regular" className=" leading-5">
            CivicDataSpace is a collaborative, open-source platform that goes
            beyond just making data accessible - it strengthens how data is
            used, shared, and reused. By bringing together siloed datasets and
            fragmented resources, it enables turning your data into tools for
            change.{' '}
          </Text>
          <Text variant="headingLg" fontWeight="regular" className=" leading-5">
            At its core, CivicDataSpace supports the formation of open,
            sector-specific Data Collaboratives-ecosystems that enable
            collective intelligence, foster responsible AI solutions, and power
            civic platforms. These collaboratives aim to make data more
            inclusive, interoperable, and AI-ready, helping policymakers,
            researchers, and civil society actors design more effective and
            sustainable solutions.
          </Text>
        </div>
        <div className="mt-4 lg:mt-10">
          <Image
            src="/illus.svg"
            alt="about"
            width={1000}
            height={1000}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="py-5 lg:py-10">
          <Text variant="heading2xl">The People Behind CivicDataSpace</Text>
          <div className="pt-4 lg:pt-6">
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
        </div>
        <div>
          <Team />
        </div>
      </div>
    </main>
  );
};

export default About;
