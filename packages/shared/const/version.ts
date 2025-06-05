// causes problem at edge runtime but required when doing migrations serverDB
// import * as dotenv from "dotenv";
// dotenv.config();
import pkg from '../../../package.json';

import { BRANDING_NAME, ORG_NAME } from './branding';

export const isServerMode = process.env.NEXT_PUBLIC_SERVICE_MODE === 'server';
export const isDesktopApp = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';

export const isCustomBranding = (BRANDING_NAME as string) !== 'Your Cloud';
export const isCustomORG = (ORG_NAME as string) !== 'Your Org';

export const CURRENT_VERSION = pkg.version;
export const DB_NAME = 'db_name'; // FOR NOW, CLIENT USES IT , PG_LITE
export const DESKTOP_USER_ID = 'DEFAULT_DESKTOP_USER';
export const isUsePgliteDB = process.env.NEXT_PUBLIC_CLIENT_DB === 'pglite';
export const isMagicLinkEnabled =
  process.env.NEXT_AUTH_MAGIC_LINK_ENABLED && isServerMode;
