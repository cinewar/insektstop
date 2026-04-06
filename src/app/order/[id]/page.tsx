import {prisma} from '@/lib/prisma';
import OrderItemsAccordion from '../../components/OrderItemsAccordion';
import {PlaceContent} from './components/PlaceContent';

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
    },
  });

  const orderItems = order?.orderItems ?? [];
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <div className='fixed h-28 px-3 pb-2 flex shadow-md items-end w-full max-w-120 bg-secondary z-20'>
        <div className='flex items-center justify-between w-full gap-2 relative text-lg font-bold text-dark-text'>
          <div className=''>Order: {order?.orderName}</div>
          <div>Total Price: ${totalPrice.toFixed(2)}</div>
        </div>
      </div>
      <div className='mt-28'>
        <OrderItemsAccordion
          orderId={orderId}
          items={orderItems}
          products={products}
        />
        <PlaceContent orderId={orderId} />
      </div>
    </div>
  );
}
