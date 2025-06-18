import { z } from "zod";

export interface OrgUser {
  avatar?: string;
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  latestName?: string | null;
  username?: string | null;
}

export interface UserInitializationState {
  avatar?: string;
  //   canEnablePWAGuide?: boolean;
  //   canEnableTrace?: boolean;
  email?: string;
  firstName?: string;
  fullName?: string;
  isOnboard?: boolean;
  lastName?: string;
  userId?: string;
  username?: string;
}

export const NextAuthAccountSchame = z.object({
  provider: z.string(),
  providerAccountId: z.string(),
});
