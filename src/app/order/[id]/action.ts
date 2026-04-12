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
import {deleteOrderImageFromR2, uploadOrderImagesToR2} from './functions';

/**
 * Standard result shape returned by place-related server actions.
 */
type PlaceActionResult<T> = {ok: true; data: T} | {ok: false; message: string};

/**
 * Describes behavior for getErrorMessage.
 * Usage: Call getErrorMessage(...) where this declaration is needed in the current module flow.
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
 * Describes behavior for syncOrderProductPrice.
 * Usage: Call syncOrderProductPrice(...) where this declaration is needed in the current module flow.
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
    throw new Error('Order product not found while syncing price');
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
 * Describes behavior for syncOrderTotalPrice.
 * Usage: Call syncOrderTotalPrice(...) where this declaration is needed in the current module flow.
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
    throw new Error('Order not found while syncing total price');
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
      return {ok: false, message: 'Order ID is required'} as const;
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
      message: `Failed to create place, ${getErrorMessage(error)}`,
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
      return {ok: false, message: 'Place ID is required'} as const;
    }

    const orderId = formData.get('id');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Order ID is required'} as const;
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
      message: `Failed to update place, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Describes behavior for deletePlace.
 * Usage: Call deletePlace(...) where this declaration is needed in the current module flow.
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
      message: `Failed to delete place, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Describes behavior for createPlaceProduct.
 * Usage: Call createPlaceProduct(...) where this declaration is needed in the current module flow.
 */
export async function createPlaceProduct(
  formData: FormData,
): Promise<PlaceActionResult<OrderProduct> & {imageUrls?: string[]}> {
  try {
    const orderId = formData.get('orderId');
    const placeId = formData.get('placeId');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Order ID is required'} as const;
    }
    if (typeof placeId !== 'string' || !placeId) {
      return {ok: false, message: 'Place ID is required'} as const;
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
        message: 'Place does not belong to this order',
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
      message: `Failed to create place product, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Describes behavior for updatePlaceProduct.
 * Usage: Call updatePlaceProduct(...) where this declaration is needed in the current module flow.
 */
export async function updatePlaceProduct(
  formData: FormData,
): Promise<PlaceActionResult<OrderProduct> & {imageUrls?: string[]}> {
  try {
    const orderId = formData.get('orderId');
    const placeId = formData.get('placeId');
    const orderItemProductId = formData.get('orderItemProductId');
    if (typeof orderId !== 'string' || !orderId) {
      return {ok: false, message: 'Order ID is required'} as const;
    }
    if (typeof placeId !== 'string' || !placeId) {
      return {ok: false, message: 'Place ID is required'} as const;
    }
    if (typeof orderItemProductId !== 'string' || !orderItemProductId) {
      return {ok: false, message: 'Order item product ID is required'} as const;
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
        message: 'Place does not belong to this order',
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
        message: 'Place product not found',
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
      message: `Failed to update place product, ${getErrorMessage(error)}`,
    } as const;
  }
}

/**
 * Describes behavior for deletePlaceProduct.
 * Usage: Call deletePlaceProduct(...) where this declaration is needed in the current module flow.
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
      message: `Failed to delete place product, ${getErrorMessage(error)}`,
    } as const;
  }
}
