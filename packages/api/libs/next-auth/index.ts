import NextAuth from 'next-auth';

import { db } from '@repo/api/database/server';
import { getServerDBConfig } from '@repo/env/db';
import { OrgNextAuthDbAdapter } from './adapter';
import config from './auth.config';

const { NEXT_PUBLIC_ENABLED_SERVER_SERVICE } = getServerDBConfig();

/**
 * NextAuth initialization with Database adapter
 *
 * @example
 * ```ts
 * import NextAuthNode from '@/libs/next-auth';
 * const { handlers } = NextAuthNode;
 * ```
 *
 * @note
 * If you meet the edge runtime compatible problem,
 * you can import from `@/libs/next-auth/edge` which is not initial with the database adapter.
 *
 * The difference and usage of the two different NextAuth modules is can be
 * ref to: https://github.com/lobehub/lobe-chat/pull/2935
 */
export default NextAuth({
  ...config,
  adapter: NEXT_PUBLIC_ENABLED_SERVER_SERVICE
    ? OrgNextAuthDbAdapter(db)
    : undefined,
  session: {
    strategy: 'jwt',
  },
});
