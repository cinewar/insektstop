'use client';

import {FormActions} from '@/app/components/FormActions';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {Select} from '@/app/components/Select';
import {useState} from 'react';
import {Product} from '../../../../../generated/prisma';
import {ImageUpload} from '@/app/components/ImageUpload';
import {
  getPlaceProductFormValues,
  PlaceProductField,
  placeProductSchema,
} from '../schema';

/**
 * Props accepted by the place-product form modal.
 */
interface PlaceProductFormProps {
  close: () => void;
  orderId: string;
  placeId?: string;
  products: Product[];
  placeName?: string;
  productId?: string;
  productName?: string;
  modalType: 'create' | 'edit' | 'delete';
}

/**
 * Handles create/edit form input for a product placed under a specific order/place.
 */
export default function PlaceProductForm({
  close,
  placeId,
  orderId,
  placeName,
  productId,
  productName,
  modalType,
  products,
}: PlaceProductFormProps) {
  const [values, setValues] = useState({
    product: '',
    width: '',
    length: '',
    images: ['', '', ''],
    placeId: placeId,
    orderId: orderId,
  });
  const [errors, setErrors] = useState({
    product: undefined,
    width: undefined,
    length: undefined,
    images: undefined,
  });

  /**
   * Receives submitted FormData and maps values for backend actions.
   */
  function handleAction(formData: FormData) {
    console.log(
      'Form submitted with values:',
      getPlaceProductFormValues(formData),
    );
    // TODO: Implement create/edit/delete logic based on modalType and provided IDs
    // For example:
    // if (modalType === 'create') {
    //   createPlaceProduct({ placeId, productId, orderId });
    // } else if (modalType === 'edit') {
    //   updatePlaceProduct({ placeId, productId, orderId });
    // } else if (modalType === 'delete') {
    //   deletePlaceProduct({ placeId, productId, orderId });
    // }
    close();
  }

  /**
   * Updates a single input field while sanitizing numeric fields.
   */
  function handleChange(field: PlaceProductField) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'width' || field === 'length'
          ? e.target.value.replace(/\D/g, '')
          : e.target.value;
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  }

  /**
   * Validates a single field with the place-product zod schema.
   */
  function validateField(field: PlaceProductField, value: string) {
    const result = placeProductSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  /**
   * Creates an onBlur handler that validates the given field.
   */
  function handleBlur(field: PlaceProductField) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      validateField(field, e.target.value);
    };
  }

  return (
    <form className='flex flex-col gap-1 text-dark-text' action={handleAction}>
      <FormPendingOverlay />
      <input type='hidden' name='placeId' value={placeId} />
      <input type='hidden' name='orderId' value={orderId} />
      <Select
        name='product'
        options={products.map((product) => ({
          value: product.id,
          label: product.name,
        }))}
        value={values.product}
        onChange={(value) =>
          setValues((prev) => ({
            ...prev,
            product: value,
          }))
        }
        onBlur={(value) => validateField('product', value)}
        error={errors.product}
        placeholder='Select a product'
      />
      <Input
        placeholder='Enter the product width'
        label='Product Width'
        inputMode='numeric'
        pattern='[0-9]*'
        name='width'
        value={values.width}
        onChange={handleChange('width')}
        onBlur={handleBlur('width')}
        error={errors.width}
      />
      <Input
        placeholder='Enter the product length'
        label='Product Length'
        name='length'
        inputMode='numeric'
        pattern='[0-9]*'
        value={values.length}
        onChange={handleChange('length')}
        onBlur={handleBlur('length')}
        error={errors.length}
      />

      <label htmlFor='' className='-mb-2'>
        Drop Your Images Below
      </label>
      <div
        className='flex justify-between gap-1 rounded-sm border-2 border-gray-300 p-1 transition-all duration-150
             focus-within:border-primary/50 focus-within:outline-0'
      >
        <ImageUpload name='images' />
        <ImageUpload name='images' />
        <ImageUpload name='images' />
      </div>
      <FormActions
        close={close}
        label={modalType === 'create' ? 'Create' : 'Edit'}
      />
    </form>
  );
}
