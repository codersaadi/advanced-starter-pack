import { enableNextAuth } from '@repo/core/config/auth';
import type { GlobalServerConfig } from '@repo/core/types/server-config';
import { authEnv } from '@repo/env/auth';
import { fileEnv } from '@repo/env/file';

export const getServerGlobalConfig = async () => {
  const config: GlobalServerConfig = {
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,

    enabledOAuthSSO: enableNextAuth,

    oAuthSSOProviders: authEnv.NEXT_AUTH_SSO_PROVIDERS.trim().split(/[,，]/),
  };

  return config;
};
