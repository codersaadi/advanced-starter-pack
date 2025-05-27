import { SessionProvider } from 'next-auth/react';
import type { PropsWithChildren } from 'react';

import UserUpdater from './UserUpdater';

const NextAuth = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider basePath={'/api/auth'}>
      {children}
      <UserUpdater />
    </SessionProvider>
  );
};

export default NextAuth;
