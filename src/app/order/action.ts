'use server';

import {randomBytes} from 'crypto';
import {prisma} from '@/lib/prisma';
import {getOrderFormValues, orderSchema} from './schema';

const ORDER_NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateRandomOrderName(length = 10) {
  return Array.from(
    randomBytes(length),
    (byte) => ORDER_NAME_CHARS[byte % ORDER_NAME_CHARS.length],
  ).join('');
}

export async function createOrder(formData: FormData) {
  const submittedValues = getOrderFormValues(formData);
  const validationResult = orderSchema.safeParse(submittedValues);

  if (!validationResult.success) {
    throw new Error('Invalid order form data');
  }

  const orderId = Date.now();
  const orderName = generateRandomOrderName(10);

  const result = prisma.order.create({
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
  return result;
}

export async function updateOrder(formData: FormData) {
  const submittedValues = getOrderFormValues(formData);
  const validationResult = orderSchema.safeParse(submittedValues);

  if (!validationResult.success) {
    throw new Error('Invalid order form data');
  }

  const orderName = formData.get('orderName') as string;
  const id = formData.get('id') as string;

  const result = prisma.order.update({
    where: {id},
    data: {
      orderName: orderName,
      createrName: submittedValues.name,
      createrEmail: submittedValues.email,
      createrPhone: submittedValues.phone,
      createrAddress: submittedValues.address,
    },
  });
  return result;
}

export async function deleteOrder(id: string) {
  if (!id) {
    throw new Error('Order ID is required for deletion');
  }
  const result = prisma.order.delete({
    where: {id},
  });
  console.log('Deleted order with ID:', id);
  return result;
}
