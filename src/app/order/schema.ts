import {z} from 'zod';

export const orderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .min(6, 'Enter a valid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
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
