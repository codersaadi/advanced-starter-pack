import { clientDB } from '@repo/core/database/client/db';
import { UserModel } from '@repo/core/database/models/user';
import { users } from '@repo/core/database/schemas';
import type { OrgDatabase } from '@repo/core/database/type';
import { BaseClientService } from '../baseClientService';
import type { IUserService } from './type';

export class ClientService extends BaseClientService implements IUserService {
  private get userModel(): UserModel {
    return new UserModel(clientDB as OrgDatabase, this.userId);
  }

  getUserRegistrationDuration: IUserService['getUserRegistrationDuration'] =
    async () => {
      return await this.userModel.getUserRegistrationDuration();
    };

  getUserState: IUserService['getUserState'] = async () => {
    // if user not exist in the db, create one to make sure the user exist
    await this.makeSureUserExist();

    const state = await this.userModel.getUserState();

    return state;
  };

  getUserSSOProviders: IUserService['getUserSSOProviders'] = async () => {
    // Account not exist on next-auth in client mode, no need to implement this method
    return [];
  };

  unlinkSSOProvider: IUserService['unlinkSSOProvider'] = async () => {
    // Account not exist on next-auth in client mode, no need to implement this method
  };

  updateAvatar = async (avatar: string) => {
    await this.userModel.updateUser({ avatar });
  };

  makeSureUserExist = async () => {
    const existUsers = await clientDB.query.users.findMany();

    let user: { id: string };
    if (existUsers.length === 0) {
      const result = await clientDB
        .insert(users)
        .values({ id: this.userId })
        .returning();
      if (!result[0]) throw new Error('Failed to create user');
      user = result[0];
    } else {
      if (!existUsers[0]) throw new Error('User not found');
      user = { id: existUsers[0].id };
    }

    return user;
  };
}
