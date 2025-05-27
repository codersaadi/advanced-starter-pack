import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import type { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type UserState, initialState } from './initialState';
import { type UserAuthAction, createAuthSlice } from './slices/auth/action';
import { type CommonAction, createCommonSlice } from './slices/common/action';

//  ===============   createStoreFn ============ //

export type UserStore = UserState & UserAuthAction & CommonAction;

const createStore: StateCreator<UserStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createAuthSlice(...parameters),
  ...createCommonSlice(...parameters),
});

//  ===============   useStore ============ //

const devtools = createDevtools('user');

export const useUserStore = createWithEqualityFn<UserStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow
);

export const getUserStoreState = () => useUserStore.getState();
