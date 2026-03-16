import Image from 'next/image';
import products from '@/lib/products.json';
import {Card} from './Card';
import Svg from './Svg';
import {RIGHTARROWSVG} from '../utils/svg';
import Link from 'next/link';

export function Cards() {
  return (
    <div className='flex gap-3 w-full py-4 px-2 overflow-auto no-scrollbar'>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className='relative'
        >
          <Card key={product.id} className='relative'>
            <h2 className='absolute text-white font-bold shadow-lg top-2 right-2 bg-tertiary p-1 rounded-full'>
              ${product.price.toFixed(2)}
            </h2>
            <Image
              src={product.image}
              alt={product.name}
              width={200}
              height={200}
              className='rounded-lg'
            />
            <div className='p-2 h-30 justify-between flex flex-col'>
              <div className='font-bold mb-1'>
                <h2>{product.name}</h2>
                {/* <h2>${product.price.toFixed(2)}</h2> */}
              </div>
              <div className='flex items-end'>
                <p className='line-clamp-2'>{product.description}</p>
                <p>
                  <Svg icon={RIGHTARROWSVG} size={24} />
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
