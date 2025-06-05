import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { serverDBEnv } from '@repo/env/db'; // Centralized environment variables
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from 'ws';
import * as schema from '../schemas'; // Your Drizzle schema
import type { OrgDatabase } from '../type';

// --- Augment NodeJS Global type for development caching ---
// This prevents TypeScript errors when accessing `global.database`
declare global {
  // eslint-disable-next-line no-var
  var database: OrgDatabase | undefined;
}
/**
 * Creates a new database instance based on environment configuration.
 * This function contains the core logic for driver selection and setup.
 */
const createDbInstance = (): OrgDatabase => {
  // Ensure DATABASE_URL is checked before calling this function
  const connectionString = serverDBEnv.DATABASE_URL; // Use non-null assertion as it's checked earlier

  // --- Node.js Driver ---
  if (serverDBEnv.DATABASE_DRIVER === 'node') {
    try {
      const client = new NodePool({ connectionString });
      // Optional: Add a listener to verify connection or handle pool errors
      client.on('error', (_err) => {
        // Decide if process should exit or attempt reconnection based on error
      });
      return nodeDrizzle(client, { schema });
    } catch (_error) {
      throw new Error('Database connection failed (node-postgres).');
    }
  }

  // Configure WebSocket for Neon migrations if specified
  // This might only be needed when running the `drizzle-kit migrate` command
  if (process.env.MIGRATION_DB === '1') {
    neonConfig.webSocketConstructor = ws;
    // Consider other migration-specific configs if needed:
    // neonConfig.fetchConnectionCache = false; // Example: disable cache during migration
  }

  try {
    const client = new NeonPool({ connectionString });
    // NeonPool manages connections differently, less need for explicit 'connect' check usually
    return neonDrizzle(client, { schema });
  } catch (_error) {
    throw new Error('Database connection failed (Neon).');
  }
};

// --- Main Database Variable ---
let db: OrgDatabase;
// const DB_SERVER_ENV = process.env.DB_SERVER_ENV === "1";
// --- Environment Guard ---
// Prevent database initialization logic from running in non-server environments
// if (!isServerMode) {
//   // Throwing an error is safer than providing a dummy object
//   // to prevent unexpected runtime failures later.
//   throw new Error("Database access is prohibited in non-server environments.");
//   // If you absolutely need a dummy for type checking in shared code (not recommended):
//   // db = {} as any;
// }

if (serverDBEnv.DATABASE_URL) {
  // --- Initialization Logic with Caching ---
  if (process.env.NODE_ENV === 'production') {
    db = createDbInstance();
  } else {
    if (!global.database) {
      global.database = createDbInstance();
    }
    db = global.database;
  }
} else {
  throw new Error(
    `Cannot initialize database: "DATABASE_URL" environment variable is not set.`
  );
}

// --- Export the single database instance ---
export { db };
