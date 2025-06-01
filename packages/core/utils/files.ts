import urlJoin from "url-join";

import { fileEnv } from "@repo/env/file";
import { S3 } from "../modules/s3";

export const getFullFileUrl = async (
  objectKey?: string | null,
  expiresIn?: number
): Promise<string> => {
  if (!objectKey) {
    return "";
  }

  // If S3_SET_ACL is false, it means we did NOT attempt to make objects public via S3 ACLs.
  // This is ALWAYS the case for R2 (where S3_SET_ACL should be '0').
  // It can also be the case for S3 if objects are kept private.
  // In these scenarios, a pre-signed URL is required for access.
  if (!fileEnv.S3_SET_ACL) {
    try {
      const s3 = new S3();
      return await s3.createPreSignedUrlForPreview(objectKey, expiresIn);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(
        `Error creating pre-signed URL for key "${objectKey}":`,
        error
      );
      return "";
    }
  }

  // If S3_SET_ACL is true, we assume objects were uploaded with an S3 'public-read' ACL
  // (this mode is NOT for R2) and S3_PUBLIC_DOMAIN is configured for direct public access.
  if (!fileEnv.S3_PUBLIC_DOMAIN) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.warn(
      `getFullFileUrl: S3_SET_ACL is true, but S3_PUBLIC_DOMAIN is not set. Cannot construct public URL for key "${objectKey}".`
    );
    return ""; // Cannot form a public URL
  }

  // Construct the public URL.
  // S3_ENABLE_PATH_STYLE affects SDK endpoint interaction, but for URL construction,
  // we primarily rely on S3_PUBLIC_DOMAIN being correctly set.
  // If S3_PUBLIC_DOMAIN is a path-style base (e.g., https://s3.region.amazonaws.com)
  // AND S3_BUCKET is defined, then path-style construction is needed.
  // Otherwise, assume S3_PUBLIC_DOMAIN is a virtual-host style base (e.g., https://bucket.s3.region.amazonaws.com or custom domain).

  if (
    fileEnv.S3_ENABLE_PATH_STYLE &&
    fileEnv.S3_BUCKET &&
    // Heuristic: S3_PUBLIC_DOMAIN looks like a generic S3 regional endpoint
    fileEnv.S3_PUBLIC_DOMAIN.includes(".amazonaws.com") &&
    !fileEnv.S3_PUBLIC_DOMAIN.startsWith(`https://${fileEnv.S3_BUCKET}.`)
  ) {
    return urlJoin(fileEnv.S3_PUBLIC_DOMAIN, fileEnv.S3_BUCKET, objectKey);
  }
  // Standard case: S3_PUBLIC_DOMAIN is the full base for the object.
  return urlJoin(fileEnv.S3_PUBLIC_DOMAIN, objectKey);
};
