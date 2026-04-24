'use client';

import {AccordionWrapper} from '@/app/components/AccordionWrapper';
import {Order, ProcessStatus} from '../../../../../generated/prisma';
import {
  CLEARSORTINGSVG,
  CLOSESVG,
  DOWNSVG,
  EMAILSVG,
  HOURSGLASSESVG,
  INPROGRESSSVG,
  MAPSVG,
  OKSVG,
  PHONESVG,
  RIGHTARROWSVG,
  SORTINGSVG,
  WHATSUPSVG,
} from '@/app/utils/svg';
import ActionMenu from '@/app/components/ActionMenu';
import Svg from '@/app/components/Svg';
import {useState} from 'react';
import {GlassyButton} from '@/app/components/GlassyButton';
import {Confirmation} from '@/app/components/Confirmation';
import {updateStatus} from '../action';
import {notify} from '@/app/lib/notifications';
import {Search} from '@/app/components/Search';
import {parseAsString, useQueryState} from 'nuqs';
import {useRouter} from 'next/navigation';

interface OrderContentProps {
  orders: Order[];
}

type TitleProps = {
  order: Order;
  isOpen: boolean;
  setIsEdit: () => void;
  item: {onEdit?: () => void; onDelete?: () => void};
};

const statusBg = {
  pending: 'bg-[#FFA500]', // yellow
  in_progress: 'bg-[#006AFF]', // blue
  completed: 'bg-[#59FF00]', // green
  cancelled: 'bg-red', // red
};

const sortingIconColors = {
  pending: '[&>svg]:fill-[#FFA500]',
  in_progress: '[&>svg]:fill-[#006AFF]',
  completed: '[&>svg]:fill-[#59FF00]',
  cancelled: '[&>svg]:fill-red',
  wipe: '[&>svg]:stroke-primary',
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
            <span
              className={`${order.processStatus ? statusBg[order.processStatus] : 'bg-tertiary'} text-center px-2 min-w-8 rounded-full text-base font-semibold text-white`}
            >
              £{order.totalPrice}
            </span>
          </div>
        </div>
        <div className='flex items-center'>
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
  const router = useRouter();
  const handleEmailClick = (emailAddress: string) => {
    const subject = encodeURIComponent('Merhaba');
    const body = encodeURIComponent(
      'Insektstop icin sizinle iletişime gecmek istiyorum.',
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`,
      '_blank',
    );
  };

  const handleWhatsAppClick = (whatsAppNumber: string) => {
    const message = encodeURIComponent(
      'Merhaba, Insektstop icin sizinle iletişime gecmek istiyorum.',
    );

    window.open(`https://wa.me/${whatsAppNumber}?text=${message}`, '_blank');
  };

  const handlePhoneClick = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleMapClick = (address: string) => {
    const query = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      '_blank',
    );
  };

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
              <GlassyButton
                icon={PHONESVG}
                iconSize={36}
                className=''
                onClick={() => handlePhoneClick(order.createrPhone)}
              />
              <GlassyButton
                icon={WHATSUPSVG}
                iconSize={36}
                className=''
                onClick={() => handleWhatsAppClick(order.createrPhone)}
              />
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
                onClick={() => handleMapClick(order.createrAddress)}
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
              <GlassyButton
                icon={EMAILSVG}
                iconSize={36}
                className=''
                onClick={() => handleEmailClick(order.createrEmail)}
              />
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
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export function OrderContent({orders}: OrderContentProps) {
  const [query] = useQueryState(
    'q',
    parseAsString.withOptions({shallow: false}),
  );
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsString.withOptions({shallow: false}),
  );
  console.log('Orders in OrderContent:', sort);
  const accordionItems = orders
    .filter((order) => {
      if (!sort) return true;
      return order.processStatus === sort;
    })
    .filter((order) => {
      if (!query) return true;
      const lowerQuery = query.toLowerCase();
      return (
        order.orderName.toLowerCase().includes(lowerQuery) ||
        order.createrName.toLowerCase().includes(lowerQuery)
      );
    })
    .map((order) => ({
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
    <div className='w-full max-w-md p-2 mx-auto bg-secondary rounded-2xl'>
      <div className='flex items-center gap-1 py-2'>
        <div className='w-full'>
          <Search placeholder='Siparişlerde Ara...' className='mb-4' />
        </div>
        <div
          className='pointer-events-auto flex gap-1 bg-gray/90 backdrop-blur-sm 
                    border border-white/30 rounded-full p-0.5 shadow-lg z-2'
        >
          <ActionMenu
            triggerIcon={SORTINGSVG}
            className={`rounded-full glassy-bg p-1 shadow-custom ${sortingIconColors[(sort ?? 'wipe') as keyof typeof sortingIconColors]} `}
            actions={[
              {
                id: 'pending',
                label: 'Beklemede',
                icon: HOURSGLASSESVG,
                iconSize: 40,
                className: '[&>svg]:fill-[#FFA500] ',
                onClick: () => setSort('pending'),
              },
              {
                label: 'İşleniyor',
                id: 'in_progress',
                icon: INPROGRESSSVG,
                iconSize: 40,
                className: '[&>svg]:stroke-[#006AFF]',
                onClick: () => setSort('in_progress'),
              },
              {
                label: 'Tamamlandı',
                id: 'completed',
                icon: OKSVG,
                iconSize: 40,
                onClick: () => setSort('completed'),
                className: '[&>svg]:stroke-3',
              },
              {
                label: 'İptal',
                id: 'cancelled',
                icon: CLOSESVG,
                iconSize: 40,
                onClick: () => setSort('cancelled'),
                className: '[&>svg]:stroke-red',
              },
              {
                label: 'Temizle',
                id: 'wipe',
                icon: CLEARSORTINGSVG,
                iconSize: 40,
                onClick: () => setSort(null),
                className: '[&>svg]:stroke-red',
              },
            ]}
          />
        </div>
      </div>
      <AccordionWrapper items={accordionItems} />
    </div>
  );
}
