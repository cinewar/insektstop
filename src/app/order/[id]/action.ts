'use server';

import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import type {Order, OrderProduct} from '../../../../generated/prisma/client';
import {getPlaceFormValues, placeSchema} from './schema';

/**
 * Standard result shape returned by place-related server actions.
 */
type PlaceActionResult<T> = {ok: true; data: T} | {ok: false; message: string};

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

    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: result} as const;
  } catch (error) {
    return {ok: false, message: `Failed to create place, ${error}`} as const;
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
    return {ok: false, message: `Failed to update place, ${error}`} as const;
  }
}

export async function deletePlace(orderId: string, placeId: string) {
  try {
    const result = await prisma.orderProduct.delete({
      where: {id: placeId},
    });
    revalidatePath(`/order/${orderId}`);
    return {ok: true, data: result} as const;
  } catch (error) {
    return {ok: false, message: `Failed to delete place, ${error}`} as const;
  }
}
