'use client';

import {useState} from 'react';
import {FormActions} from '../../components/FormActions';
import {FormPendingOverlay} from '../../components/FormPendingOverlay';
import {Input} from '../../components/Input';
import {resetPassword} from '@/app/action';
import {notify} from '@/app/lib/notifications';

export function ChangePassword() {
  const [values, setValues] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    verificationCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  function handleChange(
    field: 'verificationCode' | 'newPassword' | 'confirmPassword',
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({...prev, [field]: e.target.value}));
    };
  }

  function validateField(
    field: 'verificationCode' | 'newPassword' | 'confirmPassword',
    value: string,
  ) {
    let error: string | undefined;
    if (field === 'newPassword') {
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
    field: 'verificationCode' | 'newPassword' | 'confirmPassword',
  ) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      validateField(field, e.target.value);
    };
  }

  async function handleAction(formData: FormData) {
    const submittedValues = {
      verificationCode: formData.get('verificationCode') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate all fields before submitting
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
    <form className='flex flex-col gap-1' action={handleAction}>
      <FormPendingOverlay />

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
