'use server';

import {randomBytes} from 'crypto';
import {prisma} from '@/lib/prisma';
import {getOrderFormValues, orderSchema} from './schema';
import {deleteOrderImageFromR2} from './[id]/functions';

const ORDER_NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Supported order lifecycle actions used in notification content.
 */
type OrderAction = 'created' | 'updated' | 'deleted';

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
    `Order ${payload.action}`,
    `Order Name: ${payload.orderName}`,
    `Order ID: ${payload.orderId}`,
    `Customer: ${payload.createrName}`,
    `Email: ${payload.createrEmail}`,
    `Phone: ${payload.createrPhone}`,
    `Address: ${payload.createrAddress}`,
    `Total Price: ${payload.totalPrice}`,
  ].join('\n');
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
      subject: `Order ${payload.action}: ${payload.orderName}`,
      text: buildOrderEmailText(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${errorText}`);
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
    throw new Error('Invalid order form data');
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
    console.error('Resend notification failed:', error);
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
    throw new Error('Invalid order form data');
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
    console.error('Resend notification failed:', error);
  }

  return result;
}

/**
 * Deletes an order by ID and triggers notification email for the deleted record.
 */
export async function deleteOrder(id: string) {
  if (!id) {
    throw new Error('Order ID is required for deletion');
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

  await Promise.allSettled(
    allImages.map((image) => deleteOrderImageFromR2(image.img)),
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
    console.error('Resend notification failed:', error);
  }
  return result;
}
