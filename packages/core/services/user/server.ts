import { lambdaClient } from '@repo/core/libs/trpc/client/lamda';
import type { IUserService } from './type';

export class ServerService implements IUserService {
  getUserRegistrationDuration: IUserService['getUserRegistrationDuration'] =
    async () => {
      return lambdaClient.user.getUserRegistrationDuration.query();
    };

  getUserState: IUserService['getUserState'] = async () => {
    return lambdaClient.user.getUserState.query();
  };

  getUserSSOProviders: IUserService['getUserSSOProviders'] = async () => {
    return lambdaClient.user.getUserSSOProviders.query();
  };

  unlinkSSOProvider: IUserService['unlinkSSOProvider'] = async (
    provider: string,
    providerAccountId: string
  ) => {
    return lambdaClient.user.unlinkSSOProvider.mutate({
      provider,
      providerAccountId,
    });
  };

  makeUserOnboarded = async () => {
    return lambdaClient.user.makeUserOnboarded.mutate();
  };

  updateAvatar: IUserService['updateAvatar'] = async (avatar) => {
    // return lambdaClient.user.updateAvatar.mutate(avatar);
  };
}
