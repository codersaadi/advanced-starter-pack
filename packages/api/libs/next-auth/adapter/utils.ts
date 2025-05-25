import type { NewUser } from '@repo/api/database/schemas';
import type { AdapterAuthenticator, AdapterUser } from 'next-auth/adapters';

export const mapAdapterUserToOrgUser = (adapterUser: AdapterUser): NewUser => {
  const { id, email, name, image, emailVerified } = adapterUser;
  return {
    avatar: image,
    email,
    emailVerifiedAt: emailVerified ? new Date(emailVerified) : undefined,
    name: name,
    id,
  };
};

export const partialMapAdapterUserToOrgUser = ({
  id,
  name,
  email,
  image,
  emailVerified,
}: Partial<AdapterUser>): Partial<NewUser> => {
  return {
    avatar: image,
    email,
    emailVerifiedAt: emailVerified ? new Date(emailVerified) : undefined,
    name: name,

    id,
  };
};

export const mapOrgUserToAdapterUser = (
  OrgUser: NewUser & { id: string }
): AdapterUser => {
  const { id, name, email, avatar, emailVerifiedAt } = OrgUser;
  return {
    // In OrgUser, email is nullable
    email: email ?? '',
    emailVerified: emailVerifiedAt ? new Date(emailVerifiedAt) : null,
    id: id,
    image: avatar,
    name: name,
  };
};

type AuthenticatorQueryResult = {
  counter: number;
  credentialBackedUp: boolean;
  credentialDeviceType: string;
  credentialID: string;
  credentialPublicKey: string;
  providerAccountId: string;
  transports: string | null;
  userId: string;
};

export const mapAuthenticatorQueryResutlToAdapterAuthenticator = (
  authenticator: AuthenticatorQueryResult
): AdapterAuthenticator => {
  return {
    ...authenticator,
    transports: authenticator?.transports ?? undefined,
  };
};
