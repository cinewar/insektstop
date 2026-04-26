'use server';

import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import type {Order, OrderProduct} from '../../../../generated/prisma/client';
import {
  getPlaceFormValues,
  getPlaceProductFormValues,
  placeProductSchema,
  placeSchema,
} from './schema';
import {
  deleteOrderImageFromR2,
  uploadImageToOrderMessagetoR2,
  uploadOrderImagesToR2,
} from './functions';

/**
 * Standard result shape returned by place-related server actions.
 */
type PlaceActionResult<T> = {ok: true; data: T} | {ok: false; message: string};

/**
 * Normalizes unknown thrown values into a readable message for action responses.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as {message: unknown}).message === 'string'
  ) {
    return (error as {message: string}).message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Recalculates and persists the total price of one place (orderProduct)
 * from the prices of its linked products.
 */
async function syncOrderProductPrice(
  orderProductId: string,
): Promise<OrderProduct> {
  const orderProductWithItems = await prisma.orderProduct.findUnique({
    where: {id: orderProductId},
    include: {
      products: {
        include: {
          product: {
            select: {
              price: true,
            },
          },
        },
      },
    },
  });

  if (!orderProductWithItems) {
    throw new Error('Fiyat senkronizasyonunda sipariş ürünu bulunamadı');
  }

  const nextPrice = orderProductWithItems.products.reduce(
    (sum, item) => sum + item.product.price,
    0,
  );

  return prisma.orderProduct.update({
    where: {id: orderProductId},
    data: {
      price: nextPrice,
    },
  });
}

/**
 * Recalculates and persists the overall order total from all place prices.
 */
async function syncOrderTotalPrice(orderId: string): Promise<Order> {
  const orderWithItems = await prisma.order.findUnique({
    where: {id: orderId},
    include: {
      orderItems: {
        select: {
          price: true,
        },
      },
    },
  });

  if (!orderWithItems) {
    throw new Error('Toplam fiyat senkronizasyonunda sipariş bulunamadı');
  }

  const nextTotalPrice = orderWithItems.orderItems.reduce(
    (sum, item) => sum + item.price,
    0,
  );

  return prisma.order.update({
    where: {id: orderId},
    data: {
      totalPrice: nextTotalPrice,
    },
  });
}

/**
 * Validates incoming place form data, creates a new order item under the target order,
 * and revalidates the order detail route so the UI shows the latest state.
 */
export async function createPlace(
  formData: FormData,
): Promise<PlaceActionResult<Order>> {
  try {
    const orderId = formData.get('id');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }

    const submittedValues = getPlaceFormValues(formData);
    const validationResult = placeSchema.safeParse(submittedValues);
    if (!validationResult.success) {
      return {
        ok: false,
        message: validationResult.error.issues[0].message,
      } as const;
    }

    const result = await prisma.order.update({
      where: {id: orderId},
      data: {
        orderItems: {
          create: {
            name: submittedValues.place,
            price: 0,
          },
        },
      },
      include: {
        orderItems: true,
      },
    });

    await syncOrderTotalPrice(orderId);

    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: result} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mekan oluşturma basarisiz, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Validates incoming place form data and updates the name of an existing order item
 * identified by placeId.
 */
export async function updatePlace(
  formData: FormData,
): Promise<PlaceActionResult<OrderProduct>> {
  try {
    const placeId = formData.get('placeId');
    if (typeof placeId !== 'string' || !placeId) {
      return {ok: false, message: 'Mekan kimliği gereklidir'} as const;
    }

    const orderId = formData.get('id');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }

    const submittedValues = getPlaceFormValues(formData);
    const validationResult = placeSchema.safeParse(submittedValues);
    if (!validationResult.success) {
      return {
        ok: false,
        message: validationResult.error.issues[0].message,
      } as const;
    }

    const result = await prisma.orderProduct.update({
      where: {id: placeId},
      data: {
        name: submittedValues.place,
      },
    });
    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: result} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mekan güncelleme basarisiz, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Deletes a place and its related place-products, removes linked images from storage,
 * then refreshes order totals.
 */
