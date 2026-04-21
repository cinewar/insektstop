import {z} from 'zod';

export const changePasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  verificationCode: z.string().min(1, 'Doğrulama kodu gereklidir'),
  newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

/**
 * Defines the ChangePasswordFormValues type.
 * Usage: Use ChangePasswordFormValues to type related values and keep data contracts consistent.
 */
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
/**
 * Defines the ChangePasswordField type.
 * Usage: Use ChangePasswordField to type related values and keep data contracts consistent.
 */
export type ChangePasswordField = keyof ChangePasswordFormValues;
/**
 * Defines the ChangePasswordErrors type.
 * Usage: Use ChangePasswordErrors to type related values and keep data contracts consistent.
 */
export type ChangePasswordErrors = Partial<Record<ChangePasswordField, string>>;

/**
 * Describes behavior for getChangePasswordFormValues.
 * Usage: Call getChangePasswordFormValues(...) where this declaration is needed in the current module flow.
 */
export function getChangePasswordFormValues(
  formData: FormData,
): ChangePasswordFormValues {
  return {
    email: (formData.get('email') as string) ?? '',
    verificationCode: (formData.get('verificationCode') as string) ?? '',
    newPassword: (formData.get('newPassword') as string) ?? '',
    confirmPassword: (formData.get('confirmPassword') as string) ?? '',
  };
}
