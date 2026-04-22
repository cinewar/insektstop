'use client';

import {AccordionWrapper} from '@/app/components/AccordionWrapper';
import {Order} from '../../../../../generated/prisma';
import {DOWNSVG, EDITSVG, RIGHTARROWSVG, TRASHSVG} from '@/app/utils/svg';
import ActionMenu from '@/app/components/ActionMenu';
import Svg from '@/app/components/Svg';
import {useState} from 'react';
import {GlassyButton} from '@/app/components/GlassyButton';

interface OrderContentProps {
  orders: Order[];
}

type TitleProps = {
  order: Order;
  isOpen: boolean;
  setIsEdit: () => void;
  item: {onEdit?: () => void; onDelete?: () => void};
};

const processStatusColor = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const Title: React.FC<TitleProps> = ({order, isOpen, setIsEdit, item}) => {
  return (
    <div className='relative w-full flex justify-between'>
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
          <ActionMenu
            actions={[
              {
                id: 'edit',
                label: 'Edit',
                icon: EDITSVG,
                iconSize: 40,
                onClick: () => {
                  // setIsEdit(true);
                  item.onEdit?.();
                },
              },
              {
                label: 'Delete',
                id: 'delete',
                icon: TRASHSVG,
                iconSize: 40,
                onClick: item.onDelete,
              },
            ]}
          />
        )}
        <Svg
          icon={DOWNSVG}
          size={40}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
    </div>
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
        <div>
          <div className='text-sm text-tertiary'>Phone Number:</div>
          <div>{order.createrPhone}</div>
        </div>
        <div>
          <div className='text-sm text-tertiary'>Address:</div>
          <div>{order.createrAddress}</div>
        </div>
        <div>
          <div className='text-sm text-tertiary'>Email:</div>
          <div>{order.createrEmail}</div>
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
    <>
      <AccordionWrapper items={accordionItems} />
    </>
  );
}
