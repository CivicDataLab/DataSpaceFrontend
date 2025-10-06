/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from 'jiti';
import createNextIntlPlugin from 'next-intl/plugin';

const jiti = createJiti(fileURLToPath(import.meta.url));
jiti('./env');

// const backendUrl = new URL(process.env.NEXT_PUBLIC_BACKEND_URL);

const backendUrl = new URL(process.env.BACKEND_URL || 'http://localhost:8000');
const platformUrl = new URL(process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000');

const withNextIntl = createNextIntlPlugin('./i18n.ts');
const nextConfig = withNextIntl({
  transpilePackages: ['opub-ui'],
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['opub-ui', 'echarts', 'lucide-react', '@tabler/icons-react'],
    webpackBuildWorker: true,
    optimizeCss: true,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for development speed
    if (dev) {
      config.watchOptions = {
        poll: false,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    
    // Production bundle optimizations
    if (!dev && !isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = config.optimization.splitChunks || {};
      config.optimization.splitChunks.cacheGroups = {
        ...(config.optimization.splitChunks.cacheGroups || {}),
        echarts: {
          name: 'echarts',
          test: /[\\/]node_modules[\\/]echarts/,
          chunks: 'all',
          priority: 20,
        },
        icons: {
          name: 'icons',
          test: /[\\/]node_modules[\\/](@tabler\/icons-react|lucide-react)/,
          chunks: 'all',
          priority: 15,
        },
        ui: {
          name: 'opub-ui',
          test: /[\\/]node_modules[\\/]opub-ui/,
          chunks: 'all',
          priority: 10,
        },
      };
    }
    
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: backendUrl.protocol.slice(0, -1),
        hostname: backendUrl.hostname,
        port: backendUrl.port || '',
        pathname: '/**',
      },
      {
        protocol: platformUrl.protocol.slice(0, -1),
        hostname: platformUrl.hostname,
        port: platformUrl.port || '',
        pathname: '/**',
      },
    ],
  },
});

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: process.env.SENTRY_ORG_NAME,
    project: process.env.SENTRY_PROJECT_NAME,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: process.env.NODE_ENV === 'production',
    
    // Disable source map upload in development for speed
    sourcemaps: {
      disable: process.env.NODE_ENV === 'development',
    },

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
  process.env.SENTRY_FEATURE_ENABLED === 'true'
);
