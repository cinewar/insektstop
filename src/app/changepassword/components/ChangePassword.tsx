'use client';

import {useState} from 'react';
import {FormActions} from '../../components/FormActions';
import {FormPendingOverlay} from '../../components/FormPendingOverlay';
import {Input} from '../../components/Input';
import {resetPassword} from '@/app/action';
import {notify} from '@/app/lib/notifications';
import {useRouter} from 'next/navigation';

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

  function handleChange(
    field: 'email' | 'verificationCode' | 'newPassword' | 'confirmPassword',
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({...prev, [field]: e.target.value}));
    };
  }

  function validateField(
    field: 'email' | 'verificationCode' | 'newPassword' | 'confirmPassword',
    value: string,
  ) {
    let error: string | undefined;
    if (field === 'email') {
      if (!value) {
        error = 'E-posta gereklidir.';
      } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        error = 'Geçerli bir e-posta girin.';
      }
    } else if (field === 'newPassword') {
      if (value.length < 6) {
        error = 'Şifre en az 6 karakter olmalıdır.';
      }
    } else if (field === 'confirmPassword') {
      if (value !== values.newPassword) {
        error = 'Şifreler eşleşmiyor.';
      }
    }
    setErrors((prev) => ({...prev, [field]: error}));
  }

  function handleBlur(
    field: 'email' | 'verificationCode' | 'newPassword' | 'confirmPassword',
  ) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      validateField(field, e.target.value);
    };
  }

  async function handleAction(formData: FormData) {
    const submittedValues = {
      email: formData.get('email') as string,
      verificationCode: formData.get('verificationCode') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate all fields before submitting
    validateField('email', submittedValues.email);
    validateField('verificationCode', submittedValues.verificationCode);
    validateField('newPassword', submittedValues.newPassword);
    validateField('confirmPassword', submittedValues.confirmPassword);

    // Check if there are any validation errors
    if (Object.values(errors).some((error) => error !== undefined)) {
      return;
    }
    try {
      await resetPassword(formData);
      notify({
        type: 'success',
        title: 'Şifre Değiştirildi',
        message: 'Şifreniz başarıyla değiştirildi. Lütfen tekrar giriş yapın.',
      });
      router.push('/');
    } catch (error) {
      notify({
        type: 'error',
        title: 'Hata',
        message:
          error instanceof Error
            ? error.message
            : 'Bir hata oluştu. Lütfen tekrar deneyin.',
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
