import { getServerDB } from "@repo/core/database/server";
import { getServerDBConfig } from "@repo/env/db";
import NextAuth, { type NextAuthConfig } from "next-auth";
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
const baseConfig = {
  ...config,
  adapter: undefined,
} satisfies Partial<NextAuthConfig>;
const adapter = NEXT_PUBLIC_ENABLED_SERVER_SERVICE
  ? OrgNextAuthDbAdapter(await getServerDB())
  : undefined;

// const allProviders: Provider[] = [...config.providers];
// const hasMagic =
//   authEnv.NEXT_AUTH_MAGIC_LINK_ENABLED &&
//   isServerMode &&
//   NEXT_PUBLIC_ENABLED_SERVER_SERVICE &&
//   !!adapter;
// if (hasMagic) {
//   const provider = await import("./custom-actions/auth-email-provider");
//   allProviders.push(await provider.authEmailProvider());
// }

const NextAuthNode = NextAuth({
  ...baseConfig,
  // providers: allProviders,
  pages: {
    error: "/next-auth/error",
    signIn: "/next-auth/signin",
    // verifyRequest: "/next-auth/verify-request", // IMPORTANT: Set a custom page here
  },
  adapter,
  session: {
    strategy: "jwt",
  },
});

export const nextAuthNodeSignIn = NextAuthNode.signIn;
export default NextAuthNode;
