'use server';

import {randomBytes} from 'crypto';
import {revalidatePath} from 'next/cache';
import {prisma} from '@/lib/prisma';
import {getOrderFormValues, orderSchema} from './schema';
import {deleteOrderImageFromR2} from './[id]/functions';

const ORDER_NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Supported order lifecycle actions used in notification content.
 */
type OrderAction = 'created' | 'updated' | 'deleted' | 'completed';

/**
 * Data required to compose and send order notification emails.
 */
type OrderNotificationPayload = {
  action: OrderAction;
  orderName: string;
  orderId: number;
  createrName: string;
  createrEmail: string;
  createrPhone: string;
  createrAddress: string;
  totalPrice: number;
};

/**
 * Builds the plain-text email body for order notifications.
 */
function buildOrderEmailText(payload: OrderNotificationPayload) {
  return [
    `Sipariş ${payload.action}`,
    `Sipariş Adi: ${payload.orderName}`,
    `Sipariş ID: ${payload.orderId}`,
    `Müşteri: ${payload.createrName}`,
    `E-posta: ${payload.createrEmail}`,
    `Telefon: ${payload.createrPhone}`,
    `Adres: ${payload.createrAddress}`,
    `Toplam Fiyat: ${payload.totalPrice}`,
  ].join('\n');
}

/**
 * Builds the plain-text email body for completed order details.
 */
function buildCompletedOrderEmailText(order: {
  orderName: string;
  orderId: number;
  createrName: string;
  createrEmail: string;
  createrPhone: string;
  createrAddress: string;
  totalPrice: number;
  orderItems: Array<{
    name: string;
    price: number;
    products: Array<{
      width: number;
      length: number;
      product: {name: string; price: number};
    }>;
  }>;
}) {
  const lines = [
    'Sipariş tamamlandı. Son detaylar aşağıdadır:',
    '',
    `Sipariş Adi: ${order.orderName}`,
    `Sipariş ID: ${order.orderId}`,
    `Müşteri: ${order.createrName}`,
    `E-posta: ${order.createrEmail}`,
    `Telefon: ${order.createrPhone}`,
    `Adres: ${order.createrAddress}`,
    '',
    'Mekan ve Ürün Detayları:',
  ];

  if (order.orderItems.length === 0) {
    lines.push('- Henüz mekan/ürün eklenmedi.');
  } else {
    for (const item of order.orderItems) {
      lines.push(
        `- Mekan: ${item.name} | Mekan Toplamı: £${item.price.toFixed(2)}`,
      );

      if (item.products.length === 0) {
        lines.push('  - Ürün yok');
        continue;
      }

      for (const productLink of item.products) {
        lines.push(
          `  - ${productLink.product.name} | Ölçü: ${productLink.width}m x ${productLink.length}m | Birim Fiyat: £${productLink.product.price.toFixed(2)}`,
        );
      }
    }
  }

  lines.push('', `Toplam Fiyat: £${order.totalPrice.toFixed(2)}`);
  return lines.join('\n');
}

/**
 * Sends an order notification email via Resend when credentials are configured.
 */
async function sendResendEmail(payload: OrderNotificationPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = payload.createrEmail || process.env.RESEND_TO_EMAIL;

  if (!apiKey || !from || !to) {
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Sipariş ${payload.action}: ${payload.orderName}`,
      text: buildOrderEmailText(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend istegi basarisiz: ${response.status} ${errorText}`);
  }
}

/**
 * Generates an uppercase alphanumeric order name with cryptographically random bytes.
 */
function generateRandomOrderName(length = 10) {
  return Array.from(
    randomBytes(length),
    (byte) => ORDER_NAME_CHARS[byte % ORDER_NAME_CHARS.length],
  ).join('');
}

/**
 * Validates incoming form data, creates a new order record, and triggers notification email.
 */
