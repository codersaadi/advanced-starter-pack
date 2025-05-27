import { edgeClient } from '../libs/trpc/client/edge';
import type { GlobalRuntimeConfig } from '../types/server-config';

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
