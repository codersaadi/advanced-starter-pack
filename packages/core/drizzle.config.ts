import path from 'node:path';
import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load environment variables from .env file
dotenv.config();

// Determine the database connection string based on the environment
let connectionString = process.env.DATABASE_URL;

// If the environment is 'test', use the test database connection string
if (process.env.NODE_ENV === 'test') {
  connectionString = process.env.DATABASE_TEST_URL;
}

// Throw an error if the connection string is not defined
if (!connectionString)
  throw new Error(
    '`DATABASE_URL` or `DATABASE_TEST_URL` not found in environment'
  );

/**
 * Drizzle ORM configuration object.
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */
export default {
  // Database credentials
  dbCredentials: {
    url: connectionString,
  },
  // The dialect of the database to use.
  dialect: 'postgresql',
  // The output directory for migrations.
  out: './database/migrations',

  // The path to the database schema file.
  schema: path.resolve(__dirname, './database/schemas/index.ts'),
  // Whether to use strict mode.
  strict: true,
} satisfies Config;
