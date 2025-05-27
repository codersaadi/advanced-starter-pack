import { z } from 'zod';

export interface OrgUser {
  avatar?: string;
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  latestName?: string | null;
  username?: string | null;
}

// export const UserGuideSchema = z.object({
//   /**
//    * Move the settings button to the avatar dropdown
//    */
//   moveSettingsToAvatar: z.boolean().optional(),
// });

// export type UserGuide = z.infer<typeof UserGuideSchema>;

// export interface UserPreference {
//   guide?: UserGuide;
//   hideSyncAlert?: boolean;
//   telemetry: boolean | null;
//   /**
//    * whether to use cmd + enter to send message
//    */
//   useCmdEnterToSend?: boolean;
// }

export interface UserInitializationState {
  avatar?: string;
  //   canEnablePWAGuide?: boolean;
  //   canEnableTrace?: boolean;
  email?: string;
  firstName?: string;
  fullName?: string;
  isOnboard?: boolean;
  lastName?: string;
  // preference: UserPreference;
  userId?: string;
  username?: string;
}

export const NextAuthAccountSchame = z.object({
  provider: z.string(),
  providerAccountId: z.string(),
});
