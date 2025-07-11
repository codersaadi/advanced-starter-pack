import type { NextAuthConfig } from 'next-auth';

import { authEnv } from '@repo/env/auth';
import { ssoProviders } from './sso-providers';

export const getSSOProviders = () => {
  return authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? // biome-ignore lint/performance/useTopLevelRegex: allowed
      authEnv.NEXT_AUTH_SSO_PROVIDERS.split(/[,，]/).map((provider) => {
        const validProvider = ssoProviders.find(
          (item) => item.id === provider.trim()
        );

        if (validProvider) return validProvider.provider;

        throw new Error(`[NextAuth] provider ${provider} is not supported`);
      })
    : [];
};

// Notice this is only an object, not a full Auth.js instance
export default {
  callbacks: {
    // Note: Data processing order of callback: authorize --> jwt --> session
    // biome-ignore lint/suspicious/useAwait: <explanation>
    async jwt({ token, user }) {
      // ref: https://authjs.dev/guides/extending-the-session#with-jwt
      if (user?.id) {
        token.userId = user?.id;
      }
      return token;
    },
    // biome-ignore lint/suspicious/useAwait: <explanation>
    async session({ session, token, user }) {
      if (session.user) {
        // ref: https://authjs.dev/guides/extending-the-session#with-database
        if (user) {
          session.user.id = user.id;
        } else {
          session.user.id = (token.userId ?? session.user.id) as string;
        }
      }
      return session;
    },
  },
  debug: authEnv.NEXT_AUTH_DEBUG,
  pages: {
    error: '/next-auth/error',
    signIn: '/next-auth/signin',
  },
  providers: getSSOProviders(),
  secret: authEnv.NEXT_AUTH_SECRET,
  trustHost: process.env?.AUTH_TRUST_HOST
    ? process.env.AUTH_TRUST_HOST === 'true'
    : true,
} satisfies NextAuthConfig;
