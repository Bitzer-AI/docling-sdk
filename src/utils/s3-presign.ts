import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface S3PresignConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Presigned URL expiration in seconds (default: 3600 = 1 hour) */
  expiresIn?: number;
}

/**
 * Generate a presigned URL for an S3 object
 *
 * @param key - S3 object key (path to file)
 * @param config - S3 configuration
 * @returns Presigned URL string
 *
 * @example
 * ```typescript
 * const url = await generatePresignedUrl('uploads/doc.pdf', {
 *   region: 'us-east-2',
 *   bucket: 'my-bucket',
 *   accessKeyId: 'AKIA...',
 *   secretAccessKey: '...',
 *   expiresIn: 3600
 * });
 * ```
 */
export async function generatePresignedUrl(
  key: string,
  config: S3PresignConfig
): Promise<string> {
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: config.expiresIn ?? 3600,
  });

  return url;
}

/**
 * S3 Presigner class for reusable client
 */
export class S3Presigner {
  private client: S3Client;
  private bucket: string;
  private expiresIn: number;

  constructor(config: S3PresignConfig) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.expiresIn = config.expiresIn ?? 3600;
  }

  /**
   * Generate presigned URL for a key
   */
  async presign(key: string, expiresIn?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresIn ?? this.expiresIn,
    });
  }
}
