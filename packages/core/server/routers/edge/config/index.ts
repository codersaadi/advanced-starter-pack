import { getServerFeatureFlagsValue } from '@repo/core/config/featureFlags';
import { publicProcedure, router } from '@repo/core/libs/trpc/edge';
import { getServerGlobalConfig } from '@repo/core/server/globalConfig';
import type { GlobalRuntimeConfig } from '@repo/core/types/server-config';

export const configRouter = router({
  getGlobalConfig: publicProcedure.query(
    async (): Promise<GlobalRuntimeConfig> => {
      const serverConfig = await getServerGlobalConfig();
      const serverFeatureFlags = getServerFeatureFlagsValue();

      return { serverConfig, serverFeatureFlags };
    }
  ),
});
