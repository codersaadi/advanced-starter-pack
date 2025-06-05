import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { createContextForInteractionDetails } from '@repo/core/libs/oidc-provider/http-adapter';
import type { OIDCProvider } from '@repo/core/libs/oidc-provider/provider';

import { getServerDB } from '@repo/core/database/server';
import { getOIDCProvider } from './oidcProvider';

const log = debug('org-oidc:service');

export class OIDCService {
  private provider: OIDCProvider;

  constructor(provider: OIDCProvider) {
    this.provider = provider;
  }
  static async initialize() {
    const db = await getServerDB();
    const provider = await getOIDCProvider(db);

    return new OIDCService(provider);
  }

  async validateToken(token: string) {
    try {
      log('Validating access token using AccessToken.find');

      const accessToken = await this.provider.AccessToken.find(token);

      if (!accessToken) {
        log('Access token not found, expired, or consumed');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Access token 无效、已过期或已被使用',
        });
      }

      const userId = accessToken.accountId;
      const clientId = accessToken.clientId;
      const tokenData = {
        client_id: clientId,
        exp: accessToken.exp,
        iat: accessToken.iat,
        jti: accessToken.jti,
        scope: accessToken.scope,
        sub: userId,
      };

      if (!userId) {
        log('Access token does not contain user ID (accountId)');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Access token 中未包含用户 ID',
        });
      }

      log('Access token validated successfully for user: %s', userId);
      return {
        accessToken,
        tokenData,
        userId,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      log('Error validating access token with AccessToken.find: %O', error);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `OIDC Crash: ${(error as Error).message}`,
      });
    }
  }

  async getInteractionDetails(uid: string) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionDetails(req, res);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async getInteractionResult(uid: string, result: any) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionResult(req, res, result);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async finishInteraction(uid: string, result: any) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionFinished(req, res, result, {
      mergeWithLastSubmission: true,
    });
  }

  async findOrCreateGrants(
    accountId: string,
    clientId: string,
    existingGrantId?: string
  ) {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let grant;
    if (existingGrantId) {
      grant = await this.provider.Grant.find(existingGrantId);
      log('Found existing grantId: %s', existingGrantId);
    }

    if (!grant) {
      grant = new this.provider.Grant({
        accountId: accountId,
        clientId: clientId,
      });
      log(
        'Created new Grant for account %s and client %s',
        accountId,
        clientId
      );
    }

    return grant;
  }

  async getClientMetadata(clientId: string) {
    const client = await this.provider.Client.find(clientId);
    return client?.metadata();
  }
}

export { getOIDCProvider } from './oidcProvider';