export async function deletePlace(orderId: string, placeId: string) {
  try {
    const itemsWithImages = await prisma.orderItemProduct.findMany({
      where: {orderProductRefId: placeId},
      select: {images: true},
    });

    await prisma.orderItemProduct.deleteMany({
      where: {
        orderProductRefId: placeId,
      },
    });

    const allImages = itemsWithImages.flatMap((item) => item.images);
    await Promise.allSettled(
      allImages.map((image) => deleteOrderImageFromR2(image.img)),
    );

    const result = await prisma.orderProduct.delete({
      where: {id: placeId},
    });

    await syncOrderTotalPrice(orderId);

    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: result} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mekan silme basarisiz, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Creates a place-product row, uploads up to three product images, and updates
 * both place and order totals.
 */
export async function createPlaceProduct(
  formData: FormData,
): Promise<PlaceActionResult<OrderProduct> & {imageUrls?: string[]}> {
  try {
    const orderId = formData.get('orderId');
    const placeId = formData.get('placeId');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }
    if (typeof placeId !== 'string' || !placeId) {
      return {ok: false, message: 'Mekan kimliği gereklidir'} as const;
    }

    const submittedValues = getPlaceProductFormValues(formData);
    const validationResult = placeProductSchema.safeParse(submittedValues);
    if (!validationResult.success) {
      return {
        ok: false,
        message: validationResult.error.issues[0].message,
      } as const;
    }

    const existingPlace = await prisma.orderProduct.findFirst({
      where: {
        id: placeId,
        orderRefId: orderId,
      },
      select: {id: true},
    });

    if (!existingPlace) {
      return {
        ok: false,
        message: 'Mekan bu siparişe ait degil',
      } as const;
    }

    const uploadedImages = await uploadOrderImagesToR2(
      submittedValues.images,
      orderId,
      placeId,
    );

    await prisma.orderItemProduct.create({
      data: {
        orderProduct: {
          connect: {id: placeId},
        },
        product: {
          connect: {id: submittedValues.product},
        },
        width: Number(submittedValues.width),
        length: Number(submittedValues.length),
        images: uploadedImages,
      },
    });

    const result = await syncOrderProductPrice(placeId);

    await syncOrderTotalPrice(orderId);

    revalidatePath(`/order/${orderId}`);
    return {
      ok: true,
      data: result,
      imageUrls: uploadedImages.map((image) => image.img),
    } as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mekan ürünu oluşturma basarisiz, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Updates an existing place-product, preserving selected old images,
 * deleting removed ones from storage, uploading new ones, and recalculating totals.
 */
export async function updatePlaceProduct(
  formData: FormData,
): Promise<PlaceActionResult<OrderProduct> & {imageUrls?: string[]}> {
  try {
    const orderId = formData.get('orderId');
    const placeId = formData.get('placeId');
    const orderItemProductId = formData.get('orderItemProductId');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }
    if (typeof placeId !== 'string' || !placeId) {
      return {ok: false, message: 'Mekan kimliği gereklidir'} as const;
    }
    if (typeof orderItemProductId !== 'string' || !orderItemProductId) {
      return {
        ok: false,
        message: 'Sipariş ürünu kayit kimliği gereklidir',
      } as const;
    }

    const submittedValues = getPlaceProductFormValues(formData);
    const keptExistingImageUrls = formData
      .getAll('existingImages')
      .filter((entry): entry is string => typeof entry === 'string' && !!entry);

    const validationResult = placeProductSchema.safeParse(submittedValues);
    if (!validationResult.success) {
      return {
        ok: false,
        message: validationResult.error.issues[0].message,
      } as const;
    }

    const existingPlace = await prisma.orderProduct.findFirst({
      where: {
        id: placeId,
        orderRefId: orderId,
      },
      select: {id: true},
    });

    if (!existingPlace) {
      return {
        ok: false,
        message: 'Mekan bu siparişe ait degil',
      } as const;
    }

    const existingOrderItemProduct = await prisma.orderItemProduct.findFirst({
      where: {
        id: orderItemProductId,
        orderProductRefId: placeId,
      },
      select: {
        images: true,
      },
    });

    if (!existingOrderItemProduct) {
      return {
        ok: false,
        message: 'Mekan ürünu bulunamadı',
      } as const;
    }

    const keptImageUrlSet = new Set(keptExistingImageUrls);
    const imagesToDelete = existingOrderItemProduct.images.filter(
      (image) => !keptImageUrlSet.has(image.img),
    );

    await Promise.allSettled(
      imagesToDelete.map((image) => deleteOrderImageFromR2(image.img)),
    );

    const uploadedImages = await uploadOrderImagesToR2(
      submittedValues.images,
      orderId,
      placeId,
    );

    const keptExistingImages = existingOrderItemProduct.images.filter((image) =>
      keptImageUrlSet.has(image.img),
    );

    const mergedImages = [...keptExistingImages, ...uploadedImages]
      .slice(0, 3)
      .map((image, index) => ({
        id: index + 1,
        img: image.img,
      }));

    await prisma.orderItemProduct.update({
      where: {
        id: orderItemProductId,
      },
      data: {
        product: {
          connect: {id: submittedValues.product},
        },
        width: Number(submittedValues.width),
        length: Number(submittedValues.length),
        images: mergedImages,
      },
    });

    const result = await syncOrderProductPrice(placeId);

    await syncOrderTotalPrice(orderId);

    revalidatePath(`/order/${orderId}`);
    return {
      ok: true,
      data: result,
      imageUrls: mergedImages.map((image) => image.img),
    } as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mekan ürünu güncelleme basarisiz, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Deletes one place-product row, removes its images from storage,
 * and updates place + order totals.
 */
export async function deletePlaceProduct(
  orderId: string,
  placeId: string,
  orderItemProductId: string,
  images: {id: number; img: string}[],
) {
  try {
    await prisma.orderItemProduct.delete({
      where: {
        id: orderItemProductId,
      },
    });

    const updatedPlace = await syncOrderProductPrice(placeId);

    await syncOrderTotalPrice(orderId);

    await Promise.allSettled(
      images.map((image) => deleteOrderImageFromR2(image.img)),
    );

    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: updatedPlace} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mekan ürünu silme basarisiz, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Creates a customer message for an order, optionally uploading one image,
 * then emits a realtime event for active subscribers.
 */
export async function sendMessageToOrder(formData: FormData) {
  try {
    const orderId = formData.get('orderId');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }
    const content = formData.get('content');
    if (typeof content !== 'string') {
      return {ok: false, message: 'Mesaj içeriği gereklidir'} as const;
    }

    const imageFile = formData.get('image');
    const uploadedImage =
      imageFile instanceof File && imageFile.size > 0
        ? await uploadImageToOrderMessagetoR2(imageFile, orderId)
        : null;

    if (!content && !uploadedImage) {
      return {ok: false, message: 'Mesaj veya görsel gereklidir'} as const;
    }

    const newMessage = await prisma.message.create({
      data: {
        orderRefId: orderId,
        content,
        creator: 'Customer',
        read: false,
        ...(uploadedImage ? {image: uploadedImage} : {}),
      },
    });

    // SSE event bus removed.

    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: newMessage} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mesaj gönderme başarısız, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Marks all unread messages in an order as read and broadcasts those ids
 * so connected clients can update UI state instantly.
 */
export async function markOrderMessagesAsRead(orderId: string) {
  try {
    if (!orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }

    const unreadMessages = await prisma.message.findMany({
      where: {
        orderRefId: orderId,
        read: false,
      },
      select: {
        id: true,
      },
    });

    const messageIds = unreadMessages.map((item) => item.id);
    if (messageIds.length === 0) {
      return {ok: true, data: [] as string[]} as const;
    }

    await prisma.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      data: {
        read: true,
      },
    });

    // SSE event bus removed.

    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: messageIds} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mesajlar okundu olarak işaretlenemedi, ${getErrorMessage(error)}`,
    } as const;
  }
}
