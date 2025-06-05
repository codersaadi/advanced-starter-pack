import { type SWRResponse, mutate } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import type { UserStore } from '@/store/user';
import { useOnlyFetchOnceSWR } from '@repo/core/libs/swr';
import { userService } from '@repo/core/services/user';
import type { GlobalServerConfig } from '@repo/shared/types/server-config';
import type { OrgUser, UserInitializationState } from '@repo/shared/types/user';
import { merge } from '@repo/shared/utils/merge';

const GET_USER_STATE_KEY = 'initUserState';

export interface CommonAction {
  refreshUserState: () => Promise<void>;

  updateAvatar: (avatar: string) => Promise<void>;
  useInitUserState: (
    isLogin: boolean | undefined,
    serverConfig: GlobalServerConfig,

    options?: {
      onSuccess: (data: UserInitializationState) => void;
    }
  ) => SWRResponse;
}

export const createCommonSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  CommonAction
> = (set, get) => ({
  refreshUserState: async () => {
    await mutate(GET_USER_STATE_KEY);
  },
  updateAvatar: async (avatar) => {
    await userService.updateAvatar(avatar);

    await get().refreshUserState();
  },

  useInitUserState: (isLogin, serverConfig, options) =>
    useOnlyFetchOnceSWR<UserInitializationState>(
      isLogin ? GET_USER_STATE_KEY : null,
      () => userService.getUserState(),
      {
        onSuccess: (data) => {
          options?.onSuccess?.(data);

          if (data) {
            // if there is avatar or userId (from client DB), update it into user
            const user =
              data.avatar || data.userId
                ? merge(get().user, {
                    avatar: data.avatar,
                    email: data.email,
                    firstName: data.firstName,
                    fullName: data.fullName,
                    id: data.userId,
                    latestName: data.lastName,
                    username: data.username,
                  } as OrgUser)
                : get().user;

            set(
              {
                isOnboard: data.isOnboard,
                isUserStateInit: true,
                user,
              },
              false,
              'initUserState'
            );
          }
        },
      }
    ),
});
