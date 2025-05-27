import type { IFeatureFlags } from '../config/featureFlags';

export interface GlobalServerConfig {
  enableUploadFileToServer?: boolean;
  enabledAccessCode?: boolean;
  /**
   * @deprecated
   */
  enabledOAuthSSO?: boolean;

  oAuthSSOProviders?: string[];
}

export interface GlobalRuntimeConfig {
  serverConfig: GlobalServerConfig;
  serverFeatureFlags: IFeatureFlags;
}
