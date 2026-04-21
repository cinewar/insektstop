'use client';

import {useState} from 'react';
import {FormActions} from '../../components/FormActions';
import {FormPendingOverlay} from '../../components/FormPendingOverlay';
import {Input} from '../../components/Input';
import {resetPassword} from '@/app/action';
import {notify} from '@/app/lib/notifications';
import {useRouter} from 'next/navigation';
import {
  ChangePasswordField,
  changePasswordSchema,
  getChangePasswordFormValues,
} from '../schema';

export function ChangePassword() {
  const router = useRouter();
  const [values, setValues] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    verificationCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  function handleChange(field: ChangePasswordField) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({...prev, [field]: e.target.value}));
    };
  }

  function validateFields(field: ChangePasswordField, value: string) {
    const result = changePasswordSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  function handleBlur(field: ChangePasswordField) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      validateFields(field, e.target.value);
    };
  }

  async function handleAction(formData: FormData) {
    const submittedValues = getChangePasswordFormValues(formData);
    const validationResult = changePasswordSchema.safeParse(submittedValues);

    if (!validationResult.success) {
      const fieldErrors: Partial<Record<ChangePasswordField, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as ChangePasswordField;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const result = await resetPassword(formData);
    if (result.success) {
      notify({
        type: 'success',
        title: 'Şifre Değiştirildi',
        message: 'Şifreniz başarıyla değiştirildi. Lütfen tekrar giriş yapın.',
      });
      router.push('/');
    } else {
      notify({
        type: 'error',
        title: 'Hata',
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    }
  }
  return (
    <form
      className='flex flex-col gap-1 bg-white p-4 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)] rounded-lg'
      action={handleAction}
    >
      <FormPendingOverlay />

      <Input
        placeholder='E-posta adresinizi girin'
        label='E-posta'
        name='email'
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={errors.email}
      />
      <Input
        placeholder='Aktivasyon kodunu girin'
        label='Aktivasyon Kodu'
        name='verificationCode'
        value={values.verificationCode}
        onChange={handleChange('verificationCode')}
        onBlur={handleBlur('verificationCode')}
        error={errors.verificationCode}
      />
      <Input
        type='password'
        placeholder='Yeni şifrenizi girin'
        label='Yeni Şifre'
        name='newPassword'
        value={values.newPassword}
        onChange={handleChange('newPassword')}
        onBlur={handleBlur('newPassword')}
        error={errors.newPassword}
      />
      <Input
        type='password'
        placeholder='Şifrenizi tekrar girin'
        label='Şifreyi Onayla'
        name='confirmPassword'
        value={values.confirmPassword}
        onChange={handleChange('confirmPassword')}
        onBlur={handleBlur('confirmPassword')}
        error={errors.confirmPassword}
      />

      <FormActions label='Şifreyi Değiştir' />
    </form>
  );
}
