import type { NewUser } from '@repo/core/database/schemas';
import type { AdapterAuthenticator, AdapterUser } from 'next-auth/adapters';

export const mapAdapterUserToNewUser = (adapterUser: AdapterUser): NewUser => {
  const { id, email, name, image, emailVerified } = adapterUser;
  return {
    avatar: image,
    email,
    emailVerifiedAt: emailVerified ? new Date(emailVerified) : undefined,
    fullName: name,
    id,
  };
};

export const partialMapAdapterUserToNewUser = ({
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
    fullName: name,
    id,
  };
};

export const mapNewUserToAdapterUser = (newUser: NewUser): AdapterUser => {
  const { id, fullName, email, avatar, emailVerifiedAt } = newUser;
  return {
    // In NewUser, email is nullable
    email: email ?? '',
    emailVerified: emailVerifiedAt ? new Date(emailVerifiedAt) : null,
    id: id as string,
    image: avatar,
    name: fullName,
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
