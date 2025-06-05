import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const featureFlagsEnv = createEnv({
  runtimeEnv: {
    FEATURE_FLAGS: process.env.FEATURE_FLAGS,
  },

  server: {
    FEATURE_FLAGS: z.string().optional(),
  },
});
