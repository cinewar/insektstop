'use client';

import Svg from '@/app/components/Svg';
import {Product} from '../../../../../generated/prisma';
import {PRODUCTSSVG, RIGHTARROWSVG, SORTINGSVG} from '@/app/utils/svg';
import Image from 'next/image';
import Link from 'next/link';
import {Search} from '@/app/components/Search';
import {parseAsString, useQueryState} from 'nuqs';
import {Button} from '@/app/components/Button';
import {useState} from 'react';
import {Modal} from '@/app/components/Modal';
import {ProductForm} from './ProductForm';
import {GlassyButton} from '@/app/components/GlassyButton';
import ActionMenu from '@/app/components/ActionMenu';

interface AdminProductContentProps {
  products: Product[];
}

export function AdminProductContent({products}: AdminProductContentProps) {
  const [activeProduct, setActiveProduct] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [query] = useQueryState(
    'q',
    parseAsString.withOptions({shallow: false}),
  );
  return (
    <>
      <div className='px-2 sm:px-16 text-dark-text mt-2 flex flex-col gap-2'>
        <div className='flex items-center gap-1 py-2'>
          <div className='w-full sm:w-1/2 flex'>
            <Search placeholder='In Produkten suchen…' className='mb-4' />
          </div>

          <div
            className='pointer-events-auto flex gap-1 bg-gray/90 backdrop-blur-sm 
                              border border-white/30 rounded-full p-0.5 shadow-lg z-2'
          >
            <ActionMenu
              triggerIcon={SORTINGSVG}
              className={`rounded-full glassy-bg p-1 shadow-custom ${activeProduct ? '[&>svg]:fill-primary' : '[&>svg]:fill-dark-text'} `}
              actions={[
                {
                  label: 'Aktive',
                  id: 'active',
                  icon: PRODUCTSSVG,
                  iconSize: 40,
                  onClick: () => setActiveProduct(true),
                  className: '[&>svg]:fill-primary',
                },
                {
                  label: 'Gelöschte',
                  id: 'wipe',
                  icon: PRODUCTSSVG,
                  iconSize: 40,
                  onClick: () => setActiveProduct(false),
                  className: '[&>svg]:fill-dark-text',
                },
              ]}
            />
          </div>
        </div>

        {products
          .filter((product) => product.active === activeProduct)
          .filter((product) =>
            product.name.toLowerCase().includes((query ?? '').toLowerCase()),
          )
          .map((product) => (
            <Link
              href={`/admin/products/${product.id}`}
              className={`flex justify-between w-full  text-base font-semibold rounded-lg 
                    ${activeProduct ? 'shadow-[0_0_4px_rgba(255,71,249,0.45)]' : 'shadow-[0_0_4px_rgba(0,0,0,0.45)]'} 
                    p-1 pr-2 bg-white`}
              key={product.id}
            >
              <div className='flex items-center gap-2'>
                <Image
                  src={product.images[0]?.img || '/placeholder.png'}
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
        {activeProduct && (
          <div className='flex justify-center mt-4'>
            <Button
              className='shining px-10 active:scale-95 transition-all'
              onClick={() => {
                setShowModal(true);
              }}
            >
              Produkt hinzufügen
            </Button>
          </div>
        )}
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='text-lg font-bold mb-2'>Produkt hinzufügen</h2>
              <ProductForm close={close} type='create' />
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
