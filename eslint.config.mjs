import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '**/generated/**/*.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/next-env.d.ts',
    '**/*.config.js',
    '**/config/**/*.js',
    '**/lib/style-dictionary/**/*.js',
    '**/lib/eCharts.ts',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
    },
  },
]);

export default eslintConfig;
