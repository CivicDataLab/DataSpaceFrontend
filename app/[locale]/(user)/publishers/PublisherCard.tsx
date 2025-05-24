import React from 'react';
import Image from 'next/image';
import { Text } from 'opub-ui';

interface CardProps {
  data: any;
}

const PublisherCard: React.FC<CardProps> = ({ data }) => {
  return (
    <div className="my-10">
      <div className=" grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-16">
        {data.map((item: any, index: any) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-4 p-6 shadow-card"
          >
            <div className="flex items-center gap-4">
              <Image
                height={80}
                width={80}
                src={
                  item.__typename === 'TypeUser'
                    ? item?.profilePicture
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.profilePicture.url}`
                      : '/profile.png'
                    : item?.logo
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo.url}`
                      : '/org.png'
                }
                alt={'logo'}
                className=" rounded-2 border-2  border-solid border-greyExtralight object-contain p-2"
              />
              <div className="flex flex-col gap-2">
                <Text className=" text-primaryBlue" fontWeight="semibold">
                  {item.__typename === 'TypeUser' ? item.fullName : item.name}
                </Text>
                <div className=" flex w-fit rounded-full border-1 border-solid border-[#D5E1EA] bg-[#E9EFF4] px-3 py-1">
                  <Text variant="bodySm">
                    {item.__typename === 'TypeUser'
                      ? 'Individual Publisher'
                      : 'Organization'}
                  </Text>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className=" flex w-fit rounded-full border-1 border-solid border-[#D5E1EA]  px-3 py-1">
                <Text variant="bodySm" className=" text-primaryBlue">
                  {item.publishedUseCasesCount} Use Cases
                </Text>
              </div>
              <div className=" flex w-fit rounded-full border-1 border-solid border-[#D5E1EA]  px-3 py-1">
                <Text variant="bodySm" className=" text-primaryBlue">
                  {item.publishedDatasetsCount} Datasets
                </Text>
              </div>
              <div className=" flex w-fit rounded-full border-1 border-solid border-[#D5E1EA]  px-3 py-1">
                <Text variant="bodySm" className=" text-primaryBlue">
                  3 Followers{' '}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublisherCard;
