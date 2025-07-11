import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './user';

export const fileStatusEnum = pgEnum('file_status', ['pending', 'uploading', 'uploaded', 'failed', 'deleted']);

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  
  // File metadata
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(), // in bytes
  
  // S3/R2 storage info
  key: varchar('key', { length: 500 }).notNull().unique(),
  bucket: varchar('bucket', { length: 100 }).notNull(),
  
  // File status and URLs
  status: fileStatusEnum('status').default('pending').notNull(),
  publicUrl: text('public_url'),
  previewUrl: text('preview_url'),
  
  // Additional metadata
  metadata: text('metadata'), // JSON string for custom metadata
  tags: varchar('tags', { length: 500 }), // Comma-separated tags
  
  // Organization
  folder: varchar('folder', { length: 255 }), // Virtual folder path
  isPublic: boolean('is_public').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  
  // Expiration (for temporary files)
  expiresAt: timestamp('expires_at'),
}, (table) => [
  // Primary queries
  index('idx_files_user_id').on(table.userId),
  index('idx_files_key').on(table.key),
  index('idx_files_status').on(table.status),
  
  // Composite indexes for better query performance
  index('idx_files_user_status').on(table.userId, table.status),
  index('idx_files_user_folder').on(table.userId, table.folder),
  index('idx_files_user_created_at').on(table.userId, table.createdAt),
  
  // Cleanup and maintenance indexes
  index('idx_files_expires_at').on(table.expiresAt),
  index('idx_files_deleted_at').on(table.deletedAt),
  
  // Search and filtering indexes
  index('idx_files_user_public').on(table.userId, table.isPublic),
  index('idx_files_user_deleted_at').on(table.userId, table.deletedAt),
]);

// Relations (if you have users table)
export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;