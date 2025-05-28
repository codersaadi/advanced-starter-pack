import { SessionProvider } from 'next-auth/react';
import type { PropsWithChildren } from 'react';

import UserUpdater from './UserUpdater';

const NextAuth = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      {children}
      <UserUpdater />
    </SessionProvider>
  );
};

export default NextAuth;
