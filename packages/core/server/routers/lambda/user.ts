import type { UserJSON } from "@clerk/backend";

import { UserModel, UserNotFoundError } from "@repo/core/database/models/user";
import { ClerkAuth } from "@repo/core/libs/clerk-auth";
import { pino } from "@repo/core/libs/logger";
import { OrgNextAuthDbAdapter } from "@repo/core/libs/next-auth/adapter";
import { authedProcedure, router } from "@repo/core/libs/trpc/lambda";
import { serverDatabase } from "@repo/core/libs/trpc/lambda/middleware";
import { enableClerk } from "@repo/shared/config/auth";
import { isDesktopApp } from "@repo/shared/const/version";
import {
  NextAuthAccountSchame,
  type UserInitializationState,
} from "@repo/shared/types/user";
import { UserService } from "../../services/user";

const userProcedure = authedProcedure
  .use(serverDatabase)
  .use(async ({ ctx, next }) => {
    return next({
      ctx: {
        clerkAuth: new ClerkAuth(),
        userModel: new UserModel(ctx.db, ctx.userId),
      },
    });
  });

export const userRouter = router({
  getUserRegistrationDuration: userProcedure.query(async ({ ctx }) => {
    return ctx.userModel.getUserRegistrationDuration();
  }),

  getUserSSOProviders: userProcedure.query(async ({ ctx }) => {
    return ctx.userModel.getUserSSOProviders();
  }),

  getUserState: userProcedure.query(
    async ({ ctx }): Promise<UserInitializationState> => {
      let state: Awaited<ReturnType<UserModel["getUserState"]>> | undefined;

      // get or create first-time user
      while (!state) {
        try {
          state = await ctx.userModel.getUserState();
        } catch (error) {
          // user not create yet
          if (error instanceof UserNotFoundError) {
            // if in clerk auth mode
            if (enableClerk) {
              const user = await ctx.clerkAuth.getCurrentUser();
              if (user) {
                const userService = new UserService(ctx.db);

                await userService.createUser(user.id, {
                  created_at: user.createdAt,
                  email_addresses: user.emailAddresses.map((e) => ({
                    email_address: e.emailAddress,
                    id: e.id,
                  })),
                  first_name: user.firstName,
                  id: user.id,
                  image_url: user.imageUrl,
                  last_name: user.lastName,
                  phone_numbers: user.phoneNumbers.map((e) => ({
                    id: e.id,
                    phone_number: e.phoneNumber,
                  })),
                  primary_email_address_id: user.primaryEmailAddressId,
                  primary_phone_number_id: user.primaryPhoneNumberId,
                  username: user.username,
                } as UserJSON);

                continue;
              }
            }

            // if in desktop mode, make sure desktop user exist
            else if (isDesktopApp) {
              await UserModel.makeSureUserExist(ctx.db, ctx.userId);
              pino.info("create desktop user");
              continue;
            }
          }

          console.error("getUserState:", error);
          throw error;
        }
      }

      return {
        avatar: state.avatar,
        email: state.email,
        firstName: state.firstName,

        fullName: state.fullName,

        isOnboard: state.isOnboarded || true,
        lastName: state.lastName,
        userId: ctx.userId,
        username: state.username,
      } satisfies UserInitializationState;
    }
  ),

  makeUserOnboarded: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.updateUser({ isOnboarded: true });
  }),

  unlinkSSOProvider: userProcedure
    .input(NextAuthAccountSchame)
    .mutation(async ({ ctx, input }) => {
      const { provider, providerAccountId } = input;
      const nextAuthDbAdapter = OrgNextAuthDbAdapter(ctx.db);
      if (
        nextAuthDbAdapter?.unlinkAccount &&
        typeof nextAuthDbAdapter.unlinkAccount === "function" &&
        nextAuthDbAdapter?.getAccount &&
        typeof nextAuthDbAdapter.getAccount === "function"
      ) {
        const account = await nextAuthDbAdapter.getAccount(
          providerAccountId,
          provider
        );
        // The userId can either get from ctx.nextAuth?.id or ctx.userId
        if (!account || account.userId !== ctx.userId)
          throw new Error("The account does not exist");
        await nextAuthDbAdapter.unlinkAccount({
          provider,
          providerAccountId,
        });
      } else {
        throw new Error(
          "The method in OrgNextAuthDbAdapter `unlinkAccount` is not implemented"
        );
      }
    }),
});

export type UserRouter = typeof userRouter;
