'use client';

import {Button} from '@/app/components/Button';
import {FormActions} from '@/app/components/FormActions';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {Modal} from '@/app/components/Modal';
import {Textarea} from '@/app/components/Textarea';
import {useState} from 'react';
import {PlaceForm} from './PlaceForm';

/**
 * Defines the PlaceContentProps interface.
 * Usage: Implement or consume PlaceContentProps when exchanging this structured contract.
 */
interface PlaceContentProps {
  orderId: string;
}

/**
 * Describes behavior for PlaceContent.
 * Usage: Call PlaceContent(...) where this declaration is needed in the current module flow.
 */
export function PlaceContent({orderId}: PlaceContentProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [formType, setFormType] = useState<'place' | 'product'>('place');

  const title =
    formType === 'place'
      ? modalType === 'create'
        ? 'Mekan ve Oda Oluştur'
        : 'Mekan ve Oda Düzenle'
      : modalType === 'create'
        ? 'Urun Oluştur'
        : 'Urun Düzenle';
  return (
    <div className='flex items-center justify-center'>
      <Button
        className='shining'
        onClick={() => {
          setModalType('create');
          setShowModal(true);
        }}
      >
        Mekan ve Oda Ekle
      </Button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='text-lg font-bold mb-2'>{title}</h2>
              {formType === 'place' ? (
                <PlaceForm
                  close={close}
                  modalType={modalType}
                  orderId={orderId}
                />
              ) : (
                // <ProductForm close={close} modalType={modalType} />
                <div>Urun formu yakında...</div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
