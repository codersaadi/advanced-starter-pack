import type { MigrationTableItem } from "@repo/shared/types/client-db";
import { sql } from "drizzle-orm";
import type { OrgDatabase } from "../type";

export class DrizzleMigrationModel {
  private db: OrgDatabase;

  constructor(db: OrgDatabase) {
    this.db = db;
  }

  getTableCounts = async () => {
    const result = await this.db.execute(
      sql`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `
    );

    return Number.parseInt(
      (result.rows[0] as { table_count: string }).table_count || "0"
    );
  };

  getMigrationList = async () => {
    const res = await this.db.execute(
      'SELECT * FROM "drizzle"."__drizzle_migrations" ORDER BY "created_at" DESC;'
    );

    return res.rows as unknown as MigrationTableItem[];
  };
  getLatestMigrationHash = async () => {
    const res = await this.getMigrationList();

    return res[0]?.hash;
  };
}
