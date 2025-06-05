import type { ClientMetadata } from 'oidc-provider';
/**
 * Default OIDC client configuration
 */
export const defaultClients: ClientMetadata[] = [
  {
    application_type: 'native',
    client_id: 'org-desktop',
    client_name: 'Org Desktop',
    // Only supports Authorization Code Flow
    grant_types: ['authorization_code', 'refresh_token'],

    logo_uri: '',

    // Custom protocol callback registered by the desktop app (uses reverse domain name format)
    post_logout_redirect_uris: ['com.org.desktop://auth/logout/callback'],

    redirect_uris: [
      'com.org.desktop://auth/callback', // it is only a placeholder you should set it as per your endpoint
      'https://oauthdebugger.com/debug',
    ],

    // Supports obtaining access and refresh tokens using Authorization Code Flow
    response_types: ['code'],

    // Marked as a public client, no client secret
    token_endpoint_auth_method: 'none',
  },
];

/**
 * OIDC Scope definitions
 */
export const defaultScopes = [
  'openid', // Required by OIDC
  'profile', // Request user info (name, avatar, etc.)
  'email', // Request user email
  'offline_access', // Request Refresh Token
  'sync:read', // Custom scope: permission to read sync data
  'sync:write', // Custom scope: permission to write sync data
];

/**
 * OIDC Claim definitions (associated with scopes)
 */
export const defaultClaims = {
  email: ['email', 'email_verified'],
  openid: ['sub'],
  // Subject (unique user identifier)
  profile: ['name', 'picture'],
};
