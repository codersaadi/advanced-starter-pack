import { sql } from 'drizzle-orm';
import { type PgliteDatabase, drizzle } from 'drizzle-orm/pglite';
import { Md5 } from 'ts-md5';

import {
  type ClientDBLoadingProgress,
  DatabaseLoadingState,
  type MigrationSQL,
  type MigrationTableItem,
} from '@repo/shared/types/client-db';

import { DB_NAME } from '@repo/shared/const/version';
import { sleep } from '@repo/shared/utils/sleep';
import { DrizzleMigrationModel } from '../models/database-migration';
import * as schema from '../schemas';
import migrations from './migrations.json';

const pgliteSchemaHashCache = 'ORG_PGLITE_SCHEMA_HASH';

type DrizzleInstance = PgliteDatabase<typeof schema>;

interface onErrorState {
  error: Error;
  migrationTableItems: MigrationTableItem[];
  migrationsSQL: MigrationSQL[];
}

export interface DatabaseLoadingCallbacks {
  onError?: (error: onErrorState) => void;
  onProgress?: (progress: ClientDBLoadingProgress) => void;
  onStateChange?: (state: DatabaseLoadingState) => void;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private dbInstance: DrizzleInstance | null = null;
  private initPromise: Promise<DrizzleInstance> | null = null;
  private callbacks?: DatabaseLoadingCallbacks;
  private isLocalDBSchemaSynced = false;

  // CDN Configuration
  private static WASM_CDN_URL =
    'https://registry.npmmirror.com/@electric-sql/pglite/0.2.17/files/dist/postgres.wasm';

  private static FSBUNDLER_CDN_URL =
    'https://registry.npmmirror.com/@electric-sql/pglite/0.2.17/files/dist/postgres.data';

  private static VECTOR_CDN_URL =
    'https://registry.npmmirror.com/@electric-sql/pglite/0.2.17/files/dist/vector.tar.gz';

  private constructor() {}

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Load and compile the WASM module
  private async loadWasmModule(): Promise<WebAssembly.Module> {
    const start = Date.now();
    this.callbacks?.onStateChange?.(DatabaseLoadingState.LoadingWasm);

    const response = await fetch(DatabaseManager.WASM_CDN_URL);

    const contentLength = Number(response.headers.get('Content-Length')) || 0;
    const reader = response.body?.getReader();

    if (!reader) throw new Error('Failed to start WASM download');

    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    // Read the data stream
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      // Calculate and report progress
      const progress = Math.min(
        Math.round((receivedLength / contentLength) * 100),
        100
      );
      this.callbacks?.onProgress?.({
        phase: 'wasm',
        progress,
      });
    }

