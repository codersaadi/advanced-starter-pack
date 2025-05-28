import { NextResponse } from "next/server";

import { UserModel } from "@repo/core/database/models/user";
import type { User } from "@repo/core/database/schemas";
import type { OrgDatabase } from "@repo/core/database/type";
import { pino } from "@repo/core/libs/logger";
import { OrgNextAuthDbAdapter } from "@repo/core/libs/next-auth/adapter";

export class NextAuthUserService {
  adapter;
  private readonly db: OrgDatabase;
  constructor(database: OrgDatabase) {
    this.db = database;
    this.adapter = OrgNextAuthDbAdapter(database);
  }

  safeUpdateUser = async (
    {
      providerAccountId,
      provider,
    }: { provider: string; providerAccountId: string },
    data: Partial<User>
  ) => {
    pino.info(
      `updating user "${JSON.stringify({ provider, providerAccountId })}" due to webhook`
    );
    // 1. Find User by account
    // @ts-expect-error: Already impl in `OrgNextAuthDbAdapter`
    const user = await this.adapter.getUserByAccount({
      provider,
      providerAccountId,
    });

    // 2. If found, Update user data from provider
    if (user?.id) {
      const userModel = new UserModel(this.db, user.id);

      // Perform update
      await userModel.updateUser({
        avatar: data?.avatar,
        email: data?.email,
        fullName: data?.fullName,
      });
    } else {
      pino.warn(
        `[${provider}]: Webhooks handler user "${JSON.stringify({ provider, providerAccountId })}" update for "${JSON.stringify(data)}", but no user was found by the providerAccountId.`
      );
    }
    return NextResponse.json(
      { message: "user updated", success: true },
      { status: 200 }
    );
  };
}
