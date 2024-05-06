import { SiteConfig } from 'types';

export const siteConfig: SiteConfig = {
  name: 'CivicDataSpace',
  description:
    'An open source platform to speed up the development of CivicDataSpace.',
  url: 'https://data-exchange.vercel.app',
};

export const locales = ['en', 'hi'];

export const gqlConfig = {
  url: `${process.env.BACKEND_GRAPHQL_URL}`,
  headers: {
    organization: '1',
  },
};
