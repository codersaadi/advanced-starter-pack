import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readMigrationFiles } from 'drizzle-orm/migrator';

const rootApiBase = join(__dirname, '../..');
const migrationsFolder = join(rootApiBase, './database/migrations');
const migrations = readMigrationFiles({ migrationsFolder: migrationsFolder });

writeFileSync(
  join(rootApiBase, './database/client/migrations.json'),
  JSON.stringify(migrations, null, 2) // null, 2 adds indentation for better readability
);
