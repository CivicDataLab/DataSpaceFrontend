import type { CodegenConfig } from '@graphql-codegen/cli';

// CI-specific codegen configuration that doesn't require network access
const config: CodegenConfig = {
  schema: './schema.graphql', // Use local schema file if available
  documents: 'app/**/*.ts*',
  ignoreNoDocuments: true,
  generates: {
    './gql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        // Generate types even without schema introspection
        skipTypename: false,
        withHooks: false,
        withHOC: false,
        withComponent: false,
      },
    },
  },
};

export default config;
