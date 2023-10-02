import dotenv from "dotenv";
dotenv.config();
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  rregion: "ap-northeast-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
