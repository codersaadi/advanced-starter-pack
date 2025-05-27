'use client';

import { useSession } from 'next-auth/react';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useUserStore } from '@/store/user';
import type { OrgUser } from '@repo/core/types/user';

// update the user data into the context
const UserUpdater = memo(() => {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';

  const isSignedIn =
    (status === 'authenticated' && session && !!session.user) || false;

  const nextUser = session?.user;
  const useStoreUpdater = createStoreUpdater(useUserStore);

  useStoreUpdater('isLoaded', isLoaded);
  useStoreUpdater('isSignedIn', isSignedIn);
  useStoreUpdater('nextSession', session);

  useEffect(() => {
    if (nextUser) {
      const userAvatar = useUserStore.getState().user?.avatar;

      const lobeUser = {
        avatar: userAvatar || '',
        email: nextUser.email,
        fullName: nextUser.name,
        id: nextUser.id,
      } as OrgUser;

      useUserStore.setState({ nextUser: nextUser, user: lobeUser });
    }
  }, [nextUser]);
  return null;
});

export default UserUpdater;
