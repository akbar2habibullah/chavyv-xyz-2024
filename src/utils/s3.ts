// s3Utils.ts
import AWS from 'aws-sdk';
import { getUUID } from './uuid'

// Configure AWS with your access and secret key.
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// Upload file to S3 with pre-signed URL
export const generateUploadURL = async (contentType: string, name: string = "no-name"): Promise<string> => {
  const fileExtension = contentType.split('/').pop();
  const fileName = `${getUUID(20)}-${name}.${fileExtension}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
    Expires: 60 * 10, // Expires 10 minutes after
  };

  const url = await s3.getSignedUrlPromise('putObject', params);

  return url;
};

// Download file from S3 with pre-signed URL
export const generateDownloadURL = async (key: string): Promise<string> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    expires: 60 * 60 * 3 // Expires 3 hours after
  };

  const url = await s3.getSignedUrlPromise('getObject', params);
  return url;
};