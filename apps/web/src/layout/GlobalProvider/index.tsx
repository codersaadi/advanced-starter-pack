import { ServerConfigStoreProvider } from '@/store/serverConfig/Provider';
import { getServerFeatureFlagsValue } from '@repo/core/config/featureFlags';
import { getServerGlobalConfig } from '@repo/core/server/globalConfig';
import { type ReactNode, Suspense } from 'react';
import QueryProvider from './Query';
import StoreInitialization from './StoreInitialization';
interface GlobalLayoutProps {
  children: ReactNode;
  isMobile: boolean;
  // locale: string;
}

const GlobalLayout = async ({
  children,
  // locale,
  isMobile,
}: GlobalLayoutProps) => {
  // get default feature flags to use with ssr
  const serverFeatureFlags = getServerFeatureFlagsValue();
  const serverConfig = await getServerGlobalConfig();
  return (
    <ServerConfigStoreProvider
      featureFlags={serverFeatureFlags}
      isMobile={isMobile}
      serverConfig={serverConfig}
    >
      <QueryProvider>{children}</QueryProvider>
      <StoreInitialization />
      <Suspense>{/* <ReactScan /> */}</Suspense>
    </ServerConfigStoreProvider>
  );
};

export default GlobalLayout;
