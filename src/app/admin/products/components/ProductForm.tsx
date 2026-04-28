import {FormActions} from '@/app/components/FormActions';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {Textarea} from '@/app/components/Textarea';
import {useState} from 'react';
import {Product} from '../../../../../generated/prisma';
import {ProductErrors, ProductField, productSchema} from '../[id]/schema';
import {ImageUpload} from '@/app/components/ImageUpload';

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
    images: product?.images || '',
  });

  function handleAction() {
    // Handle form submission logic here
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
        field === 'price' ? e.target.value.replace(/\D/g, '') : e.target.value;
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
        placeholder='Ürün adını girin'
        label='Ürün Adı'
        name='name'
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={errors.name}
      />
      <Input
        placeholder='Fiyatınızı girin'
        label='Fiyat'
        name='price'
        value={values.price}
        onChange={handleChange('price')}
        onBlur={handleBlur('price')}
        error={errors.price}
      />

      <Textarea
        label='Ürün Açıklaması'
        name='description'
        placeholder='Ürün açıklamasını girin'
        value={values.description}
        onChange={handleChange('description')}
        onBlur={handleBlur('description')}
        error={errors.description}
      />
      <label htmlFor='' className='-mb-2'>
        Görsellerinizi aşağıya ekleyin (max 15)
      </label>
      <ImageUpload
        label='Ürün Görselleri'
        name='images'
        uploadType='multiple'
        defaultValue={
          Array.isArray(values.images)
            ? values.images.map((imgObj) =>
                typeof imgObj === 'string' ? imgObj : imgObj.img
              )
            : values.images
        }
      />
      <FormActions
        close={close}
        label={type === 'edit' ? 'Düzenle' : 'Oluştur'}
      />
    </form>
  );
}
