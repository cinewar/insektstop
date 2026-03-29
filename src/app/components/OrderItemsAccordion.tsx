import type {OrderProductWithProducts} from '@/lib/prisma-types';
import Accordion, {AccordionItem} from './Accordion';
import Svg from './Svg';
import {VERTICALDOTSSVG} from '../utils/svg';
import Image from 'next/image';

type OrderItemsAccordionProps = {
  items: OrderProductWithProducts[];
};

export default function OrderItemsAccordion({items}: OrderItemsAccordionProps) {
  console.log('OrderItemsAccordion items:', items);
  const defaultImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ];

  const accordionItems: AccordionItem[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    content: (
      <>
        <div className='mt-2 flex flex-col gap-2'>
          {item.products.map((productLink) => (
            <div
              key={productLink.id}
              className='relative flex flex-col px-1 py-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] bg-white
              rounded-lg gap-2'
            >
              <Svg
                icon={VERTICALDOTSSVG}
                size={30}
                className='absolute top-1 right-1 cursor-pointer'
              />
              <div className='grid grid-cols-5 p-1'>
                <span className='col-span-3'>{productLink.product.name}</span>
                <span className='col-span-1'>{productLink.width}m</span>
                <span className='col-span-1'>{productLink.length}m</span>
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
