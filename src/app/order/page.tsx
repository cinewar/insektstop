import {prisma} from '@/lib/prisma';
import {createLoader, parseAsString, SearchParams} from 'nuqs/server';
import {OrderContent} from '../components/OrderContent';

const loadSearchParams = createLoader({
  q: parseAsString.withDefault(''),
});

/**
 * Defines the ProductsProps type.
 * Usage: Use ProductsProps to type related values and keep data contracts consistent.
 */
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

  return (
    <div className='flex flex-col bg-secondary'>
      <OrderContent order={order ?? undefined} />
    </div>
  );
}
