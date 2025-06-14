import Google from 'next-auth/providers/google';
import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'google',
  provider: Google({
    ...CommonProviderConfig,
    authorization: {
      params: {
        prompt: 'consent',
        access_type: 'offline',
        response_type: 'code',
        scope: 'openid email profile', // <--- ADD THIS LINE
      },
    },
    profile: (profile) => {
      return {
        email: profile.email,
        id: profile.sub.toString(),
        image: profile.picture,
        name: profile.name,
        providerAccountId: profile.sub.toString(),
      };
    },
  }),
};

export default provider;
