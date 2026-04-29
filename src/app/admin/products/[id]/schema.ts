import {z} from 'zod';

export const productSchema = z.object({
  id: z.string().min(1, 'Ürün ID gerekli').optional(),
  name: z.string().min(2, 'Ad en az 2 karakter olmalidir'),
  description: z.string().min(5, 'Açıklama en az 5 karakter olmalidir'),
  price: z
    .string()
    .regex(
      /^\d+(\.\d+)?$/,
      'Fiyat sadece rakamlardan olusmalidir ve sadece nokta içerebilir',
    )
    .min(1, 'Geçerli bir fiyat girin'),
  images: z
    .array(z.instanceof(File))
    .max(15, 'En fazla 15 görsel yükleyebilirsiniz')
    .refine((files) => files.every((file) => file.size > 0), {
      message: 'Lütfen geçerli görsel dosyalari seçin',
    }),
});

/**
 * Defines the ProductFormValues type.
 * Usage: Use ProductFormValues to type related values and keep data contracts consistent.
 */
export type ProductFormValues = z.infer<typeof productSchema>;
/**
 * Defines the ProductField type.
 * Usage: Use ProductField to type related values and keep data contracts consistent.
 */
export type ProductField = keyof ProductFormValues;
/**
 * Defines the ProductErrors type.
 * Usage: Use ProductErrors to type related values and keep data contracts consistent.
 */
export type ProductErrors = Partial<Record<ProductField, string>>;

/**
 * Describes behavior for getProductFormValues.
 * Usage: Call getProductFormValues(...) where this declaration is needed in the current module flow.
 */
export function getProductFormValues(formData: FormData): ProductFormValues {
  return {
    id: (formData.get('id') as string) ?? undefined,
    name: (formData.get('name') as string) ?? '',
    description: (formData.get('description') as string) ?? '',
    price: (formData.get('price') as string) ?? '',
    images: formData
      .getAll('images')
      .filter(
        (entry): entry is File => entry instanceof File && entry.size > 0,
      ),
  };
}
