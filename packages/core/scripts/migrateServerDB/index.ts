import { join } from 'node:path';
import * as dotenv from 'dotenv';
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator';
import { migrate as nodeMigrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from '@repo/core/database/server';

// Read the `.env` file if it exists, or a file specified by the
// dotenv_config_path parameter that's passed to Node.js
dotenv.config();

const migrationsFolder = join(__dirname, '../../database/migrations');

const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';

const runMigrations = async () => {
  if (process.env.DATABASE_DRIVER === 'node') {
    await nodeMigrate(db, { migrationsFolder });
  } else {
    await neonMigrate(db, { migrationsFolder });
  }
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

const connectionString = process.env.DATABASE_URL;

// only migrate database if the connection string is available
if (!isDesktop && connectionString) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  runMigrations().catch((err) => {
    const errMsg = err.message as string;

    if (errMsg.includes('extension "vector" is not available')) {
    } else if (
      errMsg.includes(`Cannot read properties of undefined (reading 'migrate')`)
    ) {
    }

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
} else {
}
