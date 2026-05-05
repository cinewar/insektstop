'use client';

import {ProductImageGallery} from '@/app/components/ProductImageGallery';
import {Product} from '../../../../../../generated/prisma';
import {GlassyButton} from '@/app/components/GlassyButton';
import {CLOSESVG, EDITSVG, LOGOUTSVG} from '@/app/utils/svg';
import {Modal} from '@/app/components/Modal';
import {ProductForm} from '../../components/ProductForm';
import {useState} from 'react';
import {Confirmation} from '@/app/components/Confirmation';
import {deleteProduct} from '../../action';
import {notify} from '@/app/lib/notifications';
import {useRouter} from 'next/navigation';

interface AdminProductContentProps {
  product: Product;
}

export function AdminProductContent({product}: AdminProductContentProps) {
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);

    const response = await deleteProduct(product.id);
    if (!response.ok) {
      notify({
        title: 'Fehler beim Löschen des Produkts',
        message: response.message,
        type: 'error',
      });
    } else {
      notify({
        title: 'Das Produkt wurde erfolgreich gelöscht.',
        message: response.message,
        type: 'success',
      });
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      router.push('/admin/products');
    }
  }
  return (
    <>
      <div className='text-dark-text flex flex-col bg-secondary mt-1'>
        <ProductImageGallery images={product.images} />
        <div
          className='bg-tertiary max-w-fit ml-2 text-white font-semibold px-2
                text-lg rounded-full -translate-y-10'
        >
          £{product.price}
        </div>
        <div className='p-2 -mt-6'>
          <p className='text-base sm:text-lg leading-tight'>
            {product.description}
          </p>
        </div>
        <div className='flex gap-2 bg-gray p-1 rounded-full max-w-fit self-end mb-8 mt-6 mr-2'>
          <GlassyButton
            icon={CLOSESVG}
            label='Sil'
            iconSize={32}
            onClick={() => setShowDeleteConfirmation(true)}
            className='gap-3 [&>svg]:stroke-red'
          />
          <GlassyButton
            icon={EDITSVG}
            label='Bearbeiten'
            iconSize={40}
            onClick={() => setShowModal(true)}
            className='gap-3 '
          />
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='text-lg font-bold mb-2'>Produkt bearbeiten</h2>
              <ProductForm close={close} type='edit' product={product} />
            </div>
          )}
        </Modal>
      )}
      {showDeleteConfirmation && (
        <Confirmation
          message='Sind Sie sicher, dass Sie dieses Produkt löschen möchten?'
          onConfirmAction={handleConfirmDelete}
          onCancelAction={() => setShowDeleteConfirmation(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
