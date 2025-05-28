import { getServerDB } from "@repo/core/database/server";
import { authEnv } from "@repo/env/auth";
import { getServerDBConfig } from "@repo/env/db";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { OrgNextAuthDbAdapter } from "./adapter";
import config from "./auth.config";
import { authEmailProvider } from "./custom-actions";

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

const adapter = NEXT_PUBLIC_ENABLED_SERVER_SERVICE
  ? OrgNextAuthDbAdapter(await getServerDB())
  : undefined;

const allProviders: Provider[] = config.providers;
if (
  authEnv.NEXT_AUTH_MAGIC_LINK_ENABLED &&
  NEXT_PUBLIC_ENABLED_SERVER_SERVICE &&
  !!adapter
) {
  allProviders.push(authEmailProvider());
}

export default NextAuth({
  ...config,
  providers: allProviders,
  pages: {
    error: "/next-auth/error",
    signIn: "/next-auth/signin",
  },
  adapter,
  session: {
    strategy: "jwt",
  },
});
