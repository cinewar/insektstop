import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {randomUUID} from 'crypto';

/**
  * Defines the UploadedOrderImage interface.
  * Usage: Implement or consume UploadedOrderImage when exchanging this structured contract.
  */
interface UploadedOrderImage {
  id: number;
  img: string;
}

let r2Client: S3Client | null = null;

/**
  * Describes behavior for getR2Config.
  * Usage: Call getR2Config(...) where this declaration is needed in the current module flow.
  */
function getR2Config() {
  const accountId =
    process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? process.env.R2_ACCOUNT_ID;
  const accessKeyId =
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ??
    process.env.R2_ACCESS_KEY_ID ??
    process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ??
    process.env.R2_SECRET_ACCESS_KEY ??
    process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName =
    process.env.CLOUDFLARE_R2_BUCKET_NAME ?? process.env.R2_BUCKET_NAME;
  const publicBaseUrl =
    process.env.CLOUDFLARE_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_BASE_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('R2 environment variables are missing');
  }

  if (!publicBaseUrl) {
    throw new Error('R2 public URL is missing');
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ''),
  };
}

/**
  * Describes behavior for getR2Client.
  * Usage: Call getR2Client(...) where this declaration is needed in the current module flow.
  */
function getR2Client() {
  if (!r2Client) {
    const config = getR2Config();
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return r2Client;
}

/**
  * Describes behavior for uploadOrderImagesToR2.
  * Usage: Call uploadOrderImagesToR2(...) where this declaration is needed in the current module flow.
  */
export async function uploadOrderImagesToR2(
  files: File[],
  orderId: string,
  placeId: string,
): Promise<UploadedOrderImage[]> {
  if (!files.length) {
    return [];
  }

  const client = getR2Client();
  const config = getR2Config();

  const uploads = files.map(async (file, index) => {
    const extension = file.name.includes('.')
      ? file.name.split('.').pop()?.toLowerCase() || 'bin'
      : 'bin';
    const key = `order/${orderId}/${placeId}/${randomUUID()}.${extension}`;

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || 'application/octet-stream',
      }),
    );

    return {
      id: index + 1,
      img: `${config.publicBaseUrl}/${key}`,
    };
  });

  return Promise.all(uploads);
}

/**
  * Describes behavior for deleteOrderImageFromR2.
  * Usage: Call deleteOrderImageFromR2(...) where this declaration is needed in the current module flow.
  */
export async function deleteOrderImageFromR2(imageUrl: string) {
  const client = getR2Client();
  const config = getR2Config();

  if (!imageUrl.startsWith(config.publicBaseUrl)) {
    throw new Error('Invalid image URL');
  }

  const key = imageUrl.substring(config.publicBaseUrl.length + 1);

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );
}
