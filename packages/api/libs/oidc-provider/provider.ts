import debug from 'debug';
import Provider, {
  type Configuration,
  type KoaContextWithOIDC,
} from 'oidc-provider';
import urlJoin from 'url-join';

import { serverDBEnv } from '@repo/env/db';
import { oidcEnv } from '@repo/env/oidc';

import { UserModel } from '@repo/api/database/models/user';
import type { OrgDatabase } from '@repo/api/database/type';
import env from '@repo/env';
import { DrizzleAdapter } from './adapter';
import { defaultClaims, defaultClients, defaultScopes } from './config';
import { createInteractionPolicy } from './interaction-policy';
const logProvider = debug('Org-oidc:provider'); // <--- Add provider log instance
/**
 * Get JWKS from environment variable
 * This JWKS is a JSON object containing an RS256 private key
 */
const getJWKS = (): object => {
  try {
    const jwksString = oidcEnv.OIDC_JWKS_KEY;

    if (!jwksString) {
      throw new Error(
        'Environment variable OIDC_JWKS_KEY is required. Please use scripts/generate-oidc-jwk.mjs to generate JWKS.'
      );
    }

    // Try parsing JWKS JSON string
    const jwks = JSON.parse(jwksString);

    // Check if JWKS format is valid
    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('Invalid JWKS format: missing or empty keys array');
    }

    // Check if there is an RS256 RSA key
    const hasRS256Key = jwks.keys.some(
      // biome-ignore lint/suspicious/noExplicitAny:
      (key: any) => key.alg === 'RS256' && key.kty === 'RSA'
    );
    if (!hasRS256Key) {
      throw new Error('No RS256 RSA key found in JWKS');
    }

    return jwks;
  } catch (error) {
    console.error('Failed to parse JWKS:', error);
    throw new Error(`OIDC_JWKS_KEY parse error: ${(error as Error).message}`);
  }
};

/**
 * Get cookie encryption keys using KEY_VAULTS_SECRET
 */
const getCookieKeys = () => {
  const key = serverDBEnv.KEY_VAULTS_SECRET;
  if (!key) {
    throw new Error(
      'KEY_VAULTS_SECRET is required for OIDC Provider cookie encryption'
    );
  }
  return [key];
};

/**
 * Create OIDC Provider instance
 * @param db - database instance
 * @returns configured OIDC Provider instance
 */
