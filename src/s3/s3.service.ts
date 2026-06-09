import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { UploadParams, UploadResult } from '../types';
import { S3_CLIENT } from './s3.constants';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl?: string;

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    config: ConfigService,
  ) {
    this.bucket = config.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = config.getOrThrow<string>('AWS_REGION');
    this.publicBaseUrl = config.get<string>('AWS_S3_PUBLIC_BASE_URL');
  }

  /**
   * Uploads a file via the multipart-capable Upload helper, so large videos and
   * small cover images share one code path. Returns the stored key and its URL.
   */
  async upload(params: UploadParams): Promise<UploadResult> {
    const key = this.buildKey(params.folder, params.fileName);

    try {
      await new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: params.body,
          ContentType: params.contentType,
        },
      }).done();
    } catch (error) {
      this.logger.error(
        `Failed to upload "${key}" to S3`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to upload file');
    }

    return { key, url: this.getPublicUrl(key) };
  }

  /** Removes an object. S3 does not error when the key is already absent. */
  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete "${key}" from S3`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Time-limited signed URL for downloading a private object.
   * @param expiresIn seconds until the URL expires (default 1 hour; S3 max is 7 days).
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    try {
      return await getSignedUrl(
        this.client,
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn },
      );
    } catch (error) {
      this.logger.error(
        `Failed to sign download URL for "${key}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  /**
   * Stable public URL for an object. Uses AWS_S3_PUBLIC_BASE_URL (e.g. a
   * CloudFront domain) when set, otherwise the virtual-hosted bucket URL.
   * Only resolvable when the object/bucket is publicly readable.
   */
  getPublicUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/+$/, '')}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /** Generates a collision-free key: `<folder>/<uuid><ext>`. */
  private buildKey(folder?: string, fileName?: string): string {
    const ext = fileName ? extname(fileName) : '';
    const prefix = folder ? `${folder.replace(/^\/+|\/+$/g, '')}/` : '';
    return `${prefix}${randomUUID()}${ext}`;
  }
}
