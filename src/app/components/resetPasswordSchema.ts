import {z} from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordField = keyof ResetPasswordFormValues;
export type ResetPasswordErrors = Partial<Record<ResetPasswordField, string>>;

export function getResetPasswordFormValues(
  formData: FormData,
): ResetPasswordFormValues {
  return {
    email: (formData.get('email') as string) ?? '',
  };
}
