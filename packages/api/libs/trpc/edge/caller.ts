import {
  appRouter,
  createTRPCContext,
  createCallerFactory as innerCallerFactory,
} from '@repo/api';
import EdgeConfig from '@repo/api/libs/next-auth';
import { headers } from 'next/headers';

export const readyServerContext = async () => {
  const headerList = await headers();
  const session = await EdgeConfig.auth();
  return createTRPCContext({
    headers: headerList,
    auth: {
      ...session,
      // accessToken: session?.access_token,
      user: {
        ...session?.user,
        email: session?.user?.email ?? undefined,
        id: session?.user?.id ?? undefined,
        organizationId: session?.user?.organizationId,
      },
      expires: session?.expires,
    },
  });
};

// Server-side caller factory
export const createCallerFactory = () =>
  innerCallerFactory(appRouter)(readyServerContext);
