/* eslint-disable sort-keys-fix/sort-keys-fix */
import { z } from 'zod';

export const FeatureFlagsSchema = z.object({
  // settings
  changelog: z.boolean().optional(),

  clerk_sign_up: z.boolean().optional(),

  market: z.boolean().optional(),

  // internal flag
  cloud_promotion: z.boolean().optional(),

  // the flags below can only be used with commercial license
  // if you want to use it in the commercial usage
  // please contact us for more information: hello@lobehub.com
  commercial_hide_github: z.boolean().optional(),
  commercial_hide_docs: z.boolean().optional(),
});

export type IFeatureFlags = z.infer<typeof FeatureFlagsSchema>;

export const DEFAULT_FEATURE_FLAGS: IFeatureFlags = {
  clerk_sign_up: true,

  cloud_promotion: false,
  changelog: true,

  // the flags below can only be used with commercial license
  // if you want to use it in the commercial usage
  // please contact us for more information: hello@lobehub.com
  commercial_hide_github: false,
  commercial_hide_docs: false,
};

export const mapFeatureFlagsEnvToState = (config: IFeatureFlags) => {
  return {
    showChangelog: config.changelog,

    enableClerkSignUp: config.clerk_sign_up,

    showCloudPromotion: config.cloud_promotion,

    showMarket: config.market,

    hideGitHub: config.commercial_hide_github,
    hideDocs: config.commercial_hide_docs,
  };
};
