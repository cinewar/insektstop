import {z} from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  password: z.string().min(1, 'Passwort ist erforderlich.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type LoginField = keyof LoginFormValues;
export type LoginErrors = Partial<Record<LoginField, string>>;

export function getLoginFormValues(formData: FormData): LoginFormValues {
  return {
    email: (formData.get('email') as string) ?? '',
    password: (formData.get('password') as string) ?? '',
  };
}
