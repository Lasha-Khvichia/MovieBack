import { Module } from '@nestjs/common';
import { s3ClientProvider } from './s3.client.provider';
import { S3Service } from './s3.service';

@Module({
  providers: [s3ClientProvider, S3Service],
  exports: [S3Service],
})
export class S3Module {}
