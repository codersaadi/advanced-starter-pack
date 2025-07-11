import { fileEnv } from '@repo/env/file';
// file-utils.ts - Enhanced file URL utilities
import urlJoin from 'url-join';
import { S3 } from './s3';

export const getFullFileUrl = async (
  objectKey?: string | null,
  expiresIn?: number
): Promise<string> => {
  if (!objectKey) {
    return '';
  }

  // Always use pre-signed URLs for R2 or when S3_SET_ACL is false
  if (!fileEnv.S3_SET_ACL) {
    try {
      const s3 = new S3();
      return await s3.createPreSignedUrlForPreview(objectKey, expiresIn);
    } catch (error) {
      console.error(
        `Error creating pre-signed URL for key "${objectKey}":`,
        error
      );
      return '';
    }
  }

  // For public S3 objects with ACL enabled
  if (!fileEnv.S3_PUBLIC_DOMAIN) {
    console.warn(
      `getFullFileUrl: S3_SET_ACL is true, but S3_PUBLIC_DOMAIN is not set. Cannot construct public URL for key "${objectKey}".`
    );
    return '';
  }

  // Construct public URL based on path style configuration
  if (
    fileEnv.S3_ENABLE_PATH_STYLE &&
    fileEnv.S3_BUCKET &&
    fileEnv.S3_PUBLIC_DOMAIN.includes('.amazonaws.com') &&
    !fileEnv.S3_PUBLIC_DOMAIN.startsWith(`https://${fileEnv.S3_BUCKET}.`)
  ) {
    return urlJoin(fileEnv.S3_PUBLIC_DOMAIN, fileEnv.S3_BUCKET, objectKey);
  }

  return urlJoin(fileEnv.S3_PUBLIC_DOMAIN, objectKey);
};

export const generateUniqueKey = (
  prefix = '',
  extension = '',
  userId?: string
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const userPrefix = userId ? `${userId}/` : '';
  const filePrefix = prefix ? `${prefix}/` : '';

  return `${userPrefix}${filePrefix}${timestamp}-${random}${extension}`;
};

export const getFileExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'text/plain': '.txt',
    'text/html': '.html',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'application/xml': '.xml',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  };

  return mimeToExt[mimeType] || '';
};

// Enhanced environment config
export const getFileEnvConfig = () => {
  return {
    ...fileEnv,
    // R2-specific defaults
    S3_REGION: fileEnv.S3_REGION || 'auto',
    S3_ENABLE_PATH_STYLE:
      fileEnv.S3_ENABLE_PATH_STYLE ??
      (fileEnv.S3_ENDPOINT?.includes('cloudflare') || false),
    S3_SET_ACL:
      fileEnv.S3_SET_ACL &&
      !(fileEnv.S3_ENDPOINT?.includes('cloudflare') || false), // Disable ACL for R2
    S3_PREVIEW_URL_EXPIRE_IN: fileEnv.S3_PREVIEW_URL_EXPIRE_IN || 3600,
  };
};
