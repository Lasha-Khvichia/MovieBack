import { Readable } from 'node:stream';

export interface UploadParams {
  /** Raw file contents to store. */
  body: Buffer | Uint8Array | Readable;
  /** MIME type of the object, e.g. 'video/mp4'. */
  contentType: string;
  /** Optional logical folder/prefix within the bucket, e.g. 'videos' or 'covers'. */
  folder?: string;
  /** Original filename — only used to derive the stored object's extension. */
  fileName?: string;
}

export interface UploadResult {
  /** The S3 object key (path within the bucket). */
  key: string;
  /** Public URL for the object (CDN base when configured, otherwise the bucket URL). */
  url: string;
}
