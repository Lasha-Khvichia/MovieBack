import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3_CLIENT } from './s3.constants';

/**
 * Builds the singleton S3 client from configuration. Kept separate from the
 * service so the client can be mocked in tests by overriding the S3_CLIENT token.
 */
export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): S3Client => {
    const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY');
    const endpoint = config.get<string>('AWS_S3_ENDPOINT');

    return new S3Client({
      region: config.getOrThrow<string>('AWS_REGION'),
      maxAttempts: 3,
      // Pass static credentials only when both are provided (local dev). Otherwise
      // the SDK falls back to its default chain (e.g. an IAM role in production).
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
      // A custom endpoint (LocalStack/MinIO/other S3-compatible store) needs
      // path-style addressing instead of virtual-hosted bucket subdomains.
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    });
  },
};
