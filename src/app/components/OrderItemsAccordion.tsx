'use client';

import type {OrderProductWithProducts} from '@/lib/prisma-types';
import Accordion, {AccordionItem} from './Accordion';
import {ADDSVG, OKSVG, SETSVG, TRASHSVG} from '../utils/svg';
import Image from 'next/image';
import ActionMenu from './ActionMenu';
import {useState} from 'react';
import {Product} from '../../../generated/prisma';
import {Modal} from './Modal';
import {PlaceForm} from '../order/[id]/components/PlaceForm';
import {GlassyButton} from './GlassyButton';
import PlaceProductForm from '../order/[id]/components/PlaceProductForm';

type OrderItemsAccordionProps = {
  orderId: string;
  items: OrderProductWithProducts[];
  products: Product[];
};

export default function OrderItemsAccordion({
  orderId,
  items,
  products,
}: OrderItemsAccordionProps) {
  const [isAdd, setIsAdd] = useState(false);
  const [placeModal, setPlaceModal] = useState<{
    modalType: 'edit' | 'delete';
    id: string;
    placeName: string;
  } | null>(null);
  const [placeProductModal, setPlaceProductModal] = useState<{
    modalType: 'create' | 'edit' | 'delete';
    placeId: string;
    placeName: string;
    productId?: string;
    productName?: string;
  } | null>(null);
  const defaultImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ];

  const accordionItems: AccordionItem[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    onAdd: () => setIsAdd(true),
    onEdit: () =>
      setPlaceModal({
        modalType: 'edit',
        id: item.id,
        placeName: item.name,
      }),
    onDelete: () => {
      setPlaceModal({
        modalType: 'delete',
        id: item.id,
        placeName: item.name,
      });
    },
    content: (
      <>
        <div className='flex flex-col gap-2'>
          {item.products.map((productLink) => (
            <>
              <div className='flex px-1 font-semibold py-2'>
                <span className='flex-3'>Product</span>
                <span className='flex-1'>Width(m)</span>
                <span className='flex-1'>Length(m)</span>
              </div>
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
                          onClick: () => {},
                        },
                        {
                          id: 'delete',
                          icon: TRASHSVG,
                          iconSize: 40,
                          onClick: () => {},
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
            </>
          ))}
          <div className='flex justify-end'>
            <span className='max-w-fit bg-gray rounded-full px-2 py-1 mt-2'>
              <GlassyButton
                icon={ADDSVG}
                iconSize={40}
                label='Add Product'
                className='[&>svg]:stroke-4 text-lg w-auto gap-4'
                onClick={() =>
                  setPlaceProductModal({
                    modalType: 'create',
                    placeId: item.id,
                    placeName: item.name,
                  })
                }
              />
            </span>
          </div>
        </div>
      </>
    ),
  }));

  return (
    <>
      <Accordion
        items={accordionItems}
        className='p-2 flex flex-col gap-2 w-full'
      />

      {placeModal ? (
        <Modal onClose={() => setPlaceModal(null)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='mb-2 text-lg font-bold'>
                {placeModal.modalType === 'delete'
                  ? 'Delete Place & Room'
                  : 'Edit a Place & Room'}
              </h2>
              <PlaceForm
                close={close}
                modalType={placeModal.modalType}
                orderId={orderId}
                placeId={placeModal.id}
                initialPlace={placeModal.placeName}
              />
            </div>
          )}
        </Modal>
      ) : null}

      {placeProductModal && (
        <Modal onClose={() => setPlaceProductModal(null)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='mb-2 text-lg font-bold'>
                Add Product to {placeProductModal.placeName}
              </h2>
              <PlaceProductForm
                close={close}
                modalType={placeProductModal.modalType}
                placeId={placeProductModal.placeId}
                orderId={orderId}
                placeName={placeProductModal.placeName}
                productId={placeProductModal.productId}
                productName={placeProductModal.productName}
                products={products}
              />
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
