import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from './schemas';

export type OrgDatabaseSchema = typeof schema;

// Define a union type for the possible database instances
// Use the specific Drizzle types for better intellisense
export type OrgDatabase =
  | NodePgDatabase<typeof schema>
  | NeonDatabase<typeof schema>;
