'use client';

import {Button} from '@/app/components/Button';
import {FormActions} from '@/app/components/FormActions';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {Modal} from '@/app/components/Modal';
import {Textarea} from '@/app/components/Textarea';
import {useState} from 'react';
import {PlaceForm} from './PlaceForm';

interface PlaceContentProps {
  orderId: string;
}

export function PlaceContent({orderId}: PlaceContentProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [formType, setFormType] = useState<'place' | 'product'>('place');

  const title =
    formType === 'place'
      ? modalType === 'create'
        ? 'Create a Place & Room'
        : 'Edit a Place & Room'
      : modalType === 'create'
        ? 'Create a Product'
        : 'Edit a Product';
  return (
    <div className='flex items-center justify-center'>
      <Button
        className='shining'
        onClick={() => {
          setModalType('create');
          setShowModal(true);
        }}
      >
        Add Place & Room
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
                <div>Product Form Coming Soon...</div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
