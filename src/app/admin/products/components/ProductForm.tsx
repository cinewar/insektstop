import {FormActions} from '@/app/components/FormActions';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {Textarea} from '@/app/components/Textarea';
import {useState} from 'react';
import {Product} from '../../../../../generated/prisma';
import {
  getProductFormValues,
  ProductErrors,
  ProductField,
  productSchema,
} from '../[id]/schema';
import {ImageUpload} from '@/app/components/ImageUpload';
import {createProduct, updateProduct} from '../action';
import {notify} from '@/app/lib/notifications';

const MAX_ACTION_PAYLOAD_BYTES = 3.5 * 1024 * 1024;

interface ProductFormProps {
  type: 'create' | 'edit';
  product?: Product;
  close?: () => void;
}

export function ProductForm({product, type, close}: ProductFormProps) {
  const [errors, setErrors] = useState<ProductErrors>({});
  const [values, setValues] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    images: product?.images || [],
  });
  // Track selected image files and kept image URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [keptImageUrls, setKeptImageUrls] = useState<string[]>(
    Array.isArray(product?.images)
      ? product.images.map((imgObj) =>
          typeof imgObj === 'string' ? imgObj : imgObj.img,
        )
      : [],
  );

  async function handleAction(formData: FormData) {
    const totalNewImageBytes = imageFiles.reduce((sum, file) => {
      return sum + file.size;
    }, 0);

    if (totalNewImageBytes > MAX_ACTION_PAYLOAD_BYTES) {
      notify({
        type: 'error',
        title: 'Fehler',
        message:
          'Bilddaten sind zu groß. Bitte weniger oder stärker komprimierte Bilder hochladen.',
      });
      return;
    }

    // Remove any existing 'images' and 'existingImages' entries
    formData.delete('images');
    formData.delete('existingImages');
    // Append kept image URLs as 'existingImages'
    keptImageUrls.forEach((url) => {
      formData.append('existingImages', url);
    });
    // Append new image files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    const submittedValues = getProductFormValues(formData);
    const result = productSchema.safeParse(submittedValues);
    if (!result.success) {
      const fieldErrors: ProductErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as ProductField;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (type === 'create') {
      const response = await createProduct(formData);
      if (!response.ok) {
        notify({type: 'error', title: 'Fehler', message: response.message});
        close?.();
      } else {
        notify({
          type: 'success',
          title: 'Erfolgreich',
          message: response.message,
        });
        close?.();
      }
    } else {
      const response = await updateProduct(formData);
      if (!response.ok) {
        notify({type: 'error', title: 'Fehler', message: response.message});
        close?.();
      } else {
        notify({
          type: 'success',
          title: 'Erfolgreich',
          message: response.message,
        });
        close?.();
      }
    }
  }

  /**
   * Validates a single field and stores its error message when validation fails.
   */
  function validateField(field: ProductField, value: string) {
    const result = productSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  /**
   * Creates a change handler for a specific field and normalizes price input to digits only.
   */
  function handleChange(field: ProductField) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'price'
          ? e.target.value.replace(/[^\d.]/g, '')
          : e.target.value;
      setValues((prev) => ({...prev, [field]: value}));
      if (field === 'price' && e.target.value !== value) {
        e.target.value = value;
      }
      if (errors[field]) {
        validateField(field, value);
      }
    };
  }

  /**
   * Creates a blur handler that validates a single field after the user leaves it.
   */
  function handleBlur(field: ProductField) {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validateField(field, e.target.value);
    };
  }

  return (
    <form className='flex flex-col gap-1' action={handleAction}>
      <FormPendingOverlay />
      {type === 'edit' && <input name='id' hidden defaultValue={product?.id} />}
      <Input
        placeholder='Geben Sie den Produktnamen ein'
        label='Produktname'
        name='name'
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={errors.name}
      />
      <Input
        placeholder='Geben Sie Ihren Preis ein'
        label='Preis'
        name='price'
        value={values.price}
        onChange={handleChange('price')}
        onBlur={handleBlur('price')}
        error={errors.price}
      />
      {/* No hidden fields, handled in handleAction */}

      <Textarea
        label='Produktbeschreibung'
        name='description'
        placeholder='Geben Sie die Produktbeschreibung ein'
        value={values.description}
        onChange={handleChange('description')}
        onBlur={handleBlur('description')}
        error={errors.description}
      />
      <label htmlFor='' className='-mb-2'>
        Fügen Sie Ihre Bilder unten hinzu (max. 15)
      </label>
      <ImageUpload
        label='Produktbilder'
        name='images'
        uploadType='multiple'
        defaultValue={keptImageUrls}
        onImagesChange={({files, urls}) => {
          setImageFiles(files);
          setKeptImageUrls(urls);
        }}
      />
      <FormActions
        close={close}
        label={type === 'edit' ? 'Bearbeiten' : 'Erstellen'}
      />
    </form>
  );
}
