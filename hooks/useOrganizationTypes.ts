import { ApiOrganizationOrganizationTypesEnum } from '@/gql/generated/graphql';

export const useOrganizationTypes = () => {
  const organizationTypes = [
    { label: 'State Government', value: ApiOrganizationOrganizationTypesEnum.StateGovernment },
    { label: 'Union Territory Government', value: ApiOrganizationOrganizationTypesEnum.UnionTerritoryGovernment },
    { label: 'Urban Local Body', value: ApiOrganizationOrganizationTypesEnum.UrbanLocalBody },
    { label: 'Academic Institution', value: ApiOrganizationOrganizationTypesEnum.AcademicInstitution },
    { label: 'Central Government', value: ApiOrganizationOrganizationTypesEnum.CentralGovernment },
    { label: 'Citizens Group', value: ApiOrganizationOrganizationTypesEnum.CitizensGroup },
    { label: 'Civil Society Organisation', value: ApiOrganizationOrganizationTypesEnum.CivilSocietyOrganisation },
    { label: 'Industry Body', value: ApiOrganizationOrganizationTypesEnum.IndustryBody },
    { label: 'Media Organisation', value: ApiOrganizationOrganizationTypesEnum.MediaOrganisation },
    { label: 'Open Data Technology Community', value: ApiOrganizationOrganizationTypesEnum.OpenDataTechnologyCommunity },
    { label: 'Private Company', value: ApiOrganizationOrganizationTypesEnum.PrivateCompany },
    { label: 'Public Sector Company', value: ApiOrganizationOrganizationTypesEnum.PublicSectorCompany },
    { label: 'Others', value: ApiOrganizationOrganizationTypesEnum.Others },
    { label: 'Startup', value: ApiOrganizationOrganizationTypesEnum.Startup },
    { label: 'Government', value: ApiOrganizationOrganizationTypesEnum.Government },
    { label: 'Corporations', value: ApiOrganizationOrganizationTypesEnum.Corporations },
    { label: 'NGO', value: ApiOrganizationOrganizationTypesEnum.Ngo }
  ];

  return { organizationTypes };
};