'use server';

import {uploadImageToOrderMessagetoR2} from '@/app/order/[id]/functions';
import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';

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
 * Creates an admin message for an order, optionally uploading one image,
 * then emits a realtime event for active subscribers.
 */
export async function sendAdminMessageToOrder(formData: FormData) {
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
        creator: 'Admin',
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

export async function getMessages(orderId: string) {
  try {
    if (!orderId) {
      return {ok: false, message: 'Sipariş kimliği gereklidir'} as const;
    }

    const messages = await prisma.message.findMany({
      where: {
        orderRefId: orderId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {ok: true, data: messages} as const;
  } catch (error) {
    return {
      ok: false,
      message: `Mesajlar alınamadı, ${getErrorMessage(error)}`,
    } as const;
  }
}
