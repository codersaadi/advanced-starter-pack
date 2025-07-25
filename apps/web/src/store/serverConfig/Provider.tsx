'use client';

import { type ReactNode, memo } from 'react';

import type { IFeatureFlags } from '@repo/shared/config/featureFlags';
import type { GlobalServerConfig } from '@repo/shared/types/server-config';

import { Provider, createServerConfigStore } from './store';

interface GlobalStoreProviderProps {
  children: ReactNode;
  featureFlags?: Partial<IFeatureFlags>;
  isMobile?: boolean;
  serverConfig?: GlobalServerConfig;
}

export const ServerConfigStoreProvider = memo<GlobalStoreProviderProps>(
  ({ children, featureFlags, serverConfig, isMobile }) => (
    <Provider
      createStore={() =>
        createServerConfigStore({ featureFlags, isMobile, serverConfig })
      }
    >
      {children}
    </Provider>
  )
);
