import {
  type UserAuthState,
  initialAuthState,
} from './slices/auth/initialState';
import {
  type CommonState,
  initialCommonState,
} from './slices/common/initialState';

export type UserState = UserAuthState & CommonState;

export const initialState: UserState = {
  ...initialAuthState,
  ...initialCommonState,
};
