import {prisma} from '@/lib/prisma';

import {OrderContent} from './components/OrderContent';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({});

  return (
    <>
      <OrderContent orders={orders} />
    </>
  );
}
