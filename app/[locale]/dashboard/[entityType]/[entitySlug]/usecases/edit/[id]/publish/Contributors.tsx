import Image from 'next/image';
import { Text } from 'opub-ui';

interface Contributor {
  fullName?: string | null;
  profilePicture?: { url?: string | null } | null;
}

interface Organization {
  name?: string | null;
  logo?: { url?: string | null } | null;
}

interface UseCaseContributorsData {
  useCases: Array<{
    contributors?: Contributor[] | null;
    supportingOrganizations?: Organization[] | null;
    partnerOrganizations?: Organization[] | null;
  } | null> | null;
}

interface ContributorsProps {
  data?: UseCaseContributorsData | null;
}

interface ContributorSection {
  label: string;
  value: string;
  image: Contributor[];
}

interface OrgSection {
  label: string;
  value: string;
  image: Organization[];
}

const Contributors = ({ data }: ContributorsProps) => {
  const ContributorDetails: ContributorSection[] = [
    {
      label: 'Contributors',
      value:
        (data?.useCases?.[0]?.contributors?.length ?? 0) > 0
          ? data?.useCases?.[0]?.contributors
              ?.map((item) => item.fullName)
              .join(', ') || 'No Contributors'
          : 'No Contributors',
      image: data?.useCases?.[0]?.contributors ?? [],
    },
  ];

  const OrgDetails: OrgSection[] = [
    {
      label: 'Supporters',
      value:
        (data?.useCases?.[0]?.supportingOrganizations?.length ?? 0) > 0
          ? data?.useCases?.[0]?.supportingOrganizations
              ?.map((item) => item.name)
              .join(', ') || 'No Supporting Organizations'
          : 'No Supporting Organizations',
      image: data?.useCases?.[0]?.supportingOrganizations ?? [],
    },
    {
      label: 'Partners',
      value:
        (data?.useCases?.[0]?.partnerOrganizations?.length ?? 0) > 0
          ? data?.useCases?.[0]?.partnerOrganizations
              ?.map((item) => item.name)
              .join(', ') || 'No Partner Organizations'
          : 'No Partner Organizations',
      image: data?.useCases?.[0]?.partnerOrganizations ?? [],
    },
  ];
  return (
    <div className="flex flex-col gap-4 px-8 py-4">
      {ContributorDetails.map((item, index) => (
        <div className="flex flex-col gap-3" key={index}>
          <div>
            <Text variant="bodyMd">{item.label}:</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {item?.image.map((data, index) => (
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
      {OrgDetails.map((item, index) => (
        <div className="flex flex-col gap-3" key={index}>
          <div>
            <Text variant="bodyMd">{item.label}:</Text>
          </div>
          <div className="flex flex-wrap gap-6">
            {item.image.map((data, index) => (
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
