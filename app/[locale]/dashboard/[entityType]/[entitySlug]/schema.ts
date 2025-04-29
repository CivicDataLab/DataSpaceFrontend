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

