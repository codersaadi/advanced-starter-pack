import type { UserInitializationState } from '@repo/shared/types/user';
import type { AdapterAccount } from 'next-auth/adapters';

export interface IUserService {
  getUserRegistrationDuration: () => Promise<{
    createdAt: string;
    duration: number;
    updatedAt: string;
  }>;
  getUserSSOProviders: () => Promise<AdapterAccount[]>;
  getUserState: (
    isLogin: boolean
  ) => Promise<UserInitializationState> | UserInitializationState;
  unlinkSSOProvider: (
    provider: string,
    providerAccountId: string
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  updateAvatar: (avatar: string) => Promise<any>;
}
