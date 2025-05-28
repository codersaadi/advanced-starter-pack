import { isDesktopApp } from '@repo/core/const/version';
import type { OrgDatabase } from '../type';
import { getDBInstance } from './server-db';

let cachedDB: OrgDatabase | null = null;

export const getServerDB = async (): Promise<OrgDatabase> => {
  if (cachedDB) return cachedDB;
  if (isDesktopApp) {
    // better to return pglite instance or for now , we will throw an error
    throw new Error('server db is not available at desktop app');
  }
  try {
    cachedDB = getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const serverDB = getDBInstance();
