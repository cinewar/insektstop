'use client';

import type {OrderProductWithProducts} from '@/lib/prisma-types';
import Accordion, {AccordionItem} from './Accordion';
import {SETSVG, TRASHSVG} from '../utils/svg';
import Image from 'next/image';
import ActionMenu from './ActionMenu';
import {useState} from 'react';
import {Input} from './Input';
import {Select} from './Select';
import {Product} from '../../../generated/prisma';

type OrderItemsAccordionProps = {
  items: OrderProductWithProducts[];
  products: Product[];
};

export default function OrderItemsAccordion({
  items,
  products,
}: OrderItemsAccordionProps) {
  const [isAdd, setIsAdd] = useState(false);
  const defaultImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ];

  const accordionItems: AccordionItem[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    onAdd: () => setIsAdd(true),
    content: (
      <>
        <div className='mt-2 flex flex-col gap-2'>
          {isAdd && (
            <div
              className='relative flex flex-col px-1 py-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]
               bg-white rounded-lg gap-2'
            >
              <form className='grid grid-cols-5 gap-2 items-center p-1'>
                <Select
                  options={products.map((product) => ({
                    value: product.id,
                    label: product.name,
                  }))}
                  value=''
                  onChange={() => {}}
                  className='col-span-3'
                  placeholder='Select Product'
                />
                <Input className='col-span-1' />
                <Input className='col-span-1' />
              </form>
              <div className='flex gap-2 p-1'>
                {[...defaultImages].slice(0, 3).map((imageSrc, index) => (
                  <Image
                    key={`${index}`}
                    src={imageSrc || '/placeholder.png'}
                    alt={index.toString()}
                    width={200}
                    height={200}
                    className='aspect-square min-w-0 flex-1 object-cover rounded-lg shadow-lg'
                  />
                ))}
              </div>
            </div>
          )}

          {item.products.map((productLink) => (
            <div
              key={productLink.id}
              className='relative flex flex-col px-1 py-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] bg-white
              rounded-lg gap-2'
            >
              <div className='grid grid-cols-5 items-center p-1'>
                <span className='col-span-3'>{productLink.product.name}</span>
                <span className='col-span-1'>{productLink.width}m</span>
                <span className='col-span-1 flex items-center gap-2'>
                  {productLink.length}m{' '}
                  <ActionMenu
                    direction='vertical'
                    menuClassName='items-center -top-2 right-2'
                    actions={[
                      {
                        id: 'edit',
                        icon: SETSVG,
                        iconSize: 40,
                        onClick: () =>
                          console.log('Edit action clicked for item', item.id),
                      },
                      {
                        id: 'delete',
                        icon: TRASHSVG,
                        iconSize: 40,
                        onClick: () =>
                          console.log(
                            'Delete action clicked for item',
                            item.id,
                          ),
                      },
                    ]}
                  />
                </span>
              </div>
              <div className='flex gap-2 p-1'>
                {[
                  ...productLink.images.slice(0, 3).map((image) => image.img),
                  ...defaultImages,
                ]
                  .slice(0, 3)
                  .map((imageSrc, index) => (
                    <Image
                      key={`${productLink.id}-${index}`}
                      src={imageSrc || '/placeholder.png'}
                      alt={productLink.product.name}
                      width={200}
                      height={200}
                      className='aspect-square min-w-0 flex-1 object-cover rounded-lg shadow-lg'
                    />
                  ))}
              </div>

              <span>${productLink.product.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </>
    ),
  }));

  return (
    <Accordion
      items={accordionItems}
      className='mt-32 p-2 flex flex-col gap-2 w-full'
    />
  );
}
