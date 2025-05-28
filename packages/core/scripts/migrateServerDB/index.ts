import { createLogger } from "@repo/core/libs/logger";
const logger = createLogger({ name: "Database_Migrations", level: "debug" });
import { join } from "node:path";
import { isServerMode } from "@repo/core/const/version";
import { getServerDB } from "@repo/core/database/server";
import * as dotenv from "dotenv";
import { migrate as neonMigrate } from "drizzle-orm/neon-serverless/migrator";
import { migrate as nodeMigrate } from "drizzle-orm/node-postgres/migrator";

// Load environment variables
dotenv.config({
  path: ".env",
});

const migrationsFolder = join(__dirname, "../../database/migrations");
const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === "1";
const connectionString = process.env.DATABASE_URL;
logger.debug({
  DATABASE_URL: connectionString,
  isServerMode,
  debug: process.env.NEXT_PUBLIC_SERVICE_MODE === "1",
  NEXT_PUBLIC_SERVICE_MODE: process.env.NEXT_PUBLIC_SERVICE_MODE,
  DATABASE_DRIVER: process.env.DATABASE_DRIVER,
});
const runMigrations = async () => {
  logger.info("Starting database migration...");
  const db = await getServerDB();
  try {
    logger.info("Connected to database");

    if (process.env.DATABASE_DRIVER === "node") {
      logger.info("Using Node Postgres migrator");
      await nodeMigrate(db, { migrationsFolder });
    } else {
      logger.info("Using Neon Serverless migrator");
      await neonMigrate(db, { migrationsFolder });
    }

    logger.info("Migration completed successfully");
    process.exit(0);
  } catch (err) {
    console.log({ err });

    const errMsg = (err as Error).message;
    logger.error("Migration failed:", errMsg);

    if (errMsg.includes('extension "vector" is not available')) {
      logger.warn("Vector extension is missing in the database.");
    } else if (
      errMsg.includes(`Cannot read properties of undefined (reading 'migrate')`)
    ) {
      logger.warn("Migration function could not be read—check Drizzle setup.");
    }

    process.exit(1);
  }
};

if (!isDesktop && connectionString) {
  runMigrations();
} else {
  logger.info(
    "Skipping migration: Either running in desktop mode or DATABASE_URL is missing."
  );
}
