import NextAuth from "next-auth";

import { getServerDB } from "@repo/core/database/server";
import { getServerDBConfig } from "@repo/env/db";
import { OrgNextAuthDbAdapter } from "./adapter";
import config from "./auth.config";

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
 * The difference and usage of the two different NextAuth modules
 */
export default NextAuth({
  ...config,
  pages: {
    error: "/next-auth/error",
    signIn: "/next-auth/signin",
  },
  adapter: NEXT_PUBLIC_ENABLED_SERVER_SERVICE
    ? OrgNextAuthDbAdapter(await getServerDB())
    : undefined,
  session: {
    strategy: "jwt",
  },
});
