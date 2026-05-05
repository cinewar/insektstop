import {z} from 'zod';

export const userSchema = z.object({
  id: z.string().min(1, 'Benutzer-ID erforderlich'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z
    .string()
    .regex(/^\d+$/, 'Telefonnummer darf nur aus Ziffern bestehen')
    .min(6, 'Bitte geben Sie eine gültige Telefonnummer ein'),
  address: z.string().min(5, 'Adresse muss mindestens 5 Zeichen lang sein'),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  heroText: z
    .string()
    .min(10, 'Hero-Text muss mindestens 10 Zeichen lang sein'),
  heroImage: z.instanceof(File),
  about: z.string().min(10, 'Über mich muss mindestens 10 Zeichen lang sein'),
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
    facebook: (formData.get('facebook') as string) ?? '',
    instagram: (formData.get('instagram') as string) ?? '',
    youtube: (formData.get('youtube') as string) ?? '',
    heroText: (formData.get('heroText') as string) ?? '',
    heroImage: (formData.get('heroImage') as File) ?? undefined,
    about: (formData.get('about') as string) ?? '',
  };
}
