import React from 'react';
import Image from 'next/image';
import { Divider, Text } from 'opub-ui';

const Initiatives = () => {
  const IntiativesList = [
    {
      name: 'Climate Action',
      image: '/About/ca.png',
      description:
        'Asia is the world’s most disaster-prone region, with 80% of extreme weather events caused by floods and storms. To help better prepare Asia for climate change, we are actively working with frontline workers, government agencies and other stakeholders to strengthen climate action and disaster risk reduction. These efforts are spread across all our initiatives, including projects like Green budgeting, Disaster Modelling and Citizen-led Disaster Reporting.',
    },
    {
      name: 'Digital Public Goods',
      image: '/About/dpg.png',
      description:
        'We are co-creating people-centric Digital Public Goods (DPGs), especially Open Data Platforms, Data Exchanges, Data Science Models and Citizen-led Apps for improving participatory data-driven governance and attain the Sustainable Development Goals (SDGs) and do no harm by adhering to privacy practices and applicable laws. DPGs and Digital Public Infrastructure (DPI) are critical enablers of digital transformation and are helping to improve public service delivery at scale.',
    },
    {
      name: 'Law and Justice',
      image: '/About/l&j.png',
      description:
        'To better understand implementation of laws, judicial reforms and attainment of human rights, its essential to track timely data of our courts, police, correctional homes, legal aid and other institutions. We have co-created Justice Hub - a crowdsourcing open data platform to help various stakeholders publish, consume and analyse legal data in India. We are also working to publish and analyse data to improve child protection in the country.',
    },
    {
      name: 'Open Contracting India',
      image: '/About/oci.png',
      description:
        'Demystifying public finance helps in understanding government’s fiscal and development priorities, supports equitable public policymaking and enables citizen trust. We are working at the national, sub-national and local level to help publish, standardise and analyse public finance data at Open Budgets India and other platforms, for data-driven decision-making and citizen participation. We also collaborate with various stakeholders to set best practices for green and inclusive budgeting for our sustainable future.',
    },
    {
      name: 'Public Finance',
      image: '/About/pf.png',
      description:
        'Demystifying public finance helps in understanding government’s fiscal and development priorities, supports equitable public policymaking and enables citizen trust. We are working at the national, sub-national and local level to help publish, standardise and analyse public finance data at Open Budgets India and other platforms, for data-driven decision-making and citizen participation. We also collaborate with various stakeholders to set best practices for green and inclusive budgeting for our sustainable future.',
    },
    {
      name: 'Urban Development',
      image: '/About/ud.png',
      description:
        'With rapid urbanisation, cities are becoming constantly evolving complex clusters, presenting new challenges and opportunities of economic development, infrastructure growth, migration and sustainability. To better understand and shape the development of our cities, we are opening-up crucial urban data and building the capacity of urban governments and local stakeholders. We are co-creating solutions like - city data platforms, citizen-led disaster reporting platforms, data science models for effective urban service delivery and more.',
    },
  ];
  return (
    <div className="container py-5 lg:py-10">
      <div className="flex flex-col gap-5 lg:gap-10">
        <div>
          <Text variant="heading2xl">Our Initiatives</Text>
        </div>
        <div className=" grid w-fit gap-10 md:grid-cols-2 lg:grid-cols-3">
          {IntiativesList.map((item, index) => (
            <div key={index} className=" rounded-4 p-7 shadow-card ">
              <div className="flex flex-col items-center gap-5">
                <Image
                  src={item.image}
                  alt={'initiative logo'}
                  width={328}
                  height={200}
                  className=" h-full w-full"
                  priority
                />
                <Text variant="headingLg">{item.name}</Text>
                <div className="flex flex-col gap-2 border-t-2 border-solid border-greyExtralight">
                  <Text className="pt-3 text-[#545456]">
                    {item.description}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Initiatives;
