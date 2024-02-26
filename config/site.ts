import { SiteConfig } from 'types';

export const siteConfig: SiteConfig = {
  name: 'Data Exchange',
  description:
    'An open source platform to speed up the development of Open Data Exchanges.',
  url: 'localhost:3000',
};

export const locales = ['en', 'hi'];

export const gqlConfig = {
  url: 'https://opub-backend.civicdatalab.in/graphql',
  headers: {
    organization: '1',
  },
};
