import {Search} from '../components/Search';
import {createLoader, parseAsString, SearchParams} from 'nuqs/server';

import {Card} from '../components/Card';
import Image from 'next/image';
import Svg from '../components/Svg';
import {RIGHTARROWSVG} from '../utils/svg';
import Link from 'next/link';
import {SearchDropdown} from '../components/SearchDropdown';
import {prisma} from '@/lib/prisma';
import {normalizeImageUrl} from '@/lib/image-url';

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

export default async function Products({searchParams}: ProductsProps) {
  const products = await prisma.product.findMany({
    where: {active: true},
  });

  const {q} = await loadSearchParams(searchParams);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <div className='p-4 sm:pr-2 mt-14 sm:mt-18 sm:w-1/2'>
        <Search />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 px-4'>
        {filteredProducts.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className='relative'
            >
              <Card
                key={product.id}
                className='relative text-secondary flex items-end text-center z-10 before:z-0 before:absolute before:inset-0 
                before:bg-linear-to-t before:from-dark-text before:from-20% before:to-secondary/29 before:rounded-lg h-70 sm:h-90 w-full rounded-lg shadow-md'
              >
                <h2 className='absolute font-bold shadow-lg top-2 right-2 bg-tertiary p-1 rounded-full'>
                  £{product.price.toFixed(2)}
                </h2>
                <div className='z-10 p-3'>
                  <div className='text-2xl pb-2 font-bold'>{product.name}</div>
                  <p className='line-clamp-3'>{product.description}</p>
                </div>
                <Image
                  src={normalizeImageUrl(product.images[0].img)}
                  alt={product.name}
                  fill
                  className='object-cover rounded-lg -z-1'
                />
                <Svg
                  icon={RIGHTARROWSVG}
                  size={24}
                  className='absolute bottom-2 right-2 '
                />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
