import { withContentCollections } from '@content-collections/next';
import analyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import ReactComponentName from 'react-scan/react-component-name/webpack';
const isProd = process.env.NODE_ENV === 'production';
const buildWithDocker = process.env.DOCKER === 'true';
const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';
const enableReactScan = !!process.env.REACT_SCAN_MONITOR_API_KEY;
const isUsePglite = process.env.NEXT_PUBLIC_CLIENT_DB === 'pglite';
const isStandaloneMode = buildWithDocker || isDesktop;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const noWrapper = (config: NextConfig) => config;

const withBundleAnalyzer =
  process.env.ANALYZE === 'true' ? analyzer() : noWrapper;

const standaloneConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: { '*': ['public/**/*', '.next/static/**/*'] },
};

const hasSentry = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

const withSentry =
  isProd && hasSentry
    ? (c: NextConfig) =>
        withSentryConfig(c, {
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          silent: true,
          automaticVercelMonitors: true,
          disableLogger: true,
          tunnelRoute: '/monitoring',
          widenClientFileUpload: true,
          // sourcemaps: { disable: true },
        })
    : noWrapper;
const nextConfig: NextConfig = {
  ...(isStandaloneMode ? standaloneConfig : {}),
  basePath,
  compress: isProd,
  experimental: {
    optimizePackageImports: [
      '@repo/ui',
      '@repo/env',
      '@repo/core',
      '@repo/shared',
      '@icons-pack/react-simple-icons',
      // "emoji-mart",
      // "@emoji-mart/react",
      // "@emoji-mart/data",
    ],
    // oidc provider depend on constructor.name
    // but swc minification will remove the name
    // so we need to disable it
    // serverMinification: false,
    // webVitalsAttribution: ['CLS', 'LCP'],
  },

  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  reactStrictMode: true,

  // when external packages in dev mode with turbopack, this config will lead to bundle error
  serverExternalPackages: isProd
    ? [
        '@electric-sql/pglite',
        // "@arcjet/node", // Add Arcjet to external packages
      ]
    : undefined,

  // transpilePackages: ['pdfjs-dist', 'mermaid'],

  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    if (enableReactScan && !isUsePglite) {
      config.plugins.push(ReactComponentName({}));
    }

    // to fix shikiji compile error
    // refs: https://github.com/antfu/shikiji/issues/23
    config.module.rules.push({
      resolve: {
        fullySpecified: false,
      },
      // biome-ignore lint/performance/useTopLevelRegex:
      test: /\.m?js$/,
      type: 'javascript/auto',
    });

    // https://github.com/pinojs/pino/issues/688#issuecomment-637763276
    config.externals.push('pino-pretty');

    config.resolve.alias.canvas = false;

    // to ignore epub2 compile erro
    config.resolve.fallback = {
      ...config.resolve.fallback,
      zipfile: false,
    };
    return config;
  },
};

export default withContentCollections(
  withBundleAnalyzer(withSentry(nextConfig) as NextConfig)
);
