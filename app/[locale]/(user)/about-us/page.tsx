import React from 'react';
import { Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';

const About = () => {
  return (
    <main>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'About' },
        ]}
      />
      <div >
        <div className="container flex flex-col gap-6 py-10">
          <Text variant="heading2xl" >
            About us
          </Text>

          <Text variant="headingLg"  fontWeight="regular">
            We, at CivicDataLab, work at the intersection of data, technology,
            design and social science to strengthen access to public
            information, evidence-based decision-making and citizen
            participation in governance. CivicDataLab (CDL) harnesses the
            potential of open knowledge movements to strengthen the
            data-for-public-good ecosystem and enable citizens to engage in
            matters of public reform. We work closely with governments,
            non-profits, think tanks, media houses and universities to enhance
            their data and technology capacity to better data-driven
            decision-making at scale.
          </Text>
        </div>
      </div>
    </main>
  );
};

export default About;
