// Make sure not to import this on client or browser , this is for SERVER-ONLY
import { resolve } from "node:path";
const PACKAGE_ROOT = resolve(__dirname, "..");
const MONOREPO_ROOT = resolve(PACKAGE_ROOT, "../../");

export const PATHS = {
  packageRoot: PACKAGE_ROOT,
  monorepoRoot: MONOREPO_ROOT,
  // For translation files served by the web app
  publicLocales: resolve(MONOREPO_ROOT, "packages/locales"),
  // For TS-based default translations within this package
  defaultTranslations: resolve(PACKAGE_ROOT, "default"),
  // For generated type definitions
  generatedTypes: resolve(PACKAGE_ROOT, "types"),
  generatedTypesFile: resolve(PACKAGE_ROOT, "types/generated.d.ts"),
  packageEnv: resolve(PACKAGE_ROOT, ".env"),
  rootEnvPath: resolve(MONOREPO_ROOT, ".env"),
} as const;
