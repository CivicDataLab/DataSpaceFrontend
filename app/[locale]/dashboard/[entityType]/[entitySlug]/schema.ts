import { graphql } from '@/gql';

export const getOrgDetailsQryDoc: any = graphql(`
  query getOrgDetailsQry($slug: String) {
    organizations(slug: $slug) {
      id
      name
      logo {
        name
        path
        size
        url
        width
        height
      }
      slug
    }
  }
`);

export const getDataSpaceDetailsQryDoc: any = graphql(`
  query getDataSpaceDetailsQry($filters: DataSpaceFilter) {
    dataspaces(filters: $filters) {
      id
      name
      logo {
        name
        path
        size
        url
        width
        height
      }
      slug
    }
  }
`);
