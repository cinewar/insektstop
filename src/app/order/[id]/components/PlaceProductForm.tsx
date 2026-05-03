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
import {createPlaceProduct, updatePlaceProduct} from '../action';
import {notify} from '@/app/lib/notifications';
import {normalizeImageUrl} from '@/lib/image-url';

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
  orderItemProductId?: string;
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
  orderItemProductId?: string;
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
  orderItemProductId,
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
    orderItemProductId: initialValues?.orderItemProductId || orderItemProductId,
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
    // TODO: Implement create/edit/delete logic based on modalType and provided IDs
    // For example:
    const submittedValues = getPlaceProductFormValues(formData);
    const result = placeProductSchema.safeParse(submittedValues);
    if (!result.success) {
      const fieldErrors: PlaceProductErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as PlaceProductField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    // If validation passes, call the appropriate action based on modalType
    try {
      if (modalType === 'create') {
        const result = await createPlaceProduct(formData);
        if (!result.ok) {
          notify({
            type: 'error',
            message: result.message,
            title: 'Fehler',
          });
          return;
        }

        notify({
          type: 'success',
          message: `${result.data.name} Produkt wurde erfolgreich zum ${placeName} Bereich hinzugefügt!`,
          title: 'Erfolgreich',
        });
        close();
        return;
      } else if (modalType === 'edit') {
        const result = await updatePlaceProduct(formData);
        if (!result.ok) {
          notify({
            type: 'error',
            message: result.message,
            title: 'Fehler',
          });
          return;
        }
        notify({
          type: 'success',
          message: `${result.data.name} Produkt wurde erfolgreich im ${placeName} Bereich aktualisiert!`,
          title: 'Erfolgreich',
        });
        close();
        return;
      }
    } catch (error) {
      notify({
        type: 'error',
        message: 'Ein unerwarteter Fehler ist aufgetreten',
        title: 'Fehler',
      });
      return;
    }

    notify({
      type: 'error',
      message: 'Dieses Formular unterstützt derzeit nur den Erstellungsmodus.',
      title: 'Noch nicht implementiert',
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
        name='orderItemProductId'
        value={values.orderItemProductId}
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
          image: product.images?.[0]?.img
            ? normalizeImageUrl(product.images[0].img)
            : undefined,
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
        placeholder='Produkt auswählen'
      />
      <Input
        placeholder='Geben Sie die Breite des Produkts ein'
        label='Produktbreite (cm)'
        inputMode='numeric'
        pattern='[0-9]*'
        name='width'
        value={values.width}
        onChange={handleChange('width')}
        onBlur={handleBlur('width')}
        error={errors.width}
      />
      <Input
        placeholder='Geben Sie die Länge des Produkts ein'
        label='Produktlänge (cm)'
        name='length'
        inputMode='numeric'
        pattern='[0-9]*'
        value={values.length}
        onChange={handleChange('length')}
        onBlur={handleBlur('length')}
        error={errors.length}
      />

      <label htmlFor='' className='-mb-2'>
        Fügen Sie Ihre Bilder unten hinzu (max. 3 Bilder, optional)
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
        label={modalType === 'create' ? 'Erstellen' : 'Bearbeiten'}
      />
    </form>
  );
}
