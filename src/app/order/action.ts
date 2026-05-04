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
type OrderAction = 'erstellt' | 'aktualisiert' | 'gelöscht' | 'abgeschlossen';

/**
 * Data required to compose and send order notification emails.
 */
type OrderNotificationPayload = {
  action: OrderAction;
  orderName: string;
  createrName: string;
  createrEmail: string;
  createrPhone: string;
  createrAddress: string;
  totalPrice: number;
};

/**
 * Builds the plain-text email body for order notifications.
 */
function buildOrderEmailHtml(payload: OrderNotificationPayload) {
  return `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Bestellung ${payload.action}</h2>
      <ul style="list-style:none; padding:0;">
        <li><strong>Bestellname:</strong> ${payload.orderName}</li>
        <li><strong>Kunde:</strong> ${payload.createrName}</li>
        <li><strong>E-Mail:</strong> ${payload.createrEmail}</li>
        <li><strong>Telefon:</strong> ${payload.createrPhone}</li>
        <li><strong>Adresse:</strong> ${payload.createrAddress}</li>
        <li><strong>Gesamtpreis:</strong> <span style="color:#1976d2;">£${payload.totalPrice.toFixed(2)}</span></li>
      </ul>
    </div>
  `;
}

/**
 * Builds the HTML email body for completed order details.
 */
function buildCompletedOrderEmailHtml(order: {
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
  return `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Bestellung abgeschlossen</h2>
      <ul style="list-style:none; padding:0;">
        <li><strong>Bestellname:</strong> ${order.orderName}</li>
        <li><strong>Kunde:</strong> ${order.createrName}</li>
        <li><strong>E-Mail:</strong> ${order.createrEmail}</li>
        <li><strong>Telefon:</strong> ${order.createrPhone}</li>
        <li><strong>Adresse:</strong> ${order.createrAddress}</li>
      </ul>
      <h3>Standort- und Produktdetails</h3>
      ${
        order.orderItems.length === 0
          ? '<p>- Noch keine Standorte/Produkte hinzugefügt.</p>'
          : `
            <table style="border-collapse:collapse; width:100%; margin-bottom:16px;">
              <thead>
                <tr>
                  <th style="border:1px solid #ccc; padding:8px;">Standort</th>
                  <th style="border:1px solid #ccc; padding:8px;">Standort Gesamt (£)</th>
                  <th style="border:1px solid #ccc; padding:8px;">Produkte</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems
                  .map(
                    (item) => `
                      <tr>
                        <td style="border:1px solid #ccc; padding:8px; vertical-align:top;">
                          ${item.name}
                        </td>
                        <td style="border:1px solid #ccc; padding:8px; vertical-align:top;">
                          £${item.price.toFixed(2)}
                        </td>
                        <td style="border:1px solid #ccc; padding:8px;">
                          ${
                            item.products.length === 0
                              ? '<em>Keine Produkte für diesen Standort hinzugefügt.</em>'
                              : `
                                <ul style="margin:0; padding-left:18px;">
                                  ${item.products
                                    .map(
                                      (productLink) => `
                                        <li>
                                          <strong>${productLink.product.name}</strong>
                                          | Maße: ${productLink.width}cm x ${productLink.length}cm
                                          | Einzelpreis: £${productLink.product.price.toFixed(2)}
                                        </li>
                                      `,
                                    )
                                    .join('')}
                                </ul>
                              `
                          }
                        </td>
                      </tr>
                    `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
      }
      <p><strong>Gesamtpreis:</strong> <span style="color:#1976d2;">£${order.totalPrice.toFixed(2)}</span></p>
    </div>
  `;
}

/**
 * Sends an order notification email via Resend when credentials are configured.
 */
async function sendResendEmail(payload: OrderNotificationPayload) {
  const user = await prisma.user.findFirst({});
  const recipients = [payload.createrEmail, user?.email];
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = recipients.filter((email): email is string => !!email);

  if (!apiKey || !from || to.length === 0) {
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
      to,
      subject: `Bestellung ${payload.action}: ${payload.orderName}`,
      html: buildOrderEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Resend-Anfrage fehlgeschlagen: ${response.status} ${errorText}`,
    );
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
    throw new Error('Ungültige Bestellformular-Daten');
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
      action: 'erstellt',
      orderName: result.orderName,
      createrName: result.createrName,
      createrEmail: result.createrEmail,
      createrPhone: result.createrPhone,
      createrAddress: result.createrAddress,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error('Resend-Benachrichtigung fehlgeschlagen:', error);
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
    throw new Error('Ungültige Bestellformular-Daten');
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
      action: 'aktualisiert',
      orderName: result.orderName,
      createrName: result.createrName,
      createrEmail: result.createrEmail,
      createrPhone: result.createrPhone,
      createrAddress: result.createrAddress,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error('Resend-Benachrichtigung fehlgeschlagen:', error);
  }

  return result;
}

/**
 * Deletes an order by ID and triggers notification email for the deleted record.
 */
export async function deleteOrder(id: string) {
  if (!id) {
    throw new Error('Löschvorgang erfordert eine Bestell-ID');
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
      action: 'gelöscht',
      orderName: result.orderName,
      createrName: result.createrName,
      createrEmail: result.createrEmail,
      createrPhone: result.createrPhone,
      createrAddress: result.createrAddress,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error('Resend-Benachrichtigung fehlgeschlagen:', error);
  }
  return result;
}

/**
 * Sends final order details email to customer when an order is completed.
 */
export async function finalizeOrder(id: string) {
  if (!id) {
    throw new Error('Abschlussvorgang erfordert eine Bestell-ID');
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
    throw new Error('Bestellung nicht gefunden');
  }

  const user = await prisma.user.findFirst({});

  const recipients = [order.createrEmail, user?.email].filter(
    (email): email is string => !!email,
  );
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from || recipients.length === 0) {
    throw new Error('E-Mail-Einstellungen fehlen');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `Bestellung abgeschlossen: ${order.orderName}`,
      html: buildCompletedOrderEmailHtml(order),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Letzte Detail-E-Mail fehlgeschlagen: ${response.status} ${errorText}`,
    );
  }

  revalidatePath(`/order/${id}`);
  return {ok: true} as const;
}
