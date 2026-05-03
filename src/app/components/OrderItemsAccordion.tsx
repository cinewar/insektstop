'use client';

import type {OrderProductWithProducts} from '@/lib/prisma-types';
import Accordion, {AccordionItem} from './Accordion';
import {ADDSVG, SETSVG, TRASHSVG} from '../utils/svg';
import Image from 'next/image';
import ActionMenu from './ActionMenu';
import {useState} from 'react';
import {Product} from '../../../generated/prisma';
import {Modal} from './Modal';
import {PlaceForm} from '../order/[id]/components/PlaceForm';
import {GlassyButton} from './GlassyButton';
import PlaceProductForm from '../order/[id]/components/PlaceProductForm';
import {EnlargedImageGalery} from './EnlargedImageGalery';
import {normalizeImageUrl} from '@/lib/image-url';
import {deletePlaceProduct} from '../order/[id]/action';
import {notify} from '../lib/notifications';
import {Confirmation} from './Confirmation';

/**
 * Defines the OrderItemsAccordionProps type.
 * Usage: Use OrderItemsAccordionProps to type related values and keep data contracts consistent.
 */
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
    orderItemProductId?: string;
    productId?: string;
    productName?: string;
    width?: number;
    length?: number;
    images?: string[];
  } | null>(null);
  const [enlargedGallery, setEnlargedGallery] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);
  const [placeProductDeleteConfirmation, setPlaceProductDeleteConfirmation] =
    useState<{
      placeId: string;
      placeName: string;
      orderItemProductId: string;
      productName: string;
      images: string[];
    } | null>(null);
  const [isDeletingPlaceProduct, setIsDeletingPlaceProduct] = useState(false);
  const defaultImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ];

  /**
   * Describes behavior for handleImageGallery.
   * Usage: Call handleImageGallery(...) where this declaration is needed in the current module flow.
   */
  function handleImageGallery(images: string[], currentIndex: number) {
    setEnlargedGallery({images, currentIndex});
  }

  /**
   * Describes behavior for handleDeletePlaceProduct.
   * Usage: Call handleDeletePlaceProduct(...) where this declaration is needed in the current module flow.
   */
  async function handleDeletePlaceProduct(
    orderItemProductId: string,
    placeId: string,
    images: string[],
  ) {
    setIsDeletingPlaceProduct(true);

    try {
      await deletePlaceProduct(
        orderId,
        placeId,
        orderItemProductId,
        images.map((img, index) => ({id: index + 1, img})),
      );

      notify({
        type: 'success',
        message: 'Product deleted successfully.',
        title: 'Success',
      });
      setPlaceProductDeleteConfirmation(null);
    } catch (error) {
      notify({
        type: 'error',
        message: 'An error occurred while deleting the product.',
        title: 'Error',
      });
    } finally {
      setIsDeletingPlaceProduct(false);
    }
  }

  const accordionItems: AccordionItem[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    price: item.price,
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
        <div className='flex mt-2 flex-col gap-2'>
          {item.products.map((productLink) => (
            <div
              key={productLink.id}
              className='relative flex flex-col pb-2 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)] bg-white
              rounded-lg'
            >
              <div className='flex px-2 text-secondary font-semibold bg-gray rounded-t-lg'>
                <span className='flex-3'>Produkt</span>
                <span className='flex-1'>Breite(cm)</span>
                <span className='flex-1'>Länge(cm)</span>
              </div>
              <div className='p-1 flex flex-col gap-2'>
                <div className='grid grid-cols-5 items-center px-1'>
                  <span className='col-span-3'>{productLink.product.name}</span>
                  <span className='col-span-1'>{productLink.width}cm</span>
                  <span className='col-span-1 flex items-center gap-2'>
                    {productLink.length}cm{' '}
                    <ActionMenu
                      className='ml-auto'
                      actions={[
                        {
                          id: 'edit',
                          icon: SETSVG,
                          label: 'Bearbeiten',
                          iconSize: 40,
                          onClick: () => {
                            setPlaceProductModal({
                              modalType: 'edit',
                              placeId: item.id,
                              placeName: item.name,
                              orderItemProductId: productLink.id,
                              productId: productLink.product.id,
                              width: productLink.width,
                              length: productLink.length,
                              images: productLink.images.map((image) =>
                                normalizeImageUrl(image.img),
                              ),
                            });
                          },
                        },
                        {
                          id: 'delete',
                          icon: TRASHSVG,
                          label: 'Löschen',
                          iconSize: 40,
                          onClick: () => {
                            setPlaceProductDeleteConfirmation({
                              placeId: item.id,
                              placeName: item.name,
                              orderItemProductId: productLink.id,
                              productName: productLink.product.name,
                              images: productLink.images.map((image) =>
                                normalizeImageUrl(image.img),
                              ),
                            });
                          },
                        },
                      ]}
                    />
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

                          handleImageGallery(
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
                  Preis: £
                  {(
                    productLink.product.price *
                    (productLink.width / 100) *
                    (productLink.length / 100)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          <div className='flex justify-end'>
            <span className='max-w-fit bg-gray/90 backdrop-blur-sm border border-white/30 rounded-full p-2 mt-2 shadow-lg'>
              <GlassyButton
                icon={ADDSVG}
                iconSize={40}
                label='Produkt hinzufügen'
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
        className='p-2 sm:px-12 flex flex-col gap-2 w-full'
      />

      {placeModal ? (
        <Modal onClose={() => setPlaceModal(null)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='mb-2 text-lg font-bold'>
                {placeModal.modalType === 'delete'
                  ? 'Standort löschen'
                  : 'Standort bearbeiten'}{' '}
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
                {placeProductModal.modalType === 'edit'
                  ? 'Produkt bearbeiten'
                  : 'Produkt hinzufügen'}{' '}
                {placeProductModal.modalType === 'edit' ? 'von' : 'zu'}{' '}
                {placeProductModal.placeName}
              </h2>
              <PlaceProductForm
                initialValues={{
                  placeId: placeProductModal.placeId,
                  orderId,
                  orderItemProductId: placeProductModal.orderItemProductId,
                  product: placeProductModal.productId || '',
                  width: placeProductModal.width,
                  length: placeProductModal.length,
                  images: placeProductModal.images || ['', '', ''],
                }}
                close={close}
                modalType={placeProductModal.modalType}
                placeId={placeProductModal.placeId}
                orderId={orderId}
                placeName={placeProductModal.placeName}
                orderItemProductId={placeProductModal.orderItemProductId}
                productId={placeProductModal.productId}
                productName={placeProductModal.productName}
                products={products}
              />
            </div>
          )}
        </Modal>
      )}
      {enlargedGallery && (
        <EnlargedImageGalery
          images={enlargedGallery.images}
          onCloseAction={() => setEnlargedGallery(null)}
          currentIndex={enlargedGallery.currentIndex}
        />
      )}
      {placeProductDeleteConfirmation && (
        <Confirmation
          title='Produkt löschen'
          message={`Möchten Sie das Produkt "${placeProductDeleteConfirmation.productName}" wirklich aus dem Bereich "${placeProductDeleteConfirmation.placeName}" löschen?`}
          onConfirmAction={() =>
            handleDeletePlaceProduct(
              placeProductDeleteConfirmation.orderItemProductId,
              placeProductDeleteConfirmation.placeId,
              placeProductDeleteConfirmation.images,
            )
          }
          onCancelAction={() => setPlaceProductDeleteConfirmation(null)}
          isLoading={isDeletingPlaceProduct}
        />
      )}
    </>
  );
}
