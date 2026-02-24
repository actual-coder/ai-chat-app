import { S3Client } from "@aws-sdk/client-s3";
import { Storage } from "./service";

const apiKey = process.env.CLOUDFLARE_API_KEY;
const secretKey = process.env.CLOUDFLARE_SECRET_KEY;

if (!secretKey || !apiKey)
  throw new Error("CLOUDFLARE_API_KEY and CLOUDFLARE_SECRET_KEY both required");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: apiKey,
    secretAccessKey: secretKey,
  },
});

export const storage = new Storage(s3, "ai-chat");
