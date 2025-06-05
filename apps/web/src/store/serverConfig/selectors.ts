import { mapFeatureFlagsEnvToState } from '@repo/shared/config/featureFlags';

import type { ServerConfigStore } from './store';

export const featureFlagsSelectors = (s: ServerConfigStore) =>
  mapFeatureFlagsEnvToState(s.featureFlags);

export const serverConfigSelectors = {
  enableUploadFileToServer: (s: ServerConfigStore) =>
    s.serverConfig.enableUploadFileToServer,
  enabledAccessCode: (s: ServerConfigStore) =>
    !!s.serverConfig?.enabledAccessCode,

  isMobile: (s: ServerConfigStore) => s.isMobile || false,
  oAuthSSOProviders: (s: ServerConfigStore) => s.serverConfig.oAuthSSOProviders,
};
