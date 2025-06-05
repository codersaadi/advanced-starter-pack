import { resolve } from 'node:path';
import { MONOREPO_ROOT } from '../config/const';

const MAIN_CHANGELOG_MD = resolve(MONOREPO_ROOT, 'CHANGELOG.md');

// Example: If you have older versioned changelogs, specify their paths
// const V0_CHANGELOG_MD = resolve(MONOREPO_ROOT, 'docs/changelogs/archive/CHANGELOG.v0.md'); // Example path

// This is what the script will iterate over.
// The keys ('v0', 'v1') will be used as the base for the output JSON filenames (v0.json, v1.json)
export const CHANGELOG_INPUT_FILES = {
  // The key 'v1' will result in 'v1.json'.
  // The script uses semver.clean on the version string found *inside* the markdown,
  // but the filename here is derived from these keys.
  v1: MAIN_CHANGELOG_MD,
  //   v0: V0_CHANGELOG_MD, // Only if you have such a file and want to process it
  // Add more if you have other distinct changelog files you want to process into separate JSONs
};

// --- OUTPUT DIRECTORY FOR JSON FILES ---
// Define where the generated JSON files should be stored.
// This is often in a 'public' or 'static' directory of your docs app or website package.
// Example: apps/my-docs-site/public/changelog-data
export const GENERATED_CHANGELOG_JSON_DIR = resolve(
  MONOREPO_ROOT,
  'apps/docs/public/changelog-data'
);
// Or if your docs is a package:
// export const GENERATED_CHANGELOG_JSON_DIR = resolve(MONOREPO_ROOT, 'packages/docs-site/public/changelog-data');

// --- The following might be specific to my docs site structure ---
// You might not need these, or you might need to adapt them if your docs site
// expects an index file or has a specific statics directory concept for changelogs.
// The provided script doesn't seem to use DOCS_DIR, STATICS_DIR, or CHANGELOG_INDEX directly
// for its core operation of generating v0.json, v1.json etc.

// export const DOCS_DIR = resolve(MONOREPO_ROOT, 'apps/docs/src/app/(main)/docs/changelog'); // Example
// export const STATICS_DIR = resolve(DOCS_DIR, '__statics__'); // Example
// export const CHANGELOG_INDEX = resolve(DOCS_DIR, 'index.json'); // Example: if you need an index file
