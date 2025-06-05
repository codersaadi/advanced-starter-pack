import { merge } from "../../utils/merge";
import { DEFAULT_FEATURE_FLAGS, mapFeatureFlagsEnvToState } from "./schema";
import { parseFeatureFlag } from "./utils/parser";

import { featureFlagsEnv } from "@repo/env/feature-flags";
export const getServerFeatureFlagsValue = () => {
  const flags = parseFeatureFlag(featureFlagsEnv.FEATURE_FLAGS);

  return merge(DEFAULT_FEATURE_FLAGS, flags);
};

export const serverFeatureFlags = () => {
  const serverConfig = getServerFeatureFlagsValue();

  return mapFeatureFlagsEnvToState(serverConfig);
};

export * from "./schema";
