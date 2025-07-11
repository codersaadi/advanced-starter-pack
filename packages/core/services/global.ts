import type { GlobalRuntimeConfig } from '@repo/shared/types/server-config';
import {edgeClient} from '@repo/core/libs/trpc/client/edge'
const VERSION_URL = 'https://registry.npmmirror.com/....';

class GlobalService {
  /**
   * get latest version from npm
   */
  getLatestVersion = async (): Promise<string> => {
    const res = await fetch(VERSION_URL);
    const data = await res.json();

    return data.version;
  };

  getGlobalConfig = async (): Promise<GlobalRuntimeConfig> => {
    return edgeClient.config.getGlobalConfig.query();
  };
}

export const globalService = new GlobalService();
