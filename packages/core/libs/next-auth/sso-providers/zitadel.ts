import { authEnv } from '@repo/env/auth';
import type { OAuthConfig } from 'next-auth/providers';
// In your sso-providers/zitadel.ts (or equivalent)
import Zitadel from 'next-auth/providers/zitadel';

// Define an interface for the expected profile data from Zitadel, including the org claim
interface ZitadelProfile extends Record<string, unknown> {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  'urn:zitadel:iam:user:resourceowner:id'?: string;
  'urn:zitadel:iam:user:resourceowner:name'?: string;
  'urn:zitadel:iam:org:domain'?: string;

  // ...
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
        scope: 'openid profile email urn:zitadel:iam:user:resourceowner',
      }, // Request org name too
    },
    // Implement the profile callback
    profile(profile: ZitadelProfile /* Use the typed profile */) {
      // Extract the org ID using the correct claim name
      const organizationId = profile['urn:zitadel:iam:user:resourceowner:id'];
      const organizationName =
        profile['urn:zitadel:iam:user:resourceowner:name']; // Extract name if requested
      // Return the standard NextAuth user object, adding your custom fields
      return {
        id: profile.sub, // MUST map 'sub' to 'id' for NextAuth internal use
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        // Add your custom data here
        organizationId: organizationId,
        organizationName: organizationName,
      };
    },
  }) as OAuthConfig<ZitadelProfile>, // Cast provider for type safety
};

export default provider;
