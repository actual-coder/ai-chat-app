import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { DeleteObject, GetObject, PresignedPut, PutObject } from "./types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class Storage {
  constructor(
    private s3: S3Client,
    private defaultBucket?: string,
  ) {}

  get: GetObject = ({ bucketName, fileName }) => {
    const bucket = bucketName || this.defaultBucket;
    if (!bucket) throw new Error("Bucket is required");

    return this.s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: fileName }),
    );
  };
  put: PutObject = ({ bucketName, fileName, body, contentType }) => {
    const bucket = bucketName || this.defaultBucket;
    if (!bucket) throw new Error("Bucket is required");

    return this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: body,
        ContentType: contentType,
      }),
    );
  };
  delete: DeleteObject = ({ fileName, bucketName }) => {
    const bucket = bucketName || this.defaultBucket;
    if (!bucket) throw new Error("Bucket is required");

    return this.s3.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: fileName }),
    );
  };

  presignedPut: PresignedPut = ({
    fileName,
    bucketName,
    contentType,
    expiresIn = 300,
  }) => {
    const bucket = bucketName || this.defaultBucket;
    if (!bucket) throw new Error("Bucket is required");

    return getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        ContentType: contentType,
      }),
      {
        expiresIn,
      },
    );
  };
}
