import debug from 'debug';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import {
  oidcAccessTokens,
  oidcAuthorizationCodes,
  oidcClients,
  oidcDeviceCodes,
  oidcGrants,
  oidcInteractions,
  oidcRefreshTokens,
  oidcSessions,
} from '@repo/api/database/schemas/oidc';
import type { OrgDatabase } from '@repo/api/database/type';
// biome-ignore lint/suspicious/noExplicitAny:
type AnyType = any;
// Create adapter logger namespace
const log = debug('org-oidc:adapter');

class OIDCAdapter {
  private db: OrgDatabase;
  private name: string;

  constructor(name: string, db: OrgDatabase) {
    log('[%s] Constructor called with name: %s', name, name);

    this.name = name;
    this.db = db;
  }

  /**
   * Get the corresponding database table based on model name
   */
  private getTable() {
    log('Getting table for model: %s', this.name);
    switch (this.name) {
      case 'AccessToken': {
        return oidcAccessTokens;
      }
      case 'AuthorizationCode': {
        return oidcAuthorizationCodes;
      }
      case 'RefreshToken': {
        return oidcRefreshTokens;
      }
      case 'DeviceCode': {
        return oidcDeviceCodes;
      }
      case 'ClientCredentials': {
        return oidcAccessTokens;
      } // Use same table
      case 'Client': {
        return oidcClients;
      }
      case 'InitialAccessToken': {
        return oidcAccessTokens;
      } // Use same table
      case 'RegistrationAccessToken': {
        return oidcAccessTokens;
      } // Use same table
      case 'Interaction': {
        return oidcInteractions;
      }
      case 'ReplayDetection': {
        log('ReplayDetection - no persistent storage needed');
        return null;
      } // No persistence needed
      case 'PushedAuthorizationRequest': {
        return oidcAuthorizationCodes;
      } // Use same table
      case 'Grant': {
        return oidcGrants;
      }
      case 'Session': {
        return oidcSessions;
      }
      default: {
        const error = `Unsupported model: ${this.name}`;
        log('ERROR: %s', error);
        throw new Error(error);
      }
    }
  }

