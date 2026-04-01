import {prisma} from '@/lib/prisma';
import OrderItemsAccordion from '../components/OrderItemsAccordion';

export default async function Order() {
  const products = await prisma.product.findMany();
  const order = await prisma.order.findFirst({
    where: {
      orderName: 'Sample Order',
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

  console.log('Order:', order);

  const orderItems = order?.orderItems ?? [];

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className='min-h-screen flex bg-secondary'>
      <div className='fixed h-28 px-3 pb-2 flex shadow-md items-end w-full max-w-120 bg-secondary z-20'>
        <div className='flex items-center justify-between w-full gap-2 relative text-lg font-bold text-dark-text'>
          <div className=''>Order: {order?.orderName}</div>
          <div>Total Price: ${totalPrice.toFixed(2)}</div>
        </div>
      </div>
      <OrderItemsAccordion items={orderItems} products={products} />
    </div>
  );
}
