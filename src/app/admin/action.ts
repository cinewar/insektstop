'use server';

import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import {randomUUID} from 'crypto';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {getUserFormValues, userSchema} from './schema';
import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';

/**
 * Defines the UploadedHeroImage interface.
 * Usage: Implement or consume UploadedHeroImage when exchanging this structured contract.
 */
interface UploadedHeroImage {
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
    throw new Error('R2-Umgebungsvariablen fehlen');
  }

  if (!publicBaseUrl) {
    throw new Error('R2 öffentliche URL fehlt');
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

export async function uploadHeroImagesToR2(
  file: File,
): Promise<UploadedHeroImage> {
  if (!file || file.size === 0) {
    return {
      id: 1,
      img: '',
    };
  }

  const client = getR2Client();
  const config = getR2Config();

  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/heic': 'jpg',
    'image/heif': 'jpg',
  };

  const nameExt = file.name.includes('.')
    ? file.name.split('.').pop()?.toLowerCase() || ''
    : '';
  const extension =
    nameExt && nameExt !== 'heic' && nameExt !== 'heif'
      ? nameExt
      : (mimeToExt[file.type] ?? nameExt) || 'jpg';
  const key = `hero/${randomUUID()}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || 'application/octet-stream',
    }),
  );

  return {
    id: 1,
    img: `${config.publicBaseUrl}/${key}`,
  };
}

async function deleteHeroImagesFromR2(imageUrls: string[]) {
  if (!imageUrls.length) {
    return;
  }

  const client = getR2Client();
  const config = getR2Config();

  for (const url of imageUrls) {
    const key = url.replace(config.publicBaseUrl + '/', '');
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucketName,
          Key: key,
        }),
      );
    } catch (err) {
      return err instanceof Error
        ? err
        : new Error('Unbekannter Fehler beim Löschen in R2');
    }
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('insektstop', '', {path: '/', expires: new Date(0)});
  redirect('/');
}

export async function updateUser(formData: FormData) {
  const submittedValues = getUserFormValues(formData);
  const heroImageDeleted = formData.get('heroImageDeleted') === 'true';
  const validationResult = userSchema.safeParse(submittedValues);
  const user = await prisma.user.findFirst({});

  if (!validationResult.success) {
    return {
      ok: false,
      message: validationResult.error.issues[0].message,
    } as const;
  }

  // Delete old image from R2 if replaced with a new one, or explicitly deleted
  if ((submittedValues.heroImage || heroImageDeleted) && user?.heroImage) {
    await deleteHeroImagesFromR2([user.heroImage]);
  }

  let uploadedImage: UploadedHeroImage | null = null;

  if (submittedValues.heroImage) {
    uploadedImage = await uploadHeroImagesToR2(submittedValues.heroImage);
  }

  if (submittedValues.heroImage && !uploadedImage) {
    return {
      ok: false,
      message: 'Fehler beim Hochladen des Hero-Bildes',
    } as const;
  }

  // heroImage in DB:
  // - new file uploaded → use new URL
  // - existing image deleted → null
  // - existing image kept → keep unchanged (don't include in update)
  const heroImageUpdate = submittedValues.heroImage
    ? {heroImage: uploadedImage?.img}
    : heroImageDeleted
      ? {heroImage: null as null}
      : {};

  const result = await prisma.user.update({
    where: {id: submittedValues.id},
    data: {
      name: submittedValues.name,
      email: submittedValues.email,
      phone: submittedValues.phone,
      address: submittedValues.address,
      facebook: submittedValues.facebook,
      instagram: submittedValues.instagram,
      youtube: submittedValues.youtube,
      heroText: submittedValues.heroText,
      ...heroImageUpdate,
      about: submittedValues.about,
    },
  });

  if (!result) {
    return {
      ok: false,
      message: 'Fehler beim Aktualisieren des Benutzers',
    } as const;
  }
  revalidatePath('/admin');
  return {
    ok: true,
    message: 'Benutzer erfolgreich aktualisiert',
  } as const;
}