  /**
   * Create model instance
   */
  async upsert(id: string, payload: AnyType, expiresIn: number): Promise<void> {
    log(
      '[%s] upsert called - id: %s, expiresIn: %d',
      this.name,
      id,
      `${expiresIn}s`
    );
    log('[%s] payload: %O', this.name, payload);

    const table = this.getTable();
    if (!table) {
      log('[%s] upsert - No table for model, returning early', this.name);
      return;
    }

    if (this.name === 'Client') {
      // Special handling for Client model, use input data directly
      log('[Client] Upserting client record');
      try {
        await this.db
          .insert(table)
          .values({
            applicationType: payload.application_type,
            clientSecret: payload.client_secret,
            clientUri: payload.client_uri,
            description: payload.description,
            grants: payload.grant_types || [],
            id,
            isFirstParty: !!payload.isFirstParty,
            logoUri: payload.logo_uri,
            name: payload.name,
            policyUri: payload.policy_uri,
            redirectUris: payload.redirectUris || [],
            responseTypes: payload.response_types || [],
            scopes: Array.isArray(payload.scopes)
              ? payload.scopes
              : payload.scope
                ? payload.scope.split(' ')
                : [],
            tokenEndpointAuthMethod: payload.token_endpoint_auth_method,
            tosUri: payload.tos_uri,
          } as AnyType)
          .onConflictDoUpdate({
            set: {
              applicationType: payload.application_type,
              clientSecret: payload.clientSecret,
              clientUri: payload.client_uri,
              description: payload.description,
              grants: payload.grant_types || [],
              isFirstParty: !!payload.isFirstParty,
              logoUri: payload.logo_uri,
              name: payload.name,
              policyUri: payload.policy_uri,
              redirectUris: payload.redirectUris || [],
              responseTypes: payload.response_types || [],
              scopes: payload.scope ? payload.scope.split(' ') : [],
              tokenEndpointAuthMethod: payload.token_endpoint_auth_method,
              tosUri: payload.tos_uri,
            } as AnyType,
            target: (table as AnyType).id,
          });
        log('[Client] Successfully upserted client: %s', id);
      } catch (error) {
        log('[Client] ERROR upserting client: %O', error);
        throw error;
      }
      return;
    }

    // For other models, save complete data and metadata
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;
    log(
      '[%s] expiresAt set to: %s',
      this.name,
      expiresAt ? expiresAt.toISOString() : 'undefined'
    );

    const record: Record<string, AnyType> = {
      data: payload,
      expiresAt,
      id,
    };

    // Add specific fields
    if (payload.accountId) {
      record.userId = payload.accountId;
      log('[%s] Setting userId: %s', this.name, payload.accountId);
    } else {
      try {
        const { getUserAuth } = await import('@repo/api/utils/server/auth');
        try {
          const { userId } = await getUserAuth();
          if (userId) {
            payload.accountId = userId;
            record.userId = userId;
            log('[%s] Setting userId from auth context: %s', this.name, userId);
          }
        } catch (authError) {
          log(
            '[%s] Error getting userId from auth context: %O',
            this.name,
            authError
          );
          // If getting userId fails, continue without throwing error
        }
      } catch (importError) {
        log('[%s] Error importing auth module: %O', this.name, importError);
        // If module import fails, continue without throwing error
      }
    }

    if (payload.clientId) {
      record.clientId = payload.clientId;
      log('[%s] Setting clientId: %s', this.name, payload.clientId);
    }

    if (payload.grantId) {
      record.grantId = payload.grantId;
      log('[%s] Setting grantId: %s', this.name, payload.grantId);
    }

    if (this.name === 'DeviceCode' && payload.userCode) {
      record.userCode = payload.userCode;
      log('[DeviceCode] Setting userCode: %s', payload.userCode);
    }

    try {
      log('[%s] Executing upsert DB operation', this.name);

      await this.db
        .insert(table)
        .values(record as AnyType)
        .onConflictDoUpdate({
          set: {
            data: payload,
            expiresAt,
            ...(payload.accountId ? { userId: payload.accountId } : {}),
            ...(payload.clientId ? { clientId: payload.clientId } : {}),
            ...(payload.grantId ? { grantId: payload.grantId } : {}),
            ...(this.name === 'DeviceCode' && payload.userCode
              ? { userCode: payload.userCode }
              : {}),
          } as AnyType,
          target: (table as AnyType).id,
        });
      log('[%s] Successfully upserted record: %s', this.name, id);
    } catch (error) {
      log('[%s] ERROR upserting record: %O', this.name, error);
      console.error(`[OIDC Adapter] Error upserting ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Find model instance
   */
  async find(id: string): Promise<AnyType> {
    log('[%s] find called - id: %s', this.name, id);

    const table = this.getTable();
    if (!table) {
      log('[%s] find - No table for model, returning undefined', this.name);
      return undefined;
    }

    try {
      log('[%s] Executing find DB query', this.name);
      const result = await this.db
        .select()
        .from(table)
        .where(eq((table as AnyType).id, id))
        .limit(1);

      log('[%s] Find query results: %O', this.name, result);

      if (!result || result.length === 0) {
        log('[%s] No record found for id: %s', this.name, id);
        return undefined;
      }

      const model = result[0] as AnyType;

      // Special handling for Client model
      if (this.name === 'Client') {
        log('[Client] Converting client record to expected format');
        return {
          application_type: model.applicationType,
          client_id: model.id,
          client_secret: model.clientSecret,
          client_uri: model.clientUri,
          grant_types: model.grants,
          isFirstParty: model.isFirstParty,
          logo_uri: model.logoUri,
          policy_uri: model.policyUri,
          redirect_uris: model.redirectUris,
          response_types: model.responseTypes,
          scope: model.scopes.join(' '),
          token_endpoint_auth_method: model.tokenEndpointAuthMethod,
          tos_uri: model.tosUri,
        };
      }

      // If record is expired, return undefined
      if (model.expiresAt && new Date() > new Date(model.expiresAt)) {
        log(
          '[%s] Record expired (expiresAt: %s), returning undefined',
          this.name,
          model.expiresAt
        );
        return undefined;
      }

      // If record is already consumed, return undefined
      if (model.consumedAt) {
        log(
          '[%s] Record already consumed (consumedAt: %s), returning undefined',
          this.name,
          model.consumedAt
        );
        return undefined;
      }

      log('[%s] Successfully found and returning record data', this.name);
      return model.data;
    } catch (error) {
      log('[%s] ERROR finding record: %O', this.name, error);
      console.error(`[OIDC Adapter] Error finding ${this.name}:`, error);
      return undefined;
    }
  }

  /**
   * Find model instance by userCode (only for device flow)
   */
  async findByUserCode(userCode: string): Promise<AnyType> {
    log('[DeviceCode] findByUserCode called - userCode: %s', userCode);

    if (this.name !== 'DeviceCode') {
      const error = 'findByUserCode can only be used with DeviceCode model';
      log('ERROR: %s', error);
      throw new Error(error);
    }

    try {
      log('[DeviceCode] Executing findByUserCode DB query');
      const result = await this.db
        .select()
        .from(oidcDeviceCodes)
        .where(eq(oidcDeviceCodes.userCode, userCode))
        .limit(1);

      log('[DeviceCode] findByUserCode query results: %O', result);

      if (!result || result.length === 0) {
        log('[DeviceCode] No record found for userCode: %s', userCode);
        return undefined;
      }

      const model = result[0];

      // If record is expired or consumed, return undefined
      if (model?.expiresAt && new Date() > new Date(model.expiresAt)) {
        log(
          '[DeviceCode] Record expired (expiresAt: %s), returning undefined',
          model.expiresAt
        );
        return undefined;
      }

      if (model?.consumedAt) {
        log(
          '[DeviceCode] Record already consumed (consumedAt: %s), returning undefined',
          model.consumedAt
        );
        return undefined;
      }

      log(
        '[DeviceCode] Successfully found and returning record data by userCode'
      );
      return model?.data;
    } catch (error) {
      log('[DeviceCode] ERROR finding record by userCode: %O', error);
      console.error(
        '[OIDC Adapter] Error finding DeviceCode by userCode:',
        error
      );
      return undefined;
    }
  }

  /**
   * Find interaction instance by uid
   */
  async findByUid(uid: string): Promise<AnyType> {
    log('[Interaction] findByUid called - uid: %s', uid);
    const table = this.getTable();
    if (this.name === 'Session') {
      try {
        const jsonbUidEq = sql`${(table as AnyType).data}->>'uid' = ${uid}`;
        // @ts-ignore
        const results = await this.db
          .select()
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          .from(table!)
          .where(jsonbUidEq)
          .limit(1);
        log('[Session] Find by data.uid query results: %O', results);

        if (!results || results.length === 0) {
          log('[Session] No record found by data.uid: %s', uid);
          return undefined;
        }

        const model = results[0] as AnyType;
        // Check expiration
        if (model.expiresAt && model.expiresAt < new Date()) {
          log('[Session] Record found by data.uid but expired: %s', uid);
          await this.destroy(model.id); // Still use primary key id for deletion
          return undefined;
        }

        log(
          '[Session] Successfully found by data.uid and returning record data for uid %s',
          uid
        );
        return model.data;
      } catch (error) {
        log(
          '[Session] ERROR during findSessionByUid operation for %s: %O',
          uid,
          error
        );
        console.error('[OIDC Adapter] Error finding Session by uid:', error);
      }
    }
    // Reuse find method implementation
    log('[Interaction] Delegating to find() method');
    return this.find(uid);
  }

  /**
   * Find session by user ID
   * Used for session pre-synchronization
   */
  async findSessionByUserId(userId: string): Promise<AnyType> {
    log('[%s] findSessionByUserId called - userId: %s', this.name, userId);

    if (this.name !== 'Session') {
      log(
        '[%s] findSessionByUserId - Not a Session model, returning undefined',
        this.name
      );
      return undefined;
    }

    const table = this.getTable();
    if (!table) {
      log(
        '[%s] findSessionByUserId - No table for model, returning undefined',
        this.name
      );
      return undefined;
    }

    try {
      log('[%s] Executing findSessionByUserId DB query', this.name);
      const result = await this.db
        .select()
        .from(table)
        .where(eq((table as AnyType).userId, userId))
        .limit(1);

      log('[%s] findSessionByUserId query results: %O', this.name, result);

      if (!result || result.length === 0) {
        log('[%s] No session found for userId: %s', this.name, userId);
        return undefined;
      }

      return (result[0] as { data: AnyType }).data;
    } catch (error) {
      log('[%s] ERROR finding session by userId: %O', this.name, error);
      console.error('[OIDC Adapter] Error finding session by userId:', error);
      return undefined;
    }
  }

  /**
   * Destroy model instance
   */
  async destroy(id: string): Promise<void> {
    log('[%s] destroy called - id: %s', this.name, id);

    const table = this.getTable();
    if (!table) {
      log('[%s] destroy - No table for model, returning early', this.name);
      return;
    }

    try {
      log('[%s] Executing destroy DB operation', this.name);
      await this.db.delete(table).where(eq((table as AnyType).id, id));
      log('[%s] Successfully destroyed record: %s', this.name, id);
    } catch (error) {
      log('[%s] ERROR destroying record: %O', this.name, error);
      console.error(`[OIDC Adapter] Error destroying ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Mark model instance as consumed
   */
  async consume(id: string): Promise<void> {
    log('[%s] consume called - id: %s', this.name, id);

    const table = this.getTable();
    if (!table) {
      log('[%s] consume - No table for model, returning early', this.name);
      return;
    }

    try {
      log('[%s] Executing consume DB operation', this.name);
      await this.db
        .update(table)
        // @ts-ignore
        .set({ consumedAt: new Date() })
        .where(eq((table as AnyType).id, id));
      log('[%s] Successfully consumed record: %s', this.name, id);
    } catch (error) {
      log('[%s] ERROR consuming record: %O', this.name, error);
      console.error(`[OIDC Adapter] Error consuming ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Revoke all related model instances by grantId
   */
  async revokeByGrantId(grantId: string): Promise<void> {
    log('[%s] revokeByGrantId called - grantId: %s', this.name, grantId);

    // Grants themselves don't need to be revoked by grantId
    if (this.name === 'Grant') {
      log(
        '[Grant] revokeByGrantId skipped for Grant model, as it is the grant itself'
      );
      return;
    }

    // Pre-check if model name is valid, even if table won't be used directly later
    this.getTable();

    try {
      log(
        '[%s] Starting transaction for revokeByGrantId operations',
        this.name
      );

      // Use transaction to delete all records with grantId, ensuring atomicity
      await this.db.transaction(async (tx) => {
        // All tables that might contain grantId
        const tables = [
          oidcAccessTokens,
          oidcAuthorizationCodes,
          oidcRefreshTokens,
          oidcDeviceCodes,
        ];

        for (const table of tables) {
          if ('grantId' in table) {
            log('[%s] Revoking %s records by grantId: %s', this.name, grantId);
            await tx
              .delete(table)
              .where(eq((table as AnyType).grantId, grantId));
          }
        }
      });

      log(
        '[%s] Successfully completed transaction for revoking all records by grantId: %s',
        this.name,
        grantId
      );
    } catch (error) {
      log('[%s] ERROR in revokeByGrantId transaction: %O', this.name, error);
      console.error(
        '[OIDC Adapter] Error in revokeByGrantId transaction:',
        error
      );
      throw error;
    }
  }

  /**
   * Create adapter factory
   */
  static createAdapterFactory = (db: OrgDatabase) => {
    log('Creating adapter factory with database instance');
    return (name: string) => new OIDCAdapter(name, db);
  };
}

export { OIDCAdapter as DrizzleAdapter };
