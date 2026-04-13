'use client';

import {useState} from 'react';
import {finalizeOrder} from '@/app/order/action';
import {GlassyButton} from '@/app/components/GlassyButton';
import {Confirmation} from '@/app/components/Confirmation';
import {notify} from '@/app/lib/notifications';
import {OKSVG} from '@/app/utils/svg';

type FinishOrderButtonProps = {
  orderId: string;
  orderName?: string;
};

export function FinishOrderButton({
  orderId,
  orderName,
}: FinishOrderButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  async function handleConfirmFinish() {
    setIsFinishing(true);

    try {
      await finalizeOrder(orderId);
      notify({
        type: 'success',
        title: 'Sipariş tamamlandı',
        message: 'Son detaylar müşteriye gönderildi.',
      });
      setShowConfirmation(false);
    } catch {
      notify({
        type: 'error',
        title: 'Tamamlama basarisiz',
        message: 'Lütfen tekrar deneyin.',
      });
    } finally {
      setIsFinishing(false);
    }
  }

  return (
    <>
      <div className='fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none pb-[max(env(safe-area-inset-bottom),12px)]'>
        <div className='pointer-events-auto bg-gray/90 backdrop-blur-sm border border-white/30 rounded-full p-2 shadow-lg'>
          <GlassyButton
            label='Siparişi Bitir'
            icon={OKSVG}
            iconSize={36}
            className='min-w-56 pr-3'
            onClick={() => setShowConfirmation(true)}
          />
        </div>
      </div>
      {showConfirmation && (
        <Confirmation
          title='Siparişi Bitir'
          message={`${
            orderName
              ? `${orderName} siparişini tamamlamak`
              : 'Bu siparişi tamamlamak'
          } istediginize emin misiniz?`}
          onConfirmAction={handleConfirmFinish}
          onCancelAction={() => setShowConfirmation(false)}
          isLoading={isFinishing}
        />
      )}
    </>
  );
}
