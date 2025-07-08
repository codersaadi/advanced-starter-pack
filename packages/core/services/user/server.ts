import { lambdaClient } from "@repo/core/libs/trpc/client/lambda";
import type { IUserService } from "./type";

export class ServerService implements IUserService {
  getUserRegistrationDuration: IUserService["getUserRegistrationDuration"] =
    () => {
      return lambdaClient.user.getUserRegistrationDuration.query();
    };

  getUserState: IUserService["getUserState"] = () => {
    return lambdaClient.user.getUserState.query();
  };

  getUserSSOProviders: IUserService["getUserSSOProviders"] = () => {
    return lambdaClient.user.getUserSSOProviders.query();
  };

  unlinkSSOProvider: IUserService["unlinkSSOProvider"] = (
    provider: string,
    providerAccountId: string
  ) => {
    return lambdaClient.user.unlinkSSOProvider.mutate({
      provider,
      providerAccountId,
    });
  };

  makeUserOnboarded = () => {
    return lambdaClient.user.makeUserOnboarded.mutate();
  };

  updateAvatar: IUserService["updateAvatar"] = async (avatar) => {
    // return lambdaClient.user.updateAvatar.mutate(avatar);
  };
}
