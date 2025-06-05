import { FeatureFlagsSchema, type IFeatureFlags } from '../schema';

/**
 * Parses a feature flag string from environment variables.
 * @param flagString The feature flag string read from environment variables.
 * @returns A parsed feature flags object.
 */
export function parseFeatureFlag(flagString?: string): Partial<IFeatureFlags> {
  const flags: Partial<IFeatureFlags> = {};

  if (!flagString) return flags;

  // Replace Chinese commas with English commas, then split the string by commas
  const flagArray = flagString.trim().replaceAll('，', ',').split(',');

  for (let flag of flagArray) {
    flag = flag.trim();
    if (flag.startsWith('+') || flag.startsWith('-')) {
      const operation = flag[0];
      const key = flag.slice(1);

      const featureKey = key as keyof IFeatureFlags;

      // Check if the key exists in the FeatureFlagsSchema
      if (FeatureFlagsSchema.shape[featureKey]) {
        flags[featureKey] = operation === '+';
      }
    }
  }

  return flags;
}
