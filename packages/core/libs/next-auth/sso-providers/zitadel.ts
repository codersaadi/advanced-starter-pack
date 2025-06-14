import { authEnv } from '@repo/env/auth';
import type { OAuthConfig } from 'next-auth/providers';
import Zitadel from 'next-auth/providers/zitadel';

interface ZitadelProfile extends Record<string, unknown> {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

const provider = {
  id: 'zitadel',
  provider: Zitadel({
    clientId: authEnv.ZITADEL_CLIENT_ID ?? process.env.AUTH_ZITADEL_ID,
    clientSecret:
      authEnv.ZITADEL_CLIENT_SECRET ?? process.env.AUTH_ZITADEL_SECRET,
    issuer: authEnv.ZITADEL_ISSUER ?? process.env.AUTH_ZITADEL_ISSUER,
    authorization: {
      params: {
        scope: 'openid profile email',
      }, // Request org name too
    },
    // Implement the profile callback
    profile(profile: ZitadelProfile /* Use the typed profile */) {
      return {
        id: profile.sub, // MUST map 'sub' to 'id' for NextAuth internal use
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
  }) as OAuthConfig<ZitadelProfile>, // Cast provider for type safety
};

export default provider;
