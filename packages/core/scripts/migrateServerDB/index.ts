/**
 * DO NOT EXPORT ANYTHING FROM THIS FILE , THIS FILE IS INTENDED TO RUN SCRIPTS INTERNALLY
 */
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { createLogger } from '@repo/core/libs/logger';
import { serverDBEnv } from '@repo/env/db';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from 'ws';
import * as schema from '../../database/schemas';
const logger = await createLogger({
  name: 'Database_Migrations',
  level: 'debug',
});
import { join } from 'node:path';
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator';
import { migrate as nodeMigrate } from 'drizzle-orm/node-postgres/migrator';
const migrateDBConf = {
  connectionString : process.env.DATABASE_URL,
  isDesktop : process.env.NEXT_PUBLIC_IS_DESKTOP_APP === "1",
  DATABASE_DRIVER : process.env.DATABASE_DRIVER === "node", // node by default as we are using self hosted services, you could use neon as default.
}
const migrationsFolder = join(__dirname, '../../database/migrations');
logger.debug({
  DATABASE_URL: migrateDBConf.connectionString,
  DATABASE_DRIVER: serverDBEnv.DATABASE_DRIVER,
});
const runMigrations = async () => {
  logger.info('Starting database migration...');
  const db = getDBForMigrations();
  try {
    logger.info('Connected to database');

    if (migrateDBConf.DATABASE_DRIVER) {
      logger.info('Using Node Postgres migrator');
      await nodeMigrate(db, { migrationsFolder });
    } else {
      logger.info('Using Neon Serverless migrator');
      await neonMigrate(db, { migrationsFolder });
    }

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.log({ err });

    const errMsg = (err as Error).message;
    logger.error('Migration failed:', errMsg);

    if (errMsg.includes('extension "vector" is not available')) {
      logger.warn('Vector extension is missing in the database.');
    } else if (
      errMsg.includes(`Cannot read properties of undefined (reading 'migrate')`)
    ) {
      logger.warn('Migration function could not be read—check Drizzle setup.');
    }

    process.exit(1);
  }
};

if (!migrateDBConf.isDesktop && migrateDBConf.connectionString) {
  runMigrations();
} else {
  logger.info(
    'Skipping migration: Either running in desktop mode or DATABASE_URL is missing.'
  );
}


const getDBForMigrations = () =>  {
   if (serverDBEnv.DATABASE_DRIVER === 'node') {
      const client = new NodePool({ connectionString : migrateDBConf.connectionString });
      return nodeDrizzle(client, { schema });
    }
  
    if (process.env.MIGRATION_DB === '1') {
      // https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined
      neonConfig.webSocketConstructor = ws;
    }
  
    const client = new NeonPool({ connectionString : migrateDBConf.connectionString });
    return neonDrizzle(client, { schema });

}
