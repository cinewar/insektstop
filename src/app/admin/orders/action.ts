'use server';

import {prisma} from '@/lib/prisma';
import {ProcessStatus} from '../../../../generated/prisma';
import {revalidatePath} from 'next/cache';

const confirmation = {
  pending: 'Ausstehend',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
};

export async function updateStatus(orderId: string, newStatus: string) {
  if (
    !['pending', 'in_progress', 'completed', 'cancelled'].includes(newStatus) ||
    !orderId
  ) {
    return {
      ok: false,
      message: 'Ungültiger Bestellstatus oder ungültige Bestell-ID',
    } as const;
  }

  const response = await prisma.order.update({
    where: {id: orderId},
    data: {processStatus: newStatus as ProcessStatus},
  });
  if (!response) {
    return {
      ok: false,
      message: 'Fehler beim Aktualisieren der Bestellung',
    } as const;
  }
  revalidatePath('/admin/orders');
  return {
    ok: true,
    message: `Bestellstatus erfolgreich auf ${confirmation[newStatus as keyof typeof confirmation]} aktualisiert`,
  } as const;
}
