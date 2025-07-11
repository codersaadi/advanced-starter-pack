import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileEnv } from '@repo/env/file';
import { z } from 'zod';

export const fileSchema = z.object({
  Key: z.string(),
  LastModified: z.date(),
  Size: z.number(),
  ETag: z.string().optional(),
  StorageClass: z.string().optional(),
});

export const listFileSchema = z.array(fileSchema);
export type FileType = z.infer<typeof fileSchema>;

export const uploadOptionsSchema = z.object({
  contentType: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  cacheControl: z.string().optional(),
  contentDisposition: z.string().optional(),
});

export type UploadOptions = z.infer<typeof uploadOptionsSchema>;

const DEFAULT_S3_REGION = 'auto'; // R2 uses 'auto' as default region
const DEFAULT_EXPIRES_IN = 3600; // 1 hour
const MAX_KEYS_PER_DELETE = 1000; // AWS/R2 limit

export class S3 {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly setAcl: boolean;
  private readonly isR2: boolean;

  constructor() {
    if (
      !fileEnv.S3_ACCESS_KEY_ID ||
      !fileEnv.S3_SECRET_ACCESS_KEY ||
      !fileEnv.S3_BUCKET
    ) {
      throw new Error(
        'S3 environment variables are not set completely. Required: S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET'
      );
    }

    this.bucket = fileEnv.S3_BUCKET;
    this.setAcl = fileEnv.S3_SET_ACL;

    // Detect if we're using R2 based on endpoint
    this.isR2 =
      fileEnv.S3_ENDPOINT?.includes('cloudflare') ||
      fileEnv.S3_ENDPOINT?.includes('r2.cloudflarestorage.com') ||
      false;

    const clientConfig: S3ClientConfig = {
      credentials: {
        accessKeyId: fileEnv.S3_ACCESS_KEY_ID,
        secretAccessKey: fileEnv.S3_SECRET_ACCESS_KEY,
      },
      region: fileEnv.S3_REGION || DEFAULT_S3_REGION,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    };

    // Configure endpoint and path style
    if (fileEnv.S3_ENDPOINT) {
      clientConfig.endpoint = fileEnv.S3_ENDPOINT;
      clientConfig.forcePathStyle = fileEnv.S3_ENABLE_PATH_STYLE ?? this.isR2;
    }

    this.client = new S3Client(clientConfig);
  }

  public async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  public async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    // Process in batches to respect AWS/R2 limits
    const batches = this.chunkArray(keys, MAX_KEYS_PER_DELETE);

    for (const batch of batches) {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: batch.map((key) => ({ Key: key })) },
      });

      await this.client.send(command);
    }
  }

  public async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`No body in response for key: ${key}`);
    }

    return response.Body.transformToString();
  }

  public async getFileByteArray(key: string): Promise<Uint8Array> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`No body in response for key: ${key}`);
    }

    return response.Body.transformToByteArray();
  }

  public async getFileMetadata(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await this.client.send(command);
  }

  public async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileMetadata(key);
      return true;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  public async listFiles(prefix?: string, maxKeys?: number) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await this.client.send(command);
    return response.Contents || [];
  }

  public async createPreSignedUrl(
    key: string,
    expiresIn: number = DEFAULT_EXPIRES_IN
  ): Promise<string> {
    const command = new PutObjectCommand({
      ACL: this.setAcl && !this.isR2 ? 'public-read' : undefined, // R2 doesn't support ACLs
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  public async createPreSignedUrlForPreview(
    key: string,
    expiresIn?: number
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn:
        expiresIn ?? fileEnv.S3_PREVIEW_URL_EXPIRE_IN ?? DEFAULT_EXPIRES_IN,
    });
  }

  public async uploadContent(
    path: string,
    content: string | Buffer | Uint8Array,
    options?: UploadOptions
  ) {
    const command = new PutObjectCommand({
      ACL: this.setAcl && !this.isR2 ? 'public-read' : undefined, // R2 doesn't support ACLs
      Body: content,
      Bucket: this.bucket,
      Key: path,
      ContentType: options?.contentType,
      Metadata: options?.metadata,
      CacheControl: options?.cacheControl,
      ContentDisposition: options?.contentDisposition,
    });

    return await this.client.send(command);
  }

  public async uploadFile(path: string, file: File, options?: UploadOptions) {
    const buffer = await file.arrayBuffer();
    return this.uploadContent(path, new Uint8Array(buffer), {
      contentType: file.type,
      ...options,
    });
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  public getBucket(): string {
    return this.bucket;
  }

  public isCloudflareR2(): boolean {
    return this.isR2;
  }
}


// Environment Variables:
// The code expects these environment variables:

// S3_ACCESS_KEY_ID: Your access key
// S3_SECRET_ACCESS_KEY: Your secret key
// S3_BUCKET: Bucket name
// S3_ENDPOINT: R2 endpoint (e.g., https://your-account.r2.cloudflarestorage.com)
// S3_REGION: Region (defaults to 'auto' for R2)
// S3_ENABLE_PATH_STYLE: Force path style (auto-detected for R2)
// S3_SET_ACL: Set ACL (auto-disabled for R2)
// S3_PUBLIC_DOMAIN: Public domain for direct access (optional)
// S3_PREVIEW_URL_EXPIRE_IN: Preview URL expiration time