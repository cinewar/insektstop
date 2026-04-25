'use client';

import {AccordionWrapper} from '@/app/components/AccordionWrapper';
import {EnlargedImageGalery} from '@/app/components/EnlargedImageGalery';
import Svg from '@/app/components/Svg';
import {DOWNSVG} from '@/app/utils/svg';
import {normalizeImageUrl} from '@/lib/image-url';
import {OrderProductWithProducts} from '@/lib/prisma-types';
import Image from 'next/image';
import {useState} from 'react';

interface PlaceContentProps {
  items: OrderProductWithProducts[];
}

type TitleProps = {
  orderItem: OrderProductWithProducts;
  isOpen?: boolean;
};

const Title: React.FC<TitleProps> = ({orderItem, isOpen}) => {
  return (
    <>
      <div className='relative w-full flex items-center justify-between '>
        {!isOpen && orderItem.price !== undefined && (
          <div className='absolute -bottom-3 left-0 text-sm text-tertiary font-semibold'>
            £{orderItem.price.toFixed(2)}
          </div>
        )}
        <div className='font-bold text-dark-text'>{orderItem.name}</div>
        <Svg
          icon={DOWNSVG}
          size={40}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
    </>
  );
};

const Content = ({
  orderItem,
  handleEnlargedGallery,
}: {
  orderItem: OrderProductWithProducts;
  handleEnlargedGallery: (images: string[], currentIndex: number) => void;
}) => {
  const defaultImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ];
  return (
    <div className='flex mt-2 flex-col gap-2'>
      {orderItem.products.map((productLink) => (
        <div
          key={productLink.id}
          className='relative flex flex-col pb-2 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)] bg-white
                  rounded-lg'
        >
          <div className='flex px-2 text-secondary font-semibold bg-gray rounded-t-lg'>
            <span className='flex-3'>Urun</span>
            <span className='flex-1'>Genislik(m)</span>
            <span className='flex-1'>Uzunluk(m)</span>
          </div>
          <div className='p-1 flex flex-col gap-2'>
            <div className='grid grid-cols-5 items-center px-1'>
              <span className='col-span-3'>{productLink.product.name}</span>
              <span className='col-span-1'>{productLink.width}m</span>
              <span className='col-span-1 flex items-center gap-2'>
                {productLink.length}m{' '}
              </span>
            </div>
            <div className='flex gap-2 p-1'>
              {[
                ...productLink.images
                  .slice(0, 3)
                  .map((image) => normalizeImageUrl(image.img)),
                ...defaultImages,
              ]
                .slice(0, 3)
                .map((imageSrc, index) => (
                  <Image
                    onClick={() => {
                      if (imageSrc === '/placeholder.png') return;
                      handleEnlargedGallery(
                        productLink.images.map((image) =>
                          normalizeImageUrl(image.img),
                        ),
                        index,
                      );
                    }}
                    key={`${productLink.id}-${index}`}
                    src={imageSrc || '/placeholder.png'}
                    alt={productLink.product.name}
                    width={200}
                    height={200}
                    className='aspect-square min-w-0 flex-1 object-cover rounded-lg shadow-lg'
                  />
                ))}
            </div>
            <span
              className='bg-gray max-w-max py-1 px-3 text-secondary text-base rounded-full
                        font-semibold ml-1'
            >
              fiyat: £{productLink.product.price.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export function AdminPlaceContent({items}: PlaceContentProps) {
  const [enlargedGallery, setEnlargedGallery] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);
  function handleEnlargedGallery(images: string[], currentIndex: number) {
    setEnlargedGallery({images, currentIndex});
  }

  const accordionItems = items.map((item) => ({
    id: item.id,
    title: (isOpen: boolean) => <Title orderItem={item} isOpen={isOpen} />,
    content: () => (
      <Content orderItem={item} handleEnlargedGallery={handleEnlargedGallery} />
    ),
  }));
  console.log('Accordion Items:', accordionItems);
  return (
    <>
      <div className='flex w-full flex-col'>
        <AccordionWrapper items={accordionItems} />
      </div>
      {enlargedGallery && (
        <EnlargedImageGalery
          images={enlargedGallery.images}
          onCloseAction={() => setEnlargedGallery(null)}
          currentIndex={enlargedGallery.currentIndex}
        />
      )}
    </>
  );
}