export const createOIDCProvider = async (
  db: OrgDatabase
): Promise<Provider> => {
  // Get JWKS
  const jwks = getJWKS();

  const cookieKeys = getCookieKeys();

  const configuration: Configuration = {
    // 11. Database adapter
    adapter: DrizzleAdapter.createAdapterFactory(db),

    // 4. Claims definition
    claims: defaultClaims,

    // New: Client-based CORS control logic
    clientBasedCORS(ctx, origin, client) {
      // Check if the client allows this origin
      // Common strategy: allow all origins from registered redirect_uris
      if (!client || !client.redirectUris) {
        logProvider(
          'clientBasedCORS: No client or redirectUris found, denying origin: %s',
          origin
        );
        return false;
      }

      const allowed = client.redirectUris.some((uri) => {
        try {
          // Compare origin (scheme, hostname, port)
          return new URL(uri).origin === origin;
        } catch {
          // Skip if redirect_uri is not a valid URL (e.g. custom protocol)
          return false;
        }
      });

      logProvider(
        'clientBasedCORS check for origin [%s] and client [%s]: %s',
        origin,
        client.clientId,
        allowed ? 'Allowed' : 'Denied'
      );
      return allowed;
    },

    // 1. Client configuration
    clients: defaultClients,

    // 7. Cookie settings
    cookies: {
      keys: cookieKeys,
      long: { path: '/', signed: true },
      short: { path: '/', signed: true },
    },

    // 5. Feature configuration
    features: {
      backchannelLogout: { enabled: true },
      clientCredentials: { enabled: false },
      devInteractions: { enabled: false },
      deviceFlow: { enabled: false },
      introspection: { enabled: true },
      resourceIndicators: { enabled: false },
      revocation: { enabled: true },
      rpInitiatedLogout: { enabled: true },
      userinfo: { enabled: true },
    },

    // 10. Account lookup
    async findAccount(ctx: KoaContextWithOIDC, id: string) {
      logProvider('findAccount called for id: %s', id);

      // Check if there is a pre-stored external account ID
      // @ts-ignore - custom property
      const externalAccountId = ctx.externalAccountId;
      if (externalAccountId) {
        logProvider(
          'Found externalAccountId in context: %s',
          externalAccountId
        );
      }

      // Determine which account ID to look up
      // Priority: 1. externalAccountId 2. ctx.oidc.session?.accountId 3. passed id
      const accountIdToFind =
        externalAccountId || ctx.oidc?.session?.accountId || id;

      logProvider(
        'Attempting to find account with ID: %s (source: %s)',
        accountIdToFind,
        externalAccountId
          ? 'externalAccountId'
          : ctx.oidc?.session?.accountId
            ? 'oidc_session'
            : 'parameter_id'
      );

      if (!accountIdToFind) {
        logProvider(
          'findAccount: No account ID available, returning undefined.'
        );
        return undefined;
      }

      try {
        const user = await UserModel.findById(db, accountIdToFind);
        logProvider(
          'UserModel.findById result for %s: %O',
          accountIdToFind,
          user ? { id: user.id, name: user.name } : null
        );

        if (!user) {
          logProvider('No user found for accountId: %s', accountIdToFind);
          return undefined;
        }

        return {
          accountId: user.id,
          async claims(
            use,
            scope
            // biome-ignore lint/suspicious/noExplicitAny:
          ): Promise<{ [key: string]: any; sub: string }> {
            logProvider(
              'claims function called for user %s with scope: %s',
              user.id,
              scope
            );
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const claims: { [key: string]: any; sub: string } = {
              sub: user.id,
            };

            if (scope.includes('profile')) {
              claims.name =
                user.fullName ||
                user.username ||
                `${user.firstName || ''} ${user.lastName || ''}`.trim();
              claims.picture = user.avatar;
            }

            if (scope.includes('email')) {
              claims.email = user.email;
              claims.email_verified = !!user.emailVerifiedAt;
            }

            logProvider('Returning claims: %O', claims);
            return claims;
          },
        };
      } catch (error) {
        logProvider('Error finding account or generating claims: %O', error);
        console.error('Error finding account:', error);
        return undefined;
      }
    },

    // 9. Interaction policy
    interactions: {
      policy: createInteractionPolicy(),
      url(ctx, interaction) {
        // ---> Add logs <---
        logProvider('interactions.url function called');
        logProvider('Interaction details: %O', interaction);
        const interactionUrl = `/oauth/consent/${interaction.uid}`;
        logProvider('Generated interaction URL: %s', interactionUrl);
        // ---> End logs <---
        return interactionUrl;
      },
    },

    // 6. Key configuration - use RS256 JWKS
    // biome-ignore lint/suspicious/noExplicitAny:
    jwks: jwks as { keys: any[] },

    // 2. PKCE settings
    pkce: {
      required: () => true,
    },

    // 12. Miscellaneous configuration
    renderError: async (ctx, out, error) => {
      ctx.type = 'html';
      ctx.body = `
        <html>
          <head>
            <title>OrgHub OIDC Error</title>
          </head>
          <body>
            <h1>OrgHub OIDC Error</h1>
            <p>${JSON.stringify(error, null, 2)}</p>
            <p>${JSON.stringify(out, null, 2)}</p>
          </body>
        </html>
      `;
    },

    // New: Enable refresh token rotation
    rotateRefreshToken: true,

    routes: {
      authorization: '/oidc/auth',
      end_session: '/oidc/session/end',
      token: '/oidc/token',
    },

    // 3. Scope definition
    scopes: defaultScopes,

    // 8. Token time-to-live
    ttl: {
      AccessToken: 3600, // 1 hour
      AuthorizationCode: 600, // 10 minutes
      DeviceCode: 600, // 10 minutes (if enabled)
      IdToken: 3600, // 1 hour
      Interaction: 3600, // 1 hour
      RefreshToken: 30 * 24 * 60 * 60, // 30 days
      Session: 30 * 24 * 60 * 60, // 30 days
    },
  };

  // Create provider instance
  const baseUrl = urlJoin(env.NEXT_PUBLIC_HOST, '/oidc');

  const provider = new Provider(baseUrl, configuration);
  provider.proxy = true;

  provider.on('server_error', (ctx, err) => {
    logProvider('OIDC Provider Server Error: %O', err);
    console.error('OIDC Provider Error:', err);
  });

  provider.on('authorization.success', (ctx) => {
    logProvider(
      'Authorization successful for client: %s',
      ctx.oidc.client?.clientId
    );
  });

  return provider;
};

export { default as OIDCProvider } from 'oidc-provider';
