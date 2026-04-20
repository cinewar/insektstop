'use client';
import {useState} from 'react';
import {Modal} from './Modal';
import {Footer} from './Footer';
import {FormPendingOverlay} from './FormPendingOverlay';
import {Input} from './Input';
import {FormActions} from './FormActions';
import {notify} from '../lib/notifications';
import {email} from 'zod';
import {login, sendPasswordResetEmail} from '../action';
import {useRouter} from 'next/navigation';

export default function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotValues, setForgotValues] = useState({email: ''});
  const [forgotErrors, setForgotErrors] = useState<{email?: string}>({});

  const [values, setValues] = useState({email: '', password: ''});
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);
  const openForgotPassword = () => {
    setShowLogin(false);
    setForgotPassword(true);
  };
  const closeForgotPassword = () => setForgotPassword(false);

  async function handleAction(formData: FormData) {
    try {
      const result = await login(formData);
      if (result.error) {
        notify({
          type: 'error',
          title: 'Giriş Başarısız',
          message: result.error,
        });
        return;
      }
      router.push('/products');
    } catch (error) {
      notify({
        type: 'error',
        title: 'Giriş Başarısız',
        message:
          error instanceof Error
            ? error.message
            : 'Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.',
      });
    }

    closeLogin();
  }

  function handleChange(field: 'email' | 'password') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({...prev, [field]: e.target.value}));
      setErrors((prev) => ({...prev, [field]: undefined}));
    };
  }

  function handleBlur(field: 'email' | 'password') {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (field === 'email') {
        const result = email().safeParse(value);
        setErrors((prev) => ({
          ...prev,
          email: result.success
            ? undefined
            : 'Geçerli bir e-posta adresi girin',
        }));
      } else if (field === 'password') {
        setErrors((prev) => ({
          ...prev,
          password: value ? undefined : 'Şifre gereklidir',
        }));
      }
    };
  }

  function handleForgotChange(field: 'email') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForgotValues((prev) => ({...prev, [field]: e.target.value}));
      setForgotErrors((prev) => ({...prev, [field]: undefined}));
    };
  }

  function handleForgotBlur(field: 'email') {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (field === 'email') {
        const result = email().safeParse(value);
        setForgotErrors((prev) => ({
          ...prev,
          email: result.success
            ? undefined
            : 'Geçerli bir e-posta adresi girin',
        }));
      }
    };
  }

  async function handleForgotPassword(formData: FormData) {
    try {
      await sendPasswordResetEmail(formData);
      notify({
        type: 'success',
        title: 'Şifre Sıfırlama Talebi Gönderildi',
        message:
          'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama talimatları gönderilecektir.',
      });
    } catch (error) {
      notify({
        type: 'error',
        title: 'Şifre Sıfırlama Talebi Gönderilemedi',
        message:
          error instanceof Error
            ? error.message
            : 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      closeForgotPassword();
      router.push('/changepassword');
    }
  }

  return (
    <>
      {children}
      <Footer openLogin={openLogin} />
      {showLogin && (
        <Modal onClose={closeLogin}>
          <div className='relative'>
            <h2 className='text-lg font-bold mb-2'>Giriş Yap</h2>
            <form className='flex flex-col gap-1' action={handleAction}>
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
                type='password'
                placeholder='Şifrenizi girin'
                label='Şifre'
                name='password'
                value={values.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
              />
              <button
                type='button'
                className='text-tertiary self-start'
                onClick={openForgotPassword}
              >
                Şifremi Unuttum
              </button>
              <FormActions close={closeLogin} label='Giriş' />
            </form>
          </div>
        </Modal>
      )}

      {forgotPassword && (
        <Modal onClose={closeForgotPassword}>
          <div className='relative'>
            <h2 className='text-lg font-bold mb-2'>Şifremi Unuttum</h2>
            <form className='flex flex-col gap-1' action={handleForgotPassword}>
              <FormPendingOverlay />

              <Input
                placeholder='E-posta adresinizi girin'
                label='E-posta'
                name='email'
                value={forgotValues.email}
                onChange={handleForgotChange('email')}
                onBlur={handleForgotBlur('email')}
                error={forgotErrors.email}
              />
              <FormActions close={closeForgotPassword} label='Gönder' />
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