    // Merge data chunks
    const wasmBytes = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      wasmBytes.set(chunk, position);
      position += chunk.length;
    }

    this.callbacks?.onProgress?.({
      costTime: Date.now() - start,
      phase: 'wasm',
      progress: 100,
    });

    // Compile the WASM module
    return WebAssembly.compile(wasmBytes);
  }

  private fetchFsBundle = async () => {
    const res = await fetch(DatabaseManager.FSBUNDLER_CDN_URL);

    return await res.blob();
  };

  // Asynchronously load PGlite related dependencies
  private async loadDependencies() {
    const start = Date.now();
    this.callbacks?.onStateChange?.(DatabaseLoadingState.LoadingDependencies);

    const imports = [
      import('@electric-sql/pglite').then((m) => ({
        IdbFs: m.IdbFs,
        MemoryFS: m.MemoryFS,
        PGlite: m.PGlite,
      })),
      import('@electric-sql/pglite/vector'),
      this.fetchFsBundle(),
    ];

    let loaded = 0;
    const results = await Promise.all(
      imports.map(async (importPromise) => {
        const result = await importPromise;
        loaded += 1;

        // Calculate loading progress
        this.callbacks?.onProgress?.({
          phase: 'dependencies',
          progress: Math.min(Math.round((loaded / imports.length) * 100), 100),
        });
        return result;
      })
    );

    this.callbacks?.onProgress?.({
      costTime: Date.now() - start,
      phase: 'dependencies',
      progress: 100,
    });

    // @ts-ignore
    const [{ PGlite, IdbFs, MemoryFS }, { vector }, fsBundle] = results;

    return { IdbFs, MemoryFS, PGlite, fsBundle, vector };
  }

  // Database migration method
  private async migrate(skipMultiRun = false): Promise<DrizzleInstance> {
    if (this.isLocalDBSchemaSynced && skipMultiRun) return this.db;

    let hash: string | undefined;
    if (typeof localStorage !== 'undefined') {
      const cacheHash = localStorage.getItem(pgliteSchemaHashCache);
      hash = Md5.hashStr(JSON.stringify(migrations));
      // if hash is the same, no need to migrate
      if (hash === cacheHash) {
        try {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const drizzleMigration = new DrizzleMigrationModel(this.db as any);

          // Check if tables exist in the database
          const tableCount = await drizzleMigration.getTableCounts();

          // If table count is greater than 0, assume the database is correctly initialized
          if (tableCount > 0) {
            this.isLocalDBSchemaSynced = true;
            return this.db;
          }
        } catch (_error) {
          // If the query fails, continue with migration to ensure safety
        }
      }
    }

    const _start = Date.now();
    this.callbacks?.onStateChange?.(DatabaseLoadingState.Migrating);

    // refs: https://github.com/drizzle-team/drizzle-orm/discussions/2532
    // @ts-expect-error
    await this.db.dialect.migrate(migrations, this.db.session, {});

    if (typeof localStorage !== 'undefined' && hash) {
      localStorage.setItem(pgliteSchemaHashCache, hash);
    }

    this.isLocalDBSchemaSynced = true;

    return this.db;
  }

  // Initialize database
  async initialize(
    callbacks?: DatabaseLoadingCallbacks
  ): Promise<DrizzleInstance> {
    if (this.initPromise) return this.initPromise;

    this.callbacks = callbacks;

    this.initPromise = (async () => {
      try {
        if (this.dbInstance) return this.dbInstance;

        const _time = Date.now();
        // Initialize database
        this.callbacks?.onStateChange?.(DatabaseLoadingState.Initializing);

        // Load dependencies
        const { fsBundle, PGlite, MemoryFS, IdbFs, vector } =
          await this.loadDependencies();

        // Load and compile WASM module
        const wasmModule = await this.loadWasmModule();

        const { initPgliteWorker } = await import('./pglite');

        let db: typeof PGlite;

        // make db as web worker if worker is available
        if (
          typeof Worker !== 'undefined' &&
          typeof navigator.locks !== 'undefined'
        ) {
          db = await initPgliteWorker({
            dbName: DB_NAME,
            fsBundle: fsBundle as Blob,
            vectorBundlePath: DatabaseManager.VECTOR_CDN_URL,
            wasmModule,
          });
        } else {
          // in edge runtime or test runtime, we don't have worker
          db = new PGlite({
            extensions: { vector },
            fs:
              typeof window === 'undefined'
                ? new MemoryFS(DB_NAME)
                : new IdbFs(DB_NAME),
            relaxedDurability: true,
            wasmModule,
          });
        }

        this.dbInstance = drizzle({ client: db, schema });

        await this.migrate(true);

        this.callbacks?.onStateChange?.(DatabaseLoadingState.Finished);

        await sleep(50);

        this.callbacks?.onStateChange?.(DatabaseLoadingState.Ready);

        return this.dbInstance as DrizzleInstance;
      } catch (e) {
        this.initPromise = null;
        this.callbacks?.onStateChange?.(DatabaseLoadingState.Error);
        const error = e as Error;

        // Query migration table data
        let migrationsTableData: MigrationTableItem[] = [];
        try {
          // Attempt to query the migration table
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const drizzleMigration = new DrizzleMigrationModel(this.db as any);
          migrationsTableData = await drizzleMigration.getMigrationList();
        } catch (_queryError) {}

        this.callbacks?.onError?.({
          error: {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
          migrationTableItems: migrationsTableData,
          // Assuming migrations is the correct structure here
          migrationsSQL: (
            migrations as unknown as { migrations: MigrationSQL[] }
          ).migrations,
        });
        throw error;
      }
    })();

    return this.initPromise;
  }

  // Get database instance
  get db(): DrizzleInstance {
    if (!this.dbInstance) {
      throw new Error(
        'Database not initialized. Please call initialize() first.'
      );
    }
    return this.dbInstance;
  }

  // Create proxy object
  createProxy(): DrizzleInstance {
    return new Proxy({} as DrizzleInstance, {
      get: (_target, prop) => {
        // Accessing the 'db' getter ensures the initialization check runs
        return this.db[prop as keyof DrizzleInstance];
      },
    });
  }

  async resetDatabase(): Promise<void> {
    // Delete IndexedDB database
    return new Promise<void>((resolve, reject) => {
      // Check if IndexedDB is available
      if (typeof indexedDB === 'undefined') {
        resolve();
        return;
      }

      const dbName = `/pglite/${DB_NAME}`;
      const request = indexedDB.deleteDatabase(dbName);

      request.onsuccess = () => {
        // Clear the schema hash from local storage
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(pgliteSchemaHashCache);
        }

        // Reset internal state
        this.dbInstance = null;
        this.initPromise = null;
        this.isLocalDBSchemaSynced = false;

        resolve();
      };

      // eslint-disable-next-line unicorn/prefer-add-event-listener
      request.onerror = (event) => {
        // Get specific error if possible
        const error = (event.target as IDBOpenDBRequest)?.error;
        reject(
          new Error(
            `Failed to reset database '${dbName}'. Reason: ${error?.message ?? 'Unknown'}`
          )
        );
      };

      request.onblocked = (_event) => {
        reject(
          new Error(
            `Resetting database '${dbName}' blocked. Close other tabs/connections.`
          )
        );
      };
    });
  }
}

// Export singleton instance
const dbManager = DatabaseManager.getInstance();

// Maintain the original clientDB export
export const clientDB = dbManager.createProxy();

// Export initialize method for use during application startup
export const initializeDB = (callbacks?: DatabaseLoadingCallbacks) =>
  dbManager.initialize(callbacks);

export const resetClientDatabase = async () => {
  await dbManager.resetDatabase();
};

export const updateMigrationRecord = async (migrationHash: string) => {
  await clientDB.execute(
    sql`INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES (${migrationHash}, ${Date.now()});`
  );

  // Re-initialization might be needed depending on the exact scenario
  await initializeDB();
};
