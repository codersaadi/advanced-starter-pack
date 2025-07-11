import {
  enableAuth,
  enableClerk,
  enableNextAuth,
} from '@repo/shared/config/auth';

export const authRedirectPath =
  enableAuth && enableClerk
    ? '/login'
    : // biome-ignore lint/nursery/noNestedTernary: simple
      enableNextAuth
      ? 'next-auth/signin'
      : '#';
