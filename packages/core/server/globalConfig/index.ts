import { authEnv } from '@repo/env/auth';
import { fileEnv } from '@repo/env/file';
import { enableNextAuth } from '@repo/shared/config/auth';
import type { GlobalServerConfig } from '@repo/shared/types/server-config';

export const getServerGlobalConfig = async () => {
  const config: GlobalServerConfig = {
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,

    enabledOAuthSSO: enableNextAuth,

    // biome-ignore lint/performance/useTopLevelRegex:
    oAuthSSOProviders: authEnv.NEXT_AUTH_SSO_PROVIDERS.trim().split(/[,，]/),
  };

  return config;
};
