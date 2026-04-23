'use client';

import {AccordionWrapper} from '@/app/components/AccordionWrapper';
import {Order, ProcessStatus} from '../../../../../generated/prisma';
import {
  CLOSESVG,
  DOWNSVG,
  EDITSVG,
  EMAILSVG,
  HOURSGLASSESVG,
  INPROGRESSSVG,
  MAPSVG,
  OKSVG,
  PHONESVG,
  RIGHTARROWSVG,
  TRASHSVG,
  WHATSUPSVG,
} from '@/app/utils/svg';
import ActionMenu from '@/app/components/ActionMenu';
import Svg from '@/app/components/Svg';
import {useState} from 'react';
import {GlassyButton} from '@/app/components/GlassyButton';
import {Confirmation} from '@/app/components/Confirmation';
import {prisma} from '@/lib/prisma';
import {updateStatus} from '../action';
import {notify} from '@/app/lib/notifications';

interface OrderContentProps {
  orders: Order[];
}

type TitleProps = {
  order: Order;
  isOpen: boolean;
  setIsEdit: () => void;
  item: {onEdit?: () => void; onDelete?: () => void};
};

const Title: React.FC<TitleProps> = ({order, isOpen, setIsEdit, item}) => {
  const confirmation = {
    pending: 'Beklemede',
    in_progress: 'İşleniyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
  };
  const [showConfirmation, setShowConfirmation] = useState({
    type: '' as 'pending' | 'in_progress' | 'completed' | 'cancelled' | null,
    isVisible: false,
  });
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = (
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  ) => {
    setShowConfirmation({type: status, isVisible: true});
  };

  const handleConfirmStatusChange = async () => {
    setIsChangingStatus(true);
    const result = await updateStatus(
      order.id,
      showConfirmation.type as ProcessStatus,
    );
    if (!result.ok) {
      notify({
        type: 'error',
        title: 'Durum Güncelleme Hatası',
        message: result.message,
      });
      console.error('Error updating status:', result.message);
      setIsChangingStatus(false);
      setShowConfirmation({type: null, isVisible: false});
      return;
    }
    notify({
      type: 'success',
      title: 'Durum Güncellendi',
      message: result.message,
    });
    setIsChangingStatus(false);
    setShowConfirmation({type: null, isVisible: false});
  };
  return (
    <>
      <div className='relative w-full flex justify-between '>
        <div className='absolute text-xs -top-2 text-gray right-0'>
          {order.createdAt.toLocaleString('de-DE', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </div>
        <div className='flex-1 flex-col'>
          <div className='font-bold text-dark-text'>{order.orderName}</div>
          <div className='flex items-end gap-3'>
            <div className='text-base text-tertiary'>{order.createrName}</div>
            <span className='bg-tertiary text-center px-2 min-w-8 rounded-full text-base font-semibold text-white'>
              £{order.totalPrice}
            </span>
          </div>
        </div>
        <div className='flex'>
          {!isOpen && (
            <div>
              <ActionMenu
                actions={[
                  {
                    id: 'pending',
                    label: 'Beklemede',
                    icon: HOURSGLASSESVG,
                    iconSize: 40,
                    onClick: () => handleStatusChange('pending'),
                  },
                  {
                    label: 'İşleniyor',
                    id: 'in_progress',
                    icon: INPROGRESSSVG,
                    iconSize: 40,
                    onClick: () => handleStatusChange('in_progress'),
                  },
                  {
                    label: 'Tamamlandı',
                    id: 'completed',
                    icon: OKSVG,
                    iconSize: 40,
                    onClick: () => handleStatusChange('completed'),
                    className: '[&>svg]:stroke-3',
                  },
                  {
                    label: 'İptal',
                    id: 'cancelled',
                    icon: CLOSESVG,
                    iconSize: 40,
                    onClick: () => handleStatusChange('cancelled'),
                    className: '[&>svg]:stroke-red',
                  },
                ]}
              />
            </div>
          )}
          <Svg
            icon={DOWNSVG}
            size={40}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {showConfirmation.isVisible && (
        <Confirmation
          title='Sipariş Durumunu Değiştir'
          message={
            showConfirmation.type
              ? `Bu siparişi ${confirmation[showConfirmation.type]} durumuna getirmek istediginize emin misiniz?`
              : ''
          }
          onConfirmAction={handleConfirmStatusChange}
          onCancelAction={() =>
            setShowConfirmation({type: null, isVisible: false})
          }
          isLoading={isChangingStatus}
        />
      )}
    </>
  );
};

const Content: React.FC<{order: Order}> = ({order}) => {
  return (
    <div
      key={order.id}
      className='relative mt-2 flex flex-col pb-2 bg-white
              rounded-lg'
    >
      <div className='bg-white w-full rounded-lg p-3 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)]'>
        <div>
          <div className='text-sm text-tertiary'>Name & Surname:</div>
          <div>{order.createrName}</div>
        </div>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm text-tertiary'>Phone Number:</div>
            <div>{order.createrPhone}</div>
          </div>
          <div>
            <div
              className='pointer-events-auto flex gap-1 bg-gray/90 backdrop-blur-sm 
                    border border-white/30 rounded-full p-0.5 shadow-lg'
            >
              <GlassyButton icon={PHONESVG} iconSize={36} className='' />
              <GlassyButton icon={WHATSUPSVG} iconSize={36} className='' />
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm text-tertiary'>Address:</div>
            <div>{order.createrAddress}</div>
          </div>
          <div>
            <div
              className='pointer-events-auto flex gap-1 bg-gray/90 backdrop-blur-sm 
                    border border-white/30 rounded-full p-0.5 shadow-lg'
            >
              <GlassyButton
                icon={MAPSVG}
                iconSize={36}
                className='[&>svg]:fill-red'
              />
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm text-tertiary'>Email:</div>
            <div>{order.createrEmail}</div>
          </div>
          <div>
            <div
              className='pointer-events-auto flex gap-1 bg-gray/90 backdrop-blur-sm 
                    border border-white/30 rounded-full p-0.5 shadow-lg'
            >
              <GlassyButton icon={EMAILSVG} iconSize={36} className='' />
            </div>
          </div>
        </div>
        <div>
          <div className='text-sm text-tertiary'>Total Price:</div>
          <div>£{order.totalPrice}</div>
        </div>
        <div className='bg-gray p-2 float-end rounded-full mt-4 max-w-fit'>
          <GlassyButton
            icon={RIGHTARROWSVG}
            label='Siparişi Detayı Gör'
            iconSize={28}
            className='pr-4 gap-4'
            // onClick={() => router.push(`/order/${order.id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export function OrderContent({orders}: OrderContentProps) {
  const accordionItems = orders.map((order) => ({
    id: order.id,
    isOpen: false,
    processStatus: order.processStatus ?? undefined,
    title: (isOpen: boolean) => (
      <Title
        order={order}
        isOpen={isOpen}
        setIsEdit={() => {}}
        item={{onEdit: () => {}, onDelete: () => {}}}
      />
    ),
    content: <Content order={order} />,
  }));

  return (
    <div className=''>
      <AccordionWrapper items={accordionItems} />
    </div>
  );
}
