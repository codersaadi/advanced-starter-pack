import type { StoreApi } from 'zustand';
import { createContext } from 'zustand-utils';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import type { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevtools';
import type { StoreApiWithSelector } from '@/utils/zustand';
import {
  DEFAULT_FEATURE_FLAGS,
  type IFeatureFlags,
} from '@repo/shared/config/featureFlags';
import type { GlobalServerConfig } from '@repo/shared/types/server-config';

import { merge } from '@repo/shared/utils/merge';
import { type ServerConfigAction, createServerConfigSlice } from './action';

interface ServerConfigState {
  featureFlags: IFeatureFlags;
  isMobile?: boolean;
  serverConfig: GlobalServerConfig;
}

const initialState: ServerConfigState = {
  featureFlags: DEFAULT_FEATURE_FLAGS,
  serverConfig: {},
};

export interface ServerConfigStore
  extends ServerConfigState,
    ServerConfigAction {}

type CreateStore = (
  initState: Partial<ServerConfigStore>
) => StateCreator<ServerConfigStore, [['zustand/devtools', never]]>;

const createStore: CreateStore =
  (runtimeState) =>
  (...params) => ({
    ...merge(initialState, runtimeState),
    ...createServerConfigSlice(...params),
  });

//  =============== useStore ============ //

let store: StoreApi<ServerConfigStore>;

declare global {
  interface Window {
    global_serverConfigStore: StoreApi<ServerConfigStore>;
  }
}

const devtools = createDevtools('serverConfig');

export const initServerConfigStore = (initState: Partial<ServerConfigStore>) =>
  createWithEqualityFn<ServerConfigStore>()(
    devtools(createStore(initState || {})),
    shallow
  );

export const createServerConfigStore = (
  initState?: Partial<ServerConfigStore>
) => {
  // make sure there is only one store
  if (!store) {
    store = createWithEqualityFn<ServerConfigStore>()(
      devtools(createStore(initState || {})),
      shallow
    );

    if (typeof window !== 'undefined') {
      window.global_serverConfigStore = store;
    }
  }

  return store;
};

export const { useStore: useServerConfigStore, Provider } =
  createContext<StoreApiWithSelector<ServerConfigStore>>();
