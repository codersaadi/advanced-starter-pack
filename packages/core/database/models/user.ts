import { today } from '@repo/shared/utils/time';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import type { AdapterAccount } from 'next-auth/adapters';

import { type NewUser, type User, nextauthAccounts, users } from '../schemas';
import type { OrgDatabase } from '../type';

export class UserNotFoundError extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'user not found' });
  }
}

export class UserModel {
  private userId: string;
  private db: OrgDatabase;

  constructor(db: OrgDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  getUserRegistrationDuration = async (): Promise<{
    createdAt: string;
    duration: number;
    updatedAt: string;
  }> => {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, this.userId),
    });
    if (!user)
      return {
        createdAt: today().format('YYYY-MM-DD'),
        duration: 1,
        updatedAt: today().format('YYYY-MM-DD'),
      };

    return {
      createdAt: dayjs(user.createdAt).format('YYYY-MM-DD'),
      duration: dayjs().diff(dayjs(user.createdAt), 'day') + 1,
      updatedAt: today().format('YYYY-MM-DD'),
    };
  };
  getUserState = async () => {
    const result = await this.db
      .select({
        avatar: users.avatar,
        email: users.email,
        firstName: users.firstName,
        fullName: users.fullName,
        isOnboarded: users.isOnboarded,
        lastName: users.lastName,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, this.userId));

    if (!result || !result[0]) {
      throw new UserNotFoundError();
    }

    const state = result[0];

    return {
      avatar: state.avatar || undefined,
      email: state.email || undefined,
      firstName: state.firstName || undefined,
      fullName: state.fullName || undefined,
      isOnboarded: state.isOnboarded,
      lastName: state.lastName || undefined,
      userId: this.userId,
      username: state.username || undefined,
    };
  };

  getUserSSOProviders = async () => {
    const result = await this.db
      .select({
        expiresAt: nextauthAccounts.expires_at,
        provider: nextauthAccounts.provider,
        providerAccountId: nextauthAccounts.providerAccountId,
        scope: nextauthAccounts.scope,
        type: nextauthAccounts.type,
        userId: nextauthAccounts.userId,
      })
      .from(nextauthAccounts)
      .where(eq(nextauthAccounts.userId, this.userId));
    return result as unknown as AdapterAccount[];
  };

  updateUser = async (value: Partial<User>) => {
    return await this.db
      .update(users)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(users.id, this.userId));
  };
  // Static method
  static makeSureUserExist = async (db: OrgDatabase, userId: string) => {
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
  };

  static createUser = async (db: OrgDatabase, params: NewUser) => {
    // if user already exists, skip creation
    if (params.id) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, params.id),
      });
      if (user) return { duplicate: true };
    }

    const [user] = await db
      .insert(users)
      .values({ ...params })
      .returning();

    return { duplicate: false, user };
  };

  static deleteUser = async (db: OrgDatabase, id: string) => {
    return await db.delete(users).where(eq(users.id, id));
  };

  static findById = async (db: OrgDatabase, id: string) => {
    return await db.query.users.findFirst({ where: eq(users.id, id) });
  };

  static findByEmail = async (db: OrgDatabase, email: string) => {
    return await db.query.users.findFirst({ where: eq(users.email, email) });
  };
}
