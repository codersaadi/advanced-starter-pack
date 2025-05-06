import path from 'node:path';
import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

// Determine the directory name

// dotenv_config_path parameter that's passed to Node.js

dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'test') {
  connectionString = process.env.DATABASE_TEST_URL;
}

if (!connectionString)
  throw new Error(
    '`DATABASE_URL` or `DATABASE_TEST_URL` not found in environment'
  );

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: 'postgresql',
  // Resolve the output path relative to the config file's directory
  out: './database/migrations',

  // Resolve the schema path relative to the config file's directory
  schema: path.resolve(__dirname, './database/schemas/index.ts'), // <-- Use path.resolve
  strict: true,
} satisfies Config;
