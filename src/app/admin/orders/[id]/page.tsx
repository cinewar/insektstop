import {GlassyButton} from '@/app/components/GlassyButton';
import {BACKSVG, HOMESVG} from '@/app/utils/svg';
import {prisma} from '@/lib/prisma';
import Link from 'next/link';
import {AdminPlaceContent} from './components/PlaceContent';
import {OrderItemProduct, OrderProduct} from '../../../../../generated/prisma';
import {OrderProductWithProducts} from '@/lib/prisma-types';

export default async function AdminOrderPlaces({
  params,
}: {
  params: {id: string} | Promise<{id: string}>;
}) {
  const {id: orderId} = await Promise.resolve(params);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: {
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      },
      messages: true,
    },
  });

  const orderItems = order?.orderItems ?? [];
  const messages = order?.messages ?? [];

  const accordionItems: OrderProductWithProducts[] = orderItems;

  return (
    <>
      <header
        className='bg-secondary/80 flex gap-4 max-w-120 shadow-lg
                justify-between items-center sticky top-0 w-full p-2 z-30'
      >
        <div
          className='pointer-events-auto bg-gray/90 backdrop-blur-sm 
                border border-white/30 rounded-full p-0.5 shadow-lg'
        >
          <Link href={'/admin/orders'}>
            <GlassyButton
              icon={BACKSVG}
              iconSize={40}
              className='[&>svg]:stroke-3'
            />
          </Link>
        </div>
        <div className='flex justify-between w-full gap-1 relative text-base font-bold text-dark-text'>
          <div className='flex w-full flex-col'>
            <span className='text-sm text-end text-tertiary mr-1'>Sipariş</span>
            <span className='bg-gray text-secondary rounded-full p-1 px-2'>
              {order?.orderName}
            </span>
          </div>
          <div className='flex w-full flex-col'>
            <span className='text-sm text-end text-tertiary mr-1'>
              Toplam Fiyat
            </span>
            <span className='bg-gray text-secondary rounded-full p-1 px-2'>
              £{order?.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </header>
      <div className='w-full max-w-md p-2 mx-auto bg-secondary rounded-2xl'>
        <AdminPlaceContent
          items={accordionItems}
          orderId={orderId}
          messages={messages}
        />
      </div>
    </>
  );
}
