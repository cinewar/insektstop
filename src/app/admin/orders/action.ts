'use server';

import {prisma} from '@/lib/prisma';
import {ProcessStatus} from '../../../../generated/prisma';
import {revalidatePath} from 'next/cache';

const confirmation = {
  pending: 'Beklemede',
  in_progress: 'İşleniyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export async function updateStatus(orderId: string, newStatus: string) {
  if (
    !['pending', 'in_progress', 'completed', 'cancelled'].includes(newStatus) ||
    !orderId
  ) {
    return {
      ok: false,
      message: 'Geçersiz sipariş durumu veya geçersiz sipariş ID',
    } as const;
  }

  const response = await prisma.order.update({
    where: {id: orderId},
    data: {processStatus: newStatus as ProcessStatus},
  });
  if (!response) {
    return {
      ok: false,
      message: 'Sipariş güncellenirken bir hata oluştu',
    } as const;
  }
  revalidatePath('/admin/orders');
  return {
    ok: true,
    message: `Sipariş durumu başarıyla ${confirmation[newStatus as keyof typeof confirmation]} durumuna güncellendi`,
  } as const;
}
