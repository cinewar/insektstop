import {Search} from '../components/Search';
import {createLoader, parseAsString, SearchParams} from 'nuqs/server';

import products from '@/lib/products.json';
import {Card} from '../components/Card';
import Image from 'next/image';
import Svg from '../components/Svg';
import {RIGHTARROWSVG} from '../utils/svg';
import Link from 'next/link';
import {FilteredProductsDropdown} from '../components/FilteredProductsDropdown';

const loadSearchParams = createLoader({
  q: parseAsString.withDefault(''),
});

type ProductsProps = {
  searchParams: SearchParams;
};

export default async function Products({searchParams}: ProductsProps) {
  const {q} = await loadSearchParams(searchParams);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <div className='fixed h-28 px-3 pb-2 flex shadow-md items-end w-full max-w-120 bg-secondary z-20'>
        <div className='flex items-center w-full gap-2 relative'>
          <h1 className='text-2xl font-bold text-dark-text'>Products</h1>
          <Search />
          {q && filteredProducts.length !== 0 && (
            <FilteredProductsDropdown products={filteredProducts} />
          )}
        </div>
      </div>
      <div className='flex flex-col gap-4 mt-32 mb-4 px-4'>
        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className='relative'
            >
              <Card
                key={product.id}
                className='relative text-secondary flex items-end text-center z-10 before:z-0 before:absolute before:inset-0 
                before:bg-linear-to-t before:from-dark-text before:from-20% before:to-secondary/29 before:rounded-lg h-70 w-full rounded-lg shadow-md'
              >
                <h2 className='absolute font-bold shadow-lg top-2 right-2 bg-tertiary p-1 rounded-full'>
                  ${product.price.toFixed(2)}
                </h2>
                <div className='z-10 p-3'>
                  <div className='text-2xl pb-2 font-bold'>{product.name}</div>
                  <p className='line-clamp-3'>{product.description}</p>
                </div>
                <Image
                  src={product.images[0].img}
                  alt={product.images[0].alt || product.name}
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