export async function createOrder(formData: FormData) {
  const submittedValues = getOrderFormValues(formData);
  const validationResult = orderSchema.safeParse(submittedValues);

  if (!validationResult.success) {
    throw new Error('Gecersiz sipariş form verisi');
  }

  const orderId = Date.now();
  const orderName = generateRandomOrderName(10);

  const result = await prisma.order.create({
    data: {
      orderId,
      orderName,
      totalPrice: 0,
      createrName: submittedValues.name,
      createrEmail: submittedValues.email,
      createrPhone: submittedValues.phone,
      createrAddress: submittedValues.address,
      processStatus: 'pending',
    },
  });

  try {
    await sendResendEmail({
      action: 'created',
      orderName: result.orderName,
      orderId: result.orderId,
      createrName: result.createrName,
      createrEmail: result.createrEmail,
      createrPhone: result.createrPhone,
      createrAddress: result.createrAddress,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error('Resend bildirimi basarisiz:', error);
  }

  return result;
}

/**
 * Validates incoming form data, updates an existing order, and triggers notification email.
 */
export async function updateOrder(formData: FormData) {
  const submittedValues = getOrderFormValues(formData);
  const validationResult = orderSchema.safeParse(submittedValues);

  if (!validationResult.success) {
    throw new Error('Gecersiz sipariş form verisi');
  }

  const orderName = formData.get('orderName') as string;
  const id = formData.get('id') as string;

  const result = await prisma.order.update({
    where: {id},
    data: {
      orderName: orderName,
      createrName: submittedValues.name,
      createrEmail: submittedValues.email,
      createrPhone: submittedValues.phone,
      createrAddress: submittedValues.address,
    },
  });

  try {
    await sendResendEmail({
      action: 'updated',
      orderName: result.orderName,
      orderId: result.orderId,
      createrName: result.createrName,
      createrEmail: result.createrEmail,
      createrPhone: result.createrPhone,
      createrAddress: result.createrAddress,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error('Resend bildirimi basarisiz:', error);
  }

  return result;
}

/**
 * Deletes an order by ID and triggers notification email for the deleted record.
 */
export async function deleteOrder(id: string) {
  if (!id) {
    throw new Error('Silme islemi icin sipariş kimliği gereklidir');
  }

  const places = await prisma.orderProduct.findMany({
    where: {orderRefId: id},
    select: {
      id: true,
      products: {
        select: {images: true},
      },
    },
  });

  const allImages = places.flatMap((place) =>
    place.products.flatMap((item) => item.images),
  );

  const placeIds = places.map((place) => place.id);

  await prisma.orderItemProduct.deleteMany({
    where: {orderProductRefId: {in: placeIds}},
  });

  await prisma.orderProduct.deleteMany({
    where: {orderRefId: id},
  });

  // Find all messages for this order (with images)
  const messages = await prisma.message.findMany({
    where: {orderRefId: id},
    select: {image: true},
  });

  // Collect all message image URLs
  const messageImageUrls = messages
    .map((msg) => msg.image?.img)
    .filter((img): img is string => !!img);

  // Delete all message records
  await prisma.message.deleteMany({
    where: {orderRefId: id},
  });

  // Delete all order-related images (places/products)
  await Promise.allSettled(
    allImages.map((image) => deleteOrderImageFromR2(image.img)),
  );

  // Delete all message images from R2
  await Promise.allSettled(
    messageImageUrls.map((img) => deleteOrderImageFromR2(img)),
  );

  const result = await prisma.order.delete({
    where: {id},
  });

  try {
    await sendResendEmail({
      action: 'deleted',
      orderName: result.orderName,
      orderId: result.orderId,
      createrName: result.createrName,
      createrEmail: result.createrEmail,
      createrPhone: result.createrPhone,
      createrAddress: result.createrAddress,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error('Resend bildirimi basarisiz:', error);
  }
  return result;
}

/**
 * Sends final order details email to customer when an order is completed.
 */
export async function finalizeOrder(id: string) {
  if (!id) {
    throw new Error('Tamamlama islemi icin sipariş kimliği gereklidir');
  }

  const order = await prisma.order.findUnique({
    where: {id},
    include: {
      orderItems: {
        include: {
          products: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('Sipariş bulunamadı');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = order.createrEmail || process.env.RESEND_TO_EMAIL;

  if (!apiKey || !from || !to) {
    throw new Error('E-posta ayarları eksik');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Sipariş tamamlandı: ${order.orderName}`,
      text: buildCompletedOrderEmailText(order),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Son detay e-postası basarisiz: ${response.status} ${errorText}`,
    );
  }

  revalidatePath(`/order/${id}`);
  return {ok: true} as const;
}
