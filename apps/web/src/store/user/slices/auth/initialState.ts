import type { Session, User } from '@auth/core/types';
import type {
  ActiveSessionResource,
  SignInProps,
  SignOut,
  UserProfileProps,
  UserResource,
} from '@clerk/types';

import type { OrgUser } from '@repo/shared/types/user';

export interface UserAuthState {
  clerkOpenUserProfile?: (props?: UserProfileProps) => void;

  clerkSession?: ActiveSessionResource;
  clerkSignIn?: (props?: SignInProps) => void;
  clerkSignOut?: SignOut;
  clerkUser?: UserResource;
  isLoaded?: boolean;

  isSignedIn?: boolean;
  nextSession?: Session;
  nextUser?: User;
  oAuthSSOProviders?: string[];
  user?: OrgUser;
}

export const initialAuthState: UserAuthState = {};
