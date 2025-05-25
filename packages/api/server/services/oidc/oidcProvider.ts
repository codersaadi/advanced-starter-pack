import { db } from '@repo/api/database/server';
import {
  type OIDCProvider,
  createOIDCProvider,
} from '@repo/api/libs/oidc-provider/provider';
import { oidcEnv } from '@repo/env/oidc';

/**
 * OIDC Provider
 */
let provider: OIDCProvider;

/**
 *OIDC Provider
 * @returns OIDC Provider
 */
export const getOIDCProvider = async (): Promise<OIDCProvider> => {
  if (!provider) {
    if (!oidcEnv.ENABLE_OIDC) {
      throw new Error('OIDC is not enabled. Set ENABLE_OIDC=1 to enable it.');
    }

    provider = await createOIDCProvider(db);
  }

  return provider;
};
