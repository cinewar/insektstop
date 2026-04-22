import {z} from 'zod';

export const userSchema = z.object({
  id: z.string().min(1, 'Kullanıcı ID gerekli'),
  name: z.string().min(2, 'Ad en az 2 karakter olmalidir'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z
    .string()
    .regex(/^\d+$/, 'Telefon numarası sadece rakamlardan olusmalidir')
    .min(6, 'Geçerli bir telefon numarası girin'),
  address: z.string().min(5, 'Adres en az 5 karakter olmalidir'),
});

/**
 * Defines the UserFormValues type.
 * Usage: Use UserFormValues to type related values and keep data contracts consistent.
 */
export type UserFormValues = z.infer<typeof userSchema>;
/**
 * Defines the UserField type.
 * Usage: Use UserField to type related values and keep data contracts consistent.
 */
export type UserField = keyof UserFormValues;
/**
 * Defines the UserErrors type.
 * Usage: Use UserErrors to type related values and keep data contracts consistent.
 */
export type UserErrors = Partial<Record<UserField, string>>;

/**
 * Describes behavior for getUserFormValues.
 * Usage: Call getUserFormValues(...) where this declaration is needed in the current module flow.
 */
export function getUserFormValues(formData: FormData): UserFormValues {
  return {
    id: (formData.get('id') as string) ?? '',
    name: (formData.get('name') as string) ?? '',
    email: (formData.get('email') as string) ?? '',
    phone: ((formData.get('phone') as string) ?? '').replace(/\D/g, ''),
    address: (formData.get('address') as string) ?? '',
  };
}
