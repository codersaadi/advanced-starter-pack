import { z } from 'zod';

export const FeatureFlagsSchema = z.object({
  changelog: z.boolean().optional(),

  clerk_sign_up: z.boolean().optional(),

  // the flags below can only be used with commercial license
  // if you want to use it in the commercial usage
});

export type IFeatureFlags = z.infer<typeof FeatureFlagsSchema>;

export const DEFAULT_FEATURE_FLAGS: IFeatureFlags = {
  clerk_sign_up: true,

  changelog: true,
  // add as many feature flags as per your needs
};

export const mapFeatureFlagsEnvToState = (config: IFeatureFlags) => {
  return {
    showChangelog: config.changelog,

    enableClerkSignUp: config.clerk_sign_up,
  };
};
