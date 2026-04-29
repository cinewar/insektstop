'use server';

import {prisma} from '@/lib/prisma';
import {
  getProductFormValues,
  ProductErrors,
  ProductField,
  productSchema,
} from './[id]/schema';

import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {randomUUID} from 'crypto';
import {revalidatePath} from 'next/cache';

/**
 * Defines the UploadedProductImage interface.
 * Usage: Implement or consume UploadedProductImage when exchanging this structured contract.
 */
interface UploadedProductImage {
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

export async function uploadProductImagesToR2(
  files: File[],
): Promise<UploadedProductImage[]> {
  if (!files.length) {
    return [];
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

  const uploads = files.map(async (file, index) => {
    const nameExt = file.name.includes('.')
      ? file.name.split('.').pop()?.toLowerCase() || ''
      : '';
    const extension =
      nameExt && nameExt !== 'heic' && nameExt !== 'heif'
        ? nameExt
        : (mimeToExt[file.type] ?? nameExt) || 'jpg';
    const key = `product/${randomUUID()}.${extension}`;

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

async function deleteProductImagesFromR2(imageUrls: string[]) {
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
        : new Error('Unknown error during R2 deletion');
    }
  }
}

export async function createProduct(data: FormData) {
  const submittedValues = getProductFormValues(data);
  const validationResult = productSchema.safeParse(submittedValues);
  if (!validationResult.success) {
    return {
      ok: false,
      message: validationResult.error.issues[0].message,
    } as const;
  }

  let uploadedImages: UploadedProductImage[] = [];

  if (submittedValues.images.length > 1) {
    uploadedImages = await uploadProductImagesToR2(submittedValues.images);
    if (uploadedImages.length !== submittedValues.images.length) {
      return {
        ok: false,
        message: 'Görseller yüklenirken bir hata oluştu',
      } as const;
    }
  }

  const result = await prisma.product.create({
    data: {
      productId: Date.now(),
      name: submittedValues.name,
      description: submittedValues.description,
      price: parseInt(submittedValues.price, 10),
      images: uploadedImages,
    },
  });

  if (!result) {
    return {
      ok: false,
      message: 'Ürün oluşturulurken bir hata oluştu',
    } as const;
  }

  revalidatePath(`/admin/products`);

  return {
    ok: true,
    message: 'Ürün başarıyla oluşturuldu',
  } as const;
}

export async function updateProduct(data: FormData) {
  const productId = data.get('id');
  if (typeof productId !== 'string' || !productId) {
    return {
      ok: false,
      message: 'Geçersiz ürün ID',
    } as const;
  }
  const submittedValues = getProductFormValues(data);
  const keptExistingImageUrls = data
    .getAll('existingImages')
    .filter((entry): entry is string => typeof entry === 'string' && !!entry);

  const validationResult = productSchema.safeParse(submittedValues);
  if (!validationResult.success) {
    return {
      ok: false,
      message: validationResult.error.issues[0].message,
    } as const;
  }

  // Fetch current product images from DB
  const existingProduct = await prisma.product.findUnique({
    where: {id: productId},
    select: {images: true},
  });
  const keptImageUrlSet = new Set(keptExistingImageUrls);
  const imagesToDelete =
    existingProduct?.images.filter(
      (image) => !keptImageUrlSet.has(image.img),
    ) || [];

  // Delete removed images from Cloudflare R2
  if (imagesToDelete.length > 0) {
    await deleteProductImagesFromR2(imagesToDelete.map((img) => img.img));
  }

  // Upload new images if any
  let uploadedImages: UploadedProductImage[] = [];
  if (submittedValues.images.length > 0) {
    uploadedImages = await uploadProductImagesToR2(submittedValues.images);
    if (uploadedImages.length !== submittedValues.images.length) {
      return {
        ok: false,
        message: 'Görseller yüklenirken bir hata oluştu',
      } as const;
    }
  }

  // Merge kept image URLs and new uploads
  // Only keptExistingImageUrls and new uploads will be in the DB after update
  const mergedImages: UploadedProductImage[] = [
    ...keptExistingImageUrls.map((url, idx) => ({id: idx + 1, img: url})),
    ...uploadedImages.map((img, idx) => ({
      id: keptExistingImageUrls.length + idx + 1,
      img: img.img,
    })),
  ];

  // Update DB with only the merged images (deleted images are removed)
  const result = await prisma.product.update({
    where: {id: productId},
    data: {
      name: submittedValues.name,
      description: submittedValues.description,
      price: parseInt(submittedValues.price, 10),
      images: mergedImages,
    },
  });

  if (!result) {
    return {
      ok: false,
      message: 'Ürün güncellenirken bir hata oluştu',
    } as const;
  }

  revalidatePath(`/admin/products`);

  return {
    ok: true,
    message: 'Ürün başarıyla güncellendi',
  } as const;
}

export async function deleteProduct(productId: string) {
  if (!productId) {
    return {
      ok: false,
      message: 'Geçersiz ürün ID',
    } as const;
  }

  // Fetch current product images from DB
  const existingProduct = await prisma.product.findUnique({
    where: {id: productId},
    select: {images: true},
  });
  const imagesToDelete = existingProduct?.images || [];
  const response = await deleteProductImagesFromR2(
    imagesToDelete.map((img) => img.img),
  );
  if (response instanceof Error) {
    return {
      ok: false,
      message: 'Ürün görselleri silinirken bir hata oluştu',
    } as const;
  }

  const result = await prisma.product.delete({
    where: {id: productId},
  });

  if (!result) {
    return {
      ok: false,
      message: 'Ürün silinirken bir hata oluştu',
    } as const;
  }

  revalidatePath(`/admin/products`);

  return {
    ok: true,
    message: 'Ürün başarıyla silindi',
  } as const;
}
