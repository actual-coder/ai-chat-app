import type {
  DeleteObjectCommandOutput,
  GetObjectCommandOutput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

type GetObject = (options: {
  bucketName?: string;
  fileName: string;
}) => Promise<GetObjectCommandOutput>;

type PutObject = (options: {
  bucketName?: string;
  fileName: string;
  body: string | Buffer<ArrayBufferLike>;
  contentType?: string;
}) => Promise<PutObjectCommandOutput>;

type DeleteObject = (options: {
  bucketName?: string;
  fileName: string;
}) => Promise<DeleteObjectCommandOutput>;

type PresignedPut = (options: {
  bucketName?: string;
  fileName: string;
  contentType?: string;
  expiresIn?: number;
}) => Promise<string>;

export type { GetObject, PutObject, DeleteObject, PresignedPut };
