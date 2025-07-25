// biome-ignore lint/suspicious/noRedundantUseStrict: <explanation>
'use strict';
const { join } = require('node:path');
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const migrator = require('drizzle-orm/node-postgres/migrator');
const { PGVECTOR_HINT } = require('./errorHint');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set, please set it in your environment variables.'
  );
}

const client = new Pool({ connectionString: process.env.DATABASE_URL });

const db = drizzle(client);

const runMigrations = async () => {
  await migrator.migrate(db, {
    migrationsFolder: join(__dirname, './migrations'),
  });
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
runMigrations().catch((err) => {
  if (err.message.includes('extension "vector" is not available')) {
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
