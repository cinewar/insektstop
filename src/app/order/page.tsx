import {prisma} from '@/lib/prisma';
import {createLoader, parseAsString, SearchParams} from 'nuqs/server';
import {OrderContent} from '../components/OrderContent';

const loadSearchParams = createLoader({
  q: parseAsString.withDefault(''),
});

type ProductsProps = {
  searchParams: SearchParams;
};

export default async function CreateOrder({searchParams}: ProductsProps) {
  const {q} = await loadSearchParams(searchParams);
  const order = await prisma.order.findFirst({
    where: {
      orderName: q,
    },
  });

  console.log(q, 'Search query from URL:', order);
  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <OrderContent order={order ?? undefined} />
    </div>
  );
}
