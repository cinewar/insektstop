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
  PlaceProductErrors,
  PlaceProductField,
  placeProductSchema,
} from '../schema';
import {
  createPlaceProduct,
  deletePlace,
  deletePlaceProduct,
  updatePlaceProduct,
} from '../action';
import {notify} from '@/app/lib/notifications';

/**
  * Defines the PlaceProductFormValues type.
  * Usage: Use PlaceProductFormValues to type related values and keep data contracts consistent.
  */
type PlaceProductFormValues = {
  product?: string;
  width?: number;
  length?: number;
  images?: string[];
  placeId?: string;
  orderId?: string;
};

/**
 * Props accepted by the place-product form modal.
 */
interface PlaceProductFormProps {
  close: () => void;
  initialValues?: PlaceProductFormValues;
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
  modalType,
  products,
  initialValues,
}: PlaceProductFormProps) {
  const [values, setValues] = useState({
    product: initialValues?.product || '',
    width: initialValues?.width || '',
    length: initialValues?.length || '',
    images: initialValues?.images || ['', '', ''],
    placeId: placeId,
    orderId: orderId,
  });
  const [errors, setErrors] = useState<PlaceProductErrors>({
    product: undefined,
    width: undefined,
    length: undefined,
    images: undefined,
  });

  /**
   * Receives submitted FormData and maps values for backend actions.
   */
  async function handleAction(formData: FormData) {
    console.log(
      'Form submitted with values:',
      getPlaceProductFormValues(formData),
    );
    // TODO: Implement create/edit/delete logic based on modalType and provided IDs
    // For example:
    try {
      if (modalType === 'create') {
        const result = await createPlaceProduct(formData);
        if (!result.ok) {
          console.error('Error creating place product:', result.message);
          notify({
            type: 'error',
            message: result.message,
            title: 'Error',
          });
          return;
        }

        notify({
          type: 'success',
          message: `${result.data.name} added to place ${placeName} successfully!`,
          title: 'Success',
        });
        close();
        return;
      } else if (modalType === 'edit') {
        const result = await updatePlaceProduct(formData);
        if (!result.ok) {
          console.error('Error updating place product:', result.message);
          notify({
            type: 'error',
            message: result.message,
            title: 'Error',
          });
          return;
        }
        notify({
          type: 'success',
          message: `${result.data.name} updated in place ${placeName} successfully!`,
          title: 'Success',
        });
        close();
        return;
      }
    } catch (error) {
      console.error('Error handling form action:', error);
      notify({
        type: 'error',
        message: 'An unexpected error occurred',
        title: 'Error',
      });
      return;
    }

    notify({
      type: 'error',
      message: 'Only create mode is implemented for this form.',
      title: 'Not Implemented',
    });
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

  /**
    * Describes behavior for markImageSlotRemoved.
    * Usage: Call markImageSlotRemoved(...) where this declaration is needed in the current module flow.
    */
  function markImageSlotRemoved(index: number) {
    setValues((prev) => {
      const nextImages = [...prev.images];
      nextImages[index] = '';
      return {
        ...prev,
        images: nextImages,
      };
    });
  }

  return (
    <form className='flex flex-col gap-1 text-dark-text' action={handleAction}>
      <FormPendingOverlay />
      <input type='hidden' name='placeId' value={placeId} />
      <input type='hidden' name='orderId' value={orderId} />
      <input
        type='hidden'
        name='initialProductId'
        value={productId ?? values.product}
      />
      {values.images
        .filter((image) => image)
        .map((imageUrl, index) => (
          <input
            key={`${imageUrl}-${index}`}
            type='hidden'
            name='existingImages'
            value={imageUrl}
          />
        ))}
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
        <ImageUpload
          defaultValue={values.images[0]}
          name='images'
          onDeleteAction={() => markImageSlotRemoved(0)}
          onFileSelectedAction={() => markImageSlotRemoved(0)}
        />
        <ImageUpload
          defaultValue={values.images[1]}
          name='images'
          onDeleteAction={() => markImageSlotRemoved(1)}
          onFileSelectedAction={() => markImageSlotRemoved(1)}
        />
        <ImageUpload
          defaultValue={values.images[2]}
          name='images'
          onDeleteAction={() => markImageSlotRemoved(2)}
          onFileSelectedAction={() => markImageSlotRemoved(2)}
        />
      </div>
      <FormActions
        close={close}
        label={modalType === 'create' ? 'Create' : 'Edit'}
      />
    </form>
  );
}
