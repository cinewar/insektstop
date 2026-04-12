import {z} from 'zod';

export const orderSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalidir'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z
    .string()
    .regex(/^\d+$/, 'Telefon numarası sadece rakamlardan olusmalidir')
    .min(6, 'Geçerli bir telefon numarası girin'),
  address: z.string().min(5, 'Adres en az 5 karakter olmalidir'),
});

/**
 * Defines the OrderFormValues type.
 * Usage: Use OrderFormValues to type related values and keep data contracts consistent.
 */
export type OrderFormValues = z.infer<typeof orderSchema>;
/**
 * Defines the OrderField type.
 * Usage: Use OrderField to type related values and keep data contracts consistent.
 */
export type OrderField = keyof OrderFormValues;
/**
 * Defines the OrderErrors type.
 * Usage: Use OrderErrors to type related values and keep data contracts consistent.
 */
export type OrderErrors = Partial<Record<OrderField, string>>;

/**
 * Describes behavior for getOrderFormValues.
 * Usage: Call getOrderFormValues(...) where this declaration is needed in the current module flow.
 */
export function getOrderFormValues(formData: FormData): OrderFormValues {
  return {
    name: (formData.get('name') as string) ?? '',
    email: (formData.get('email') as string) ?? '',
    phone: ((formData.get('phone') as string) ?? '').replace(/\D/g, ''),
    address: (formData.get('address') as string) ?? '',
  };
}
