import { authEnv } from '@repo/env/auth';
export const ORG_AUTH_HEADER = 'X-org-auth';
export const enableClerk = authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH;
export const enableNextAuth = authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH;
export const enableAuth = enableClerk || enableNextAuth || false;
export const OAUTH_AUTHORIZED = 'X-oauth-authorized';

export const JWT_SECRET_KEY = 'your-jwt-secret';
export const NON_HTTP_PREFIX = 'http_nosafe';
/* eslint-disable typescript-sort-keys/interface */
export interface JWTPayload {
  /**
   * password
   */
  accessCode?: string;
  /**
   * Represents the user's API key
   *
   * If provider need multi keys like bedrock,
   * this will be used as the checker whether to use frontend key
   */
  apiKey?: string;
  /**
   * Represents the endpoint of provider
   */
  baseURL?: string;

  azureApiVersion?: string;

  awsAccessKeyId?: string;
  awsRegion?: string;
  awsSecretAccessKey?: string;
  awsSessionToken?: string;

  cloudflareBaseURLOrAccountID?: string;

  /**
   * user id
   * in client db mode it's a uuid
   * in server db mode it's a user id
   */
  userId?: string;
}
/* eslint-enable */
