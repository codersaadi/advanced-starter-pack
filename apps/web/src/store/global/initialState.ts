import type { SupportedLocales } from '@repo/i18n/config/client';
import {
  DatabaseLoadingState,
  type MigrationSQL,
  type MigrationTableItem,
} from '@repo/shared/types/client-db';
import { AsyncLocalStorage } from '@repo/shared/utils/local-storage';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// biome-ignore lint/nursery/noEnum:
export enum ProfileTabs {
  Profile = 'profile',
  Security = 'security',
  Stats = 'stats',
}

export interface SystemStatus {
  // which sessionGroup should expand
  isEnablePglite?: boolean;
  language?: SupportedLocales;
  // showFilePanel?: boolean;
  zenMode?: boolean;
}

export interface GlobalState {
  hasNewVersion?: boolean;
  initClientDBError?: Error;
  initClientDBMigrations?: {
    sqls: MigrationSQL[];
    tableRecords: MigrationTableItem[];
  };

  initClientDBProcess?: {
    costTime?: number;
    phase: 'wasm' | 'dependencies';
    progress: number;
  };
  initClientDBStage: DatabaseLoadingState;
  isMobile?: boolean;
  isStatusInit?: boolean;
  latestVersion?: string;
  router?: AppRouterInstance;
  status: SystemStatus;
  statusStorage: AsyncLocalStorage<SystemStatus>;
}

export const INITIAL_STATUS = {
  zenMode: false,
} satisfies SystemStatus;

export const initialState: GlobalState = {
  initClientDBStage: DatabaseLoadingState.Idle,
  isMobile: false,
  isStatusInit: false,
  status: INITIAL_STATUS,
  statusStorage: new AsyncLocalStorage('ORG_SYSTEM_STATUS'),
};
