import {prisma} from '@/lib/prisma';
import OrderItemsAccordion from '../../components/OrderItemsAccordion';
import {PlaceContent} from './components/PlaceContent';
import {FinishOrderButton} from './components/FinishOrderButton';

export default async function Order({
  params,
}: {
  params: {id: string} | Promise<{id: string}>;
}) {
  const {id: orderId} = await Promise.resolve(params);
  const products = await prisma.product.findMany();
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

  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <div className='fixed h-28 px-3 pb-0.5 flex shadow-md items-end w-full max-w-208.5 bg-secondary z-20'>
        <div className='flex justify-between w-full sm:max-w-fit gap-1 relative text-base font-bold text-dark-text'>
          <div className='flex w-full flex-col'>
            <span className='text-sm text-end text-tertiary mr-1'>Auftrag</span>
            <span className='bg-gray text-secondary rounded-full p-1 px-2'>
              {order?.orderName}
            </span>
          </div>
          <div className='flex w-full flex-col'>
            <span className='text-sm text-end text-tertiary mr-1'>
              Gesamtpreis
            </span>
            <span className='bg-gray text-secondary rounded-full p-1 px-2'>
              £{order?.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className='mt-28 pb-32'>
        <OrderItemsAccordion
          orderId={orderId}
          items={orderItems}
          products={products}
        />
        <PlaceContent messages={order?.messages ?? []} orderId={orderId} />
      </div>
      <FinishOrderButton orderId={orderId} orderName={order?.orderName} />
    </div>
  );
}
