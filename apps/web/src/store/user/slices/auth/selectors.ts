import { t } from 'i18next';

import {
  enableAuth,
  enableClerk,
  enableNextAuth,
} from '@repo/shared/config/auth';
import { BRANDING_NAME } from '@repo/shared/const/branding';
import { isDesktopApp } from '@repo/shared/const/version';
import type { OrgUser } from '@repo/shared/types/user';
import type { UserStore } from '../../store';

const DEFAULT_USERNAME = BRANDING_NAME;
const nickName = (s: UserStore) => {
  const defaultNickName = s.user?.fullName || s.user?.username;
  if (!enableAuth) {
    if (isDesktopApp) {
      return defaultNickName;
    }
    return t('userPanel.defaultNickname', { ns: 'common' });
  }

  if (s.isSignedIn) return defaultNickName;

  return t('userPanel.anonymousNickName', { ns: 'common' });
};

const username = (s: UserStore) => {
  if (!enableAuth) {
    if (isDesktopApp) {
      return s.user?.username;
    }
    return DEFAULT_USERNAME;
  }

  if (s.isSignedIn) return s.user?.username;

  return 'anonymous';
};

export const userProfileSelectors = {
  nickName,
  userAvatar: (s: UserStore): string => s.user?.avatar || '',
  userId: (s: UserStore) => s.user?.id,
  userProfile: (s: UserStore): OrgUser | null | undefined => s.user,
  username,
};

const isLogin = (s: UserStore) => {
  if (!enableAuth) return true;

  return s.isSignedIn;
};

export const authSelectors = {
  isLoaded: (s: UserStore) => s.isLoaded,
  isLogin,
  isLoginWithAuth: (s: UserStore) => s.isSignedIn,
  isLoginWithClerk: (s: UserStore): boolean =>
    (s.isSignedIn && enableClerk) || false,
  isLoginWithNextAuth: (s: UserStore): boolean =>
    (s.isSignedIn && !!enableNextAuth) || false,
};
