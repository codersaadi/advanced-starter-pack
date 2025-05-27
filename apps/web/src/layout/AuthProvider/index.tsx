import type { PropsWithChildren } from 'react';

import { authEnv } from '@repo/env/auth';
import { ClerkProviderWrapper } from './Clerk';
import NextAuth from './NextAuth';
import NoAuth from './NoAuth';

const AuthProvider = ({ children }: PropsWithChildren) => {
  if (authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH)
    return <ClerkProviderWrapper>{children}</ClerkProviderWrapper>;

  if (authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH)
    return <NextAuth>{children}</NextAuth>;

  return <NoAuth>{children}</NoAuth>;
};

export default AuthProvider;
