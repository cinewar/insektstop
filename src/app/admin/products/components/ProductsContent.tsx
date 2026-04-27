'use client';

import Svg from '@/app/components/Svg';
import {Product} from '../../../../../generated/prisma';
import {RIGHTARROWSVG} from '@/app/utils/svg';
import Image from 'next/image';
import Link from 'next/link';
import {Search} from '@/app/components/Search';
import {parseAsString, useQueryState} from 'nuqs';
import {Button} from '@/app/components/Button';

interface AdminProductContentProps {
  products: Product[];
}

export function AdminProductContent({products}: AdminProductContentProps) {
  const [query] = useQueryState(
    'q',
    parseAsString.withOptions({shallow: false}),
  );
  return (
    <>
      <div className='px-2 text-dark-text mt-2 flex flex-col gap-2'>
        <div className='w-full'>
          <Search placeholder='Ürünlerde Ara...' className='mb-4' />
        </div>
        {products
          .filter((product) =>
            product.name.toLowerCase().includes((query ?? '').toLowerCase()),
          )
          .map((product) => (
            <Link
              href={`/admin/products/${product.id}`}
              className='flex justify-between w-full  text-base font-semibold rounded-lg shadow-[0_0_4px_rgba(255,71,249,0.45)] p-1 pr-2 bg-white'
              key={product.id}
            >
              <div className='flex items-center gap-2'>
                <Image
                  src={product.images[0].img}
                  alt={product.name}
                  width={50}
                  height={50}
                  className='object-cover aspect-square rounded-lg shadow-md'
                />
                <h2>{product.name}</h2>
              </div>
              <Svg
                icon={RIGHTARROWSVG}
                className='text-primary stroke-2'
                size={28}
              />
            </Link>
          ))}
        <div className='flex justify-center mt-4'>
          <Button
            className='shining px-10'
            // onClick={() => {
            //   setModalType('create');
            //   setShowModal(true);
            // }}
          >
            Ürün Ekle
          </Button>
        </div>
      </div>
    </>
  );
}
