import type {
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import * as schema from "@repo/core/database/schemas";
import { merge } from "@repo/core/utils/merge";
import { and, eq } from "drizzle-orm";
import type { Adapter, AdapterAccount } from "next-auth/adapters";

import { UserModel } from "@repo/core/database/models/user";
import type { OrgDatabase } from "@repo/core/database/type";
import {
  mapAdapterUserToNewUser,
  mapAuthenticatorQueryResutlToAdapterAuthenticator,
  mapNewUserToAdapterUser,
  partialMapAdapterUserToNewUser,
} from "./utils";

const {
  nextauthAccounts,
  nextauthAuthenticators,
  nextauthSessions,
  nextauthVerificationTokens,
  users,
} = schema;

/**
 * @description OrgNextAuthDbAdapter is implemented to handle the database operations
 * for NextAuth, this function do the same things as `src/app/api/webhooks/clerk/route.ts`
 * @returns {Adapter}
 */
export function OrgNextAuthDbAdapter(serverDB: OrgDatabase): Adapter {
  return {
    async createAuthenticator(authenticator): Promise<AdapterAuthenticator> {
      const result = await serverDB
        .insert(nextauthAuthenticators)
        .values(authenticator)
        .returning()
        .then((res) => res[0] ?? undefined);
      if (!result)
        throw new Error("OrgNextAuthDbAdapter: Failed to create authenticator");
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },
    async createSession(data): Promise<AdapterSession> {
      return serverDB
        .insert(nextauthSessions)
        .values(data)
        .returning()
        .then((res) => res[0] as AdapterSession);
    },
    async createUser(user): Promise<AdapterUser> {
      const { id, name, email, emailVerified, image, providerAccountId } = user;
      // return the user if it already exists
      let existingUser =
        email && typeof email === "string" && email.trim()
          ? await UserModel.findByEmail(serverDB, email)
          : undefined;
      // If the user is not found by email, try to find by providerAccountId
      if (!existingUser && providerAccountId) {
        existingUser = await UserModel.findById(serverDB, providerAccountId);
      }
      if (existingUser) {
        const adapterUser = mapNewUserToAdapterUser(existingUser);
        return adapterUser;
      }

      // create a new user if it does not exist
      // Use id from provider if it exists, otherwise use id assigned by next-auth
      // ref: https://github.com/Orghub/Org-chat/pull/2935
      const uid = providerAccountId ?? id;
      await UserModel.createUser(
        serverDB,
        mapAdapterUserToNewUser({
          email,
          emailVerified: emailVerified ?? null,
          // Use providerAccountId as userid to identify if the user exists in a SSO provider
          id: uid as string,
          image,
          name: name as string,
        })
      );

      // 3. Create an inbox session for the user

      return { ...user, id: uid };
    },
    async createVerificationToken(
      data
    ): Promise<VerificationToken | null | undefined> {
      return serverDB
        .insert(nextauthVerificationTokens)
        .values(data)
        .returning()
        .then((res) => res[0]);
    },
    async deleteSession(
      sessionToken
    ): Promise<AdapterSession | null | undefined> {
      await serverDB
        .delete(nextauthSessions)
        .where(eq(nextauthSessions.sessionToken, sessionToken));
      return;
    },
    async deleteUser(id): Promise<AdapterUser | null | undefined> {
      const user = await UserModel.findById(serverDB, id);
      if (!user) throw new Error("NextAuth: Delete User not found");

      await UserModel.deleteUser(serverDB, id);
      return;
    },

    async getAccount(
      providerAccountId,
      provider
    ): Promise<AdapterAccount | null> {
      return serverDB
        .select()
        .from(nextauthAccounts)
        .where(
          and(
            eq(nextauthAccounts.provider, provider),
            eq(nextauthAccounts.providerAccountId, providerAccountId)
          )
        )
        .then((res) => res[0] ?? null) as Promise<AdapterAccount | null>;
    },

    async getAuthenticator(credentialID): Promise<AdapterAuthenticator | null> {
      const result = await serverDB
        .select()
        .from(nextauthAuthenticators)
        .where(eq(nextauthAuthenticators.credentialID, credentialID))
        .then((res) => res[0] ?? null);
      if (!result)
        throw new Error("OrgNextAuthDbAdapter: Failed to get authenticator");
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },

    async getSessionAndUser(sessionToken): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const result = await serverDB
        .select({
          session: nextauthSessions,
          user: users,
        })
        .from(nextauthSessions)
        .where(eq(nextauthSessions.sessionToken, sessionToken))
        .innerJoin(users, eq(users.id, nextauthSessions.userId))
        .then((res) => (res.length > 0 ? res[0] : null));

      if (!result) return null;
      const adapterUser = mapNewUserToAdapterUser(result.user);
      if (!adapterUser) return null;
      return {
        session: result.session,
        user: adapterUser,
      };
    },

    async getUser(id): Promise<AdapterUser | null> {
      const OrgUser = await UserModel.findById(serverDB, id);
      if (!OrgUser) return null;
      return mapNewUserToAdapterUser(OrgUser);
    },

    async getUserByAccount(account): Promise<AdapterUser | null> {
      const result = await serverDB
        .select({
          account: nextauthAccounts,
          users,
        })
        .from(nextauthAccounts)
        .innerJoin(users, eq(nextauthAccounts.userId, users.id))
        .where(
          and(
            eq(nextauthAccounts.provider, account.provider),
            eq(nextauthAccounts.providerAccountId, account.providerAccountId)
          )
        )
        .then((res) => res[0]);

      return result?.users ? mapNewUserToAdapterUser(result.users) : null;
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      const OrgUser =
        email && typeof email === "string" && email.trim()
          ? await UserModel.findByEmail(serverDB, email)
          : undefined;
      return OrgUser ? mapNewUserToAdapterUser(OrgUser) : null;
    },

    async linkAccount(data): Promise<AdapterAccount | null | undefined> {
      const [account] = await serverDB
        .insert(nextauthAccounts)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .values(data as any)
        .returning();
      if (!account)
        throw new Error("NextAuthAccountModel: Failed to create account");
      // TODO Update type annotation
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return account as any;
    },

    async listAuthenticatorsByUserId(userId): Promise<AdapterAuthenticator[]> {
      const result = await serverDB
        .select()
        .from(nextauthAuthenticators)
        .where(eq(nextauthAuthenticators.userId, userId))
        .then((res) => res);
      if (result.length === 0)
        throw new Error(
          "OrgNextAuthDbAdapter: Failed to get authenticator list"
        );
      return result.map((r) =>
        mapAuthenticatorQueryResutlToAdapterAuthenticator(r)
      );
    },

    // @ts-ignore: The return type is {Promise<void> | Awaitable<AdapterAccount | undefined>}
    async unlinkAccount(account): Promise<AdapterAccount | undefined> {
      await serverDB
        .delete(nextauthAccounts)
        .where(
          and(
            eq(nextauthAccounts.provider, account.provider),
            eq(nextauthAccounts.providerAccountId, account.providerAccountId)
          )
        );
    },

    async updateAuthenticatorCounter(
      credentialID,
      counter
    ): Promise<AdapterAuthenticator> {
      const result = await serverDB
        .update(nextauthAuthenticators)
        .set({ counter })
        .where(eq(nextauthAuthenticators.credentialID, credentialID))
        .returning()
        .then((res) => res[0]);
      if (!result)
        throw new Error(
          "OrgNextAuthDbAdapter: Failed to update authenticator counter"
        );
      return mapAuthenticatorQueryResutlToAdapterAuthenticator(result);
    },

    async updateSession(data): Promise<AdapterSession | null | undefined> {
      const res = await serverDB
        .update(nextauthSessions)
        .set(data)
        .where(eq(nextauthSessions.sessionToken, data.sessionToken))
        .returning();
      return res[0];
    },

    async updateUser(user): Promise<AdapterUser> {
      const OrgUser = await UserModel.findById(serverDB, user?.id);
      if (!OrgUser) throw new Error("NextAuth: User not found");
      const userModel = new UserModel(serverDB, user.id);

      const updatedUser = await userModel.updateUser({
        ...partialMapAdapterUserToNewUser(user),
      });
      if (!updatedUser) throw new Error("NextAuth: Failed to update user");

      // merge new user data with old user data
      const newAdapterUser = mapNewUserToAdapterUser(OrgUser);
      if (!newAdapterUser) {
        throw new Error("NextAuth: Failed to map user data to adapter user");
      }
      return merge(newAdapterUser, user);
    },

    async useVerificationToken(
      identifier_token
    ): Promise<VerificationToken | null> {
      return serverDB
        .delete(nextauthVerificationTokens)
        .where(
          and(
            eq(
              nextauthVerificationTokens.identifier,
              identifier_token.identifier
            ),
            eq(nextauthVerificationTokens.token, identifier_token.token)
          )
        )
        .returning()
        .then((res) => (res.length > 0 && res[0] ? res[0] : null));
    },
  };
}

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      firstName?: string;
    } & DefaultSession["user"];
  }
  interface User {
    providerAccountId?: string;
  }
  /**
   * More types can be extends here
   * ref: https://authjs.dev/getting-started/typescript
   */
}

declare module "@auth/core/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    userId: string;
  }
}
