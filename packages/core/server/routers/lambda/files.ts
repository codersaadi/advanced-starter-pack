import { files } from '@repo/core/database/schemas/files';
// files.router.ts
import { authedProcedure, router } from '@repo/core/libs/trpc/lambda';
import { serverDatabase } from '@repo/core/libs/trpc/lambda/middleware';
import {
  generateUniqueKey,
  getFileExtensionFromMimeType,
  getFullFileUrl,
} from '@repo/core/modules/files-util';
import { S3 } from '@repo/core/modules/s3';
import { TRPCError } from '@trpc/server';
import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  sql,
} from 'drizzle-orm';
import { z } from 'zod';

const filesProcedure = authedProcedure
  .use(serverDatabase)
  .use(({ next, ctx }) => {
    const db = ctx.db;
    const userId = ctx.userId;

    // Initialize S3 client
    const s3 = new S3();

    return next({
      ctx: {
        ...ctx,
        s3,
        userId,
        db,
      },
    });
  });

const createFileSchema = z.object({
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z.number().positive(),
  folder: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.date().optional(),
});

const updateFileSchema = z.object({
  id: z.string().uuid(),
  originalName: z.string().min(1).max(255).optional(),
  folder: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.date().optional(),
});

const listFilesSchema = z.object({
  folder: z.string().optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
  status: z
    .enum(['pending', 'uploading', 'uploaded', 'failed', 'deleted'])
    .optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'originalName', 'size'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const filesRouter = router({
  // Create presigned URL for upload
  createUploadUrl: filesProcedure
    .input(createFileSchema)
    .mutation(async ({ ctx, input }) => {
      const { s3, db, userId } = ctx;

      try {
        // Generate unique key
        const extension = getFileExtensionFromMimeType(input.mimeType);
        const key = generateUniqueKey(
          input.folder || 'uploads',
          extension,
          userId
        );

        // Create database record
        const [file] = await db
          .insert(files)
          .values({
            userId,
            originalName: input.originalName,
            mimeType: input.mimeType,
            size: input.size,
            key,
            bucket: s3.getBucket(),
            status: 'pending',
            folder: input.folder,
            tags: input.tags,
            isPublic: input.isPublic,
            metadata: input.metadata ? JSON.stringify(input.metadata) : null,
            expiresAt: input.expiresAt,
          })
          .returning();

        // Generate presigned URL
        const uploadUrl = await s3.createPreSignedUrl(key, 3600); // 1 hour

        return {
          fileId: file?.id,
          uploadUrl,
          key,
        };
      } catch (error) {
        console.error('Error creating upload URL:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create upload URL',
        });
      }
    }),

  // Confirm upload completion
  confirmUpload: filesProcedure
    .input(
      z.object({
        fileId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { s3, db, userId } = ctx;

      try {
        // Get file record
        const [file] = await db
          .select()
          .from(files)
          .where(and(eq(files.id, input.fileId), eq(files.userId, userId)));

        if (!file) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found',
          });
        }

        // Check if file exists in S3
        const fileExists = await s3.fileExists(file.key);
        if (!fileExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'File not found in storage',
          });
        }

        // Get file metadata from S3
        const metadata = await s3.getFileMetadata(file.key);

        // Generate URLs
        const publicUrl = file.isPublic ? await getFullFileUrl(file.key) : null;
        const previewUrl = await getFullFileUrl(file.key, 3600);

        // Update database record
        const [updatedFile] = await db
          .update(files)
          .set({
            status: 'uploaded',
            publicUrl,
            previewUrl,
            size: metadata.ContentLength || file.size,
            updatedAt: new Date(),
          })
          .where(eq(files.id, input.fileId))
          .returning();

        return updatedFile;
      } catch (error) {
        console.error('Error confirming upload:', error);

        // Mark as failed
        await db
          .update(files)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(files.id, input.fileId));

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm upload',
        });
      }
    }),

  // List files
  list: filesProcedure.input(listFilesSchema).query(async ({ ctx, input }) => {
    const { db, userId } = ctx;

    try {
      const conditions = [eq(files.userId, userId), isNull(files.deletedAt)];

      // Add filters
      if (input.folder !== undefined) {
        conditions.push(eq(files.folder, input.folder));
      }

      if (input.status) {
        conditions.push(eq(files.status, input.status));
      }

      if (input.isPublic !== undefined) {
        conditions.push(eq(files.isPublic, input.isPublic));
      }

      if (input.search) {
        conditions.push(
          or(
            ilike(files.originalName, `%${input.search}%`),
            ilike(files.tags, `%${input.search}%`)
          ) as SQL<unknown>
        );
      }

      if (input.tags) {
        conditions.push(ilike(files.tags, `%${input.tags}%`));
      }

      // Build query
      const query = db
        .select()
        .from(files)
        .where(and(...conditions))
        .limit(input.limit)
        .offset(input.offset);

      // Add sorting
      const sortColumn = files[input.sortBy];
      query.orderBy(
        input.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
      );

      const fileList = await query;

      // Get total count
      const res = await db
        .select({ count: sql`count(*)` })
        .from(files)
        .where(and(...conditions));
      const count = res[0]?.count;
      return {
        files: fileList,
        total: Number(count),
        hasMore: input.offset + input.limit < Number(count),
      };
    } catch (error) {
      console.error('Error listing files:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list files',
      });
    }
  }),

  // Get file by ID
  getById: filesProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      try {
        const [file] = await db
          .select()
          .from(files)
          .where(
            and(
              eq(files.id, input.id),
              eq(files.userId, userId),
              isNull(files.deletedAt)
            )
          );

        if (!file) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found',
          });
        }

        return file;
      } catch (error) {
        console.error('Error getting file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get file',
        });
      }
    }),

  // Update file
  update: filesProcedure
    .input(updateFileSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const updateData: any = {
          updatedAt: new Date(),
        };

        // Add fields to update
        if (input.originalName !== undefined) {
          updateData.originalName = input.originalName;
        }
        if (input.folder !== undefined) {
          updateData.folder = input.folder;
        }
        if (input.tags !== undefined) {
          updateData.tags = input.tags;
        }
        if (input.isPublic !== undefined) {
          updateData.isPublic = input.isPublic;
        }
        if (input.metadata !== undefined) {
          updateData.metadata = JSON.stringify(input.metadata);
        }
        if (input.expiresAt !== undefined) {
          updateData.expiresAt = input.expiresAt;
        }

        const [updatedFile] = await db
          .update(files)
          .set(updateData)
          .where(
            and(
              eq(files.id, input.id),
              eq(files.userId, userId),
              isNull(files.deletedAt)
            )
          )
          .returning();

        if (!updatedFile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found',
          });
        }

        return updatedFile;
      } catch (error) {
        console.error('Error updating file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update file',
        });
      }
    }),

  // Delete file (soft delete)
  delete: filesProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        hardDelete: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { s3, db, userId } = ctx;

      try {
        const [file] = await db
          .select()
          .from(files)
          .where(
            and(
              eq(files.id, input.id),
              eq(files.userId, userId),
              isNull(files.deletedAt)
            )
          );

        if (!file) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found',
          });
        }

        if (input.hardDelete) {
          // Delete from S3
          await s3.deleteFile(file.key);

          // Delete from database
          await db.delete(files).where(eq(files.id, input.id));
        } else {
          // Soft delete
          await db
            .update(files)
            .set({
              status: 'deleted',
              deletedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(files.id, input.id));
        }

        return { success: true };
      } catch (error) {
        console.error('Error deleting file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        });
      }
    }),

  // Get download URL
  getDownloadUrl: filesProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        expiresIn: z.number().min(60).max(86400).default(3600), // 1 minute to 24 hours
      })
    )
    .query(async ({ ctx, input }) => {
      const { s3, db, userId } = ctx;

      try {
        const [file] = await db
          .select()
          .from(files)
          .where(
            and(
              eq(files.id, input.id),
              eq(files.userId, userId),
              eq(files.status, 'uploaded'),
              isNull(files.deletedAt)
            )
          );

        if (!file) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found',
          });
        }

        const downloadUrl = await s3.createPreSignedUrlForPreview(
          file.key,
          input.expiresIn
        );

        return {
          downloadUrl,
          expiresIn: input.expiresIn,
        };
      } catch (error) {
        console.error('Error getting download URL:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get download URL',
        });
      }
    }),

  // Clean up expired files
  cleanupExpired: filesProcedure.mutation(async ({ ctx }) => {
    const { s3, db, userId } = ctx;

    try {
      // Get expired files
      const expiredFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.userId, userId),
            lt(files.expiresAt, new Date()),
            isNull(files.deletedAt)
          )
        );

      if (expiredFiles.length === 0) {
        return { deletedCount: 0 };
      }

      // Delete from S3
      const keys = expiredFiles.map((f) => f.key);
      await s3.deleteFiles(keys);

      // Delete from database
      const fileIds = expiredFiles.map((f) => f.id);
      await db
        .delete(files)
        .where(and(eq(files.userId, userId),inArray(files.id, fileIds)));

      return { deletedCount: expiredFiles.length };
    } catch (error) {
      console.error('Error cleaning up expired files:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cleanup expired files',
      });
    }
  }),

  // Get storage stats
  getStorageStats: filesProcedure.query(async ({ ctx }) => {
    const { db, userId } = ctx;

    try {
      const [stats] = await db
        .select({
          totalFiles: sql`count(*)`,
          totalSize: sql`sum(${files.size})`,
          uploadedFiles: sql`count(case when ${files.status} = 'uploaded' then 1 end)`,
          pendingFiles: sql`count(case when ${files.status} = 'pending' then 1 end)`,
          failedFiles: sql`count(case when ${files.status} = 'failed' then 1 end)`,
        })
        .from(files)
        .where(and(eq(files.userId, userId), isNull(files.deletedAt)));

      return {
        totalFiles: Number(stats?.totalFiles || 0),
        totalSize: Number(stats?.totalSize || 0),
        uploadedFiles: Number(stats?.uploadedFiles || 0),
        pendingFiles: Number(stats?.pendingFiles || 0),
        failedFiles: Number(stats?.failedFiles || 0),
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get storage stats',
      });
    }
  }),
});

export type FilesRouter = typeof filesRouter;
