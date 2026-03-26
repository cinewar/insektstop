import {prisma} from '@/lib/prisma';

export default async function Order() {
  const order = await prisma.order.findFirst({
    where: {
      orderName: 'Sample Order',
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log('Order:', order);
  return (
    <div className='min-h-screen flex items-center justify-center bg-secondary'>
      <h1 className='text-4xl font-bold text-dark-text'>Order</h1>
    </div>
  );
}
