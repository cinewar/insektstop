'use client';

import {useEffect, useState} from 'react';
import {finalizeOrder} from '@/app/order/action';
import {GlassyButton} from '@/app/components/GlassyButton';
import {Confirmation} from '@/app/components/Confirmation';
import {notify} from '@/app/lib/notifications';
import {OKSVG} from '@/app/utils/svg';
import {usePathname} from 'next/navigation';

type FinishOrderButtonProps = {
  orderId: string;
  orderName?: string;
};

export function FinishOrderButton({
  orderId,
  orderName,
}: FinishOrderButtonProps) {
  const path = usePathname();
  const pathParts = path.split('/').filter(Boolean);
  const isOrderDetailPage =
    pathParts.length === 2 && pathParts[0] === 'order' && pathParts[1] !== null;

  const [aboveFooter, setAboveFooter] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 120;
      setAboveFooter(scrollPosition >= threshold);
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll(); // check on mount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

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
      <div
        className={`fixed inset-x-0 bottom-4 z-30 flex justify-center pointer-events-none
              transition-transform duration-300 ${aboveFooter && isOrderDetailPage ? '-translate-y-16' : ''}`}
      >
        <div className='pointer-events-auto bg-gray/90 backdrop-blur-sm border border-white/30 rounded-full p-2 shadow-lg'>
          <GlassyButton
            label='Siparişi Bitir'
            icon={OKSVG}
            iconSize={36}
            className='gap-1 [&>svg]:stroke-4'
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
