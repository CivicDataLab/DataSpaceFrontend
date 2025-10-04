import Image from 'next/image';
import { Text } from 'opub-ui';

const Contributors = ({ data }: { data: any }) => {
  const ContributorDetails = [
    {
      label: 'Contributors',
      value:
        data?.collaboratives[0]?.contributors.length > 0
          ? data?.collaboratives[0]?.contributors
              .map((item: any) => item.fullName)
              .join(', ')
          : 'No Contributors',
      image: data?.collaboratives[0]?.contributors,
    },
  ];

  const OrgDetails = [
    {
      label: 'Supporters',
      value:
        data?.collaboratives[0]?.supportingOrganizations.length > 0
          ? data?.collaboratives[0]?.supportingOrganizations
              .map((item: any) => item.name)
              .join(', ')
          : 'No Supporting Organizations',
      image: data?.collaboratives[0]?.supportingOrganizations,
    },
    {
      label: 'Partners',
      value:
        data?.collaboratives[0]?.partnerOrganizations.length > 0
          ? data?.collaboratives[0]?.partnerOrganizations
              .map((item: any) => item.name)
              .join(', ')
          : 'No Partner Organizations',
      image: data?.collaboratives[0]?.partnerOrganizations,
    },
  ];
  return (
    <div className="flex flex-col gap-4 px-8 py-4">
      {ContributorDetails.map((item: any, index: number) => (
        <div className="flex flex-col gap-3" key={index}>
          <div>
            <Text variant="bodyMd">{item.label}:</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {item?.image.map((data: any, index: number) => (
              <div key={index} className="flex flex-col items-center gap-4">
                <Image
                  src={
                    data?.profilePicture?.url
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.profilePicture.url}`
                      : '/profile.png'
                  }
                  alt={item.label}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />

                <Text
                  variant="bodyMd"
                  className=" w-36 rounded-1 bg-greyExtralight text-center"
                >
                  {data.fullName}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ))}
      {OrgDetails.map((item: any, index: number) => (
        <div className="flex flex-col gap-3" key={index}>
          <div>
            <Text variant="bodyMd">{item.label}:</Text>
          </div>
          <div className="flex flex-wrap gap-6">
            {item.image.map((data: any, index: number) => (
              <div key={index} className="flex flex-col items-center gap-4">
                <div className="rounded-4 bg-surfaceDefault p-4 shadow-basicMd">
                  <Image
                    src={
                      data?.logo?.url
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.logo.url}`
                        : '/org.png'
                    }
                    alt={item.label}
                    width={140}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <Text
                  variant="bodyMd"
                  className=" w-36 rounded-1 bg-greyExtralight text-center"
                >
                  {data.name}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Contributors;