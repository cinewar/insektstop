'use client';
import {useState} from 'react';
import {Modal} from './Modal';
import {Footer} from './Footer';
import {FormPendingOverlay} from './FormPendingOverlay';
import {Input} from './Input';
import {FormActions} from './FormActions';
import {notify} from '../lib/notifications';
import {
  loginSchema,
  getLoginFormValues,
  LoginField,
  LoginErrors,
} from './loginSchema';
import {
  resetPasswordSchema,
  getResetPasswordFormValues,
  ResetPasswordField,
  ResetPasswordErrors,
} from './resetPasswordSchema';
import {login, sendPasswordResetEmail} from '../action';
import {useRouter} from 'next/navigation';
import {SessionUser} from '../layout';
import {useEffect} from 'react';
import {create} from 'zustand';
import {User} from '../../../generated/prisma';

interface SessionUserState {
  sessionUser: SessionUser;
  setSessionUser: (user: SessionUser) => void;
  removeSessionUser: () => void;
}

export const useSessionUserStore = create<SessionUserState>((set) => ({
  sessionUser: null,
  setSessionUser: (user) => set({sessionUser: user}),
  removeSessionUser: () => set({sessionUser: null}),
}));

export const useUserStore = create<{
  user: User | null;
  setUser: (user: User | null) => void;
}>((set) => ({
  user: null,
  setUser: (user) => set({user}),
}));

export default function LayoutClientWrapper({
  children,
  user,
  sessionUser,
}: {
  children: React.ReactNode;
  user: User | null;
  sessionUser: SessionUser;
}) {
  // Hydrate Zustand store with sessionUser from server
  const setSessionUser = useSessionUserStore((state) => state.setSessionUser);
  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    setSessionUser(sessionUser);
    setUser(user);
  }, [sessionUser, setSessionUser, user, setUser]);
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotValues, setForgotValues] = useState<{email: string}>({
    email: '',
  });
  const [forgotErrors, setForgotErrors] = useState<ResetPasswordErrors>({});

  const [values, setValues] = useState<{email: string; password: string}>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);
  const openForgotPassword = () => {
    setShowLogin(false);
    setForgotPassword(true);
  };
  const closeForgotPassword = () => setForgotPassword(false);

  async function handleAction(formData: FormData) {
    const submittedValues = getLoginFormValues(formData);
    const validateResult = loginSchema.safeParse(submittedValues);
    if (!validateResult.success) {
      const fieldErrors: LoginErrors = {};
      for (const issue of validateResult.error.issues) {
        const field = issue.path[0] as LoginField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const result = await login(formData);
    if (result.success) {
      notify({
        type: 'success',
        title: 'Erfolgreich eingeloggt',
        message: 'Erfolgreich eingeloggt.',
      });
      router.push('/admin');
      closeLogin();
    } else {
      notify({
        type: 'error',
        title: 'Fehler beim Einloggen',
        message:
          'Bitte überprüfen Sie Ihre Angaben und versuchen Sie es erneut.',
      });
      closeLogin();
    }
  }

  function handleChange(field: LoginField) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => ({...prev, [field]: value}));
      // Validate field
      const result = loginSchema.shape[field].safeParse(value);
      setErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0].message,
      }));
    };
  }

  function handleBlur(field: LoginField) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const result = loginSchema.shape[field].safeParse(value);
      setErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0].message,
      }));
    };
  }

  function handleForgotChange(field: ResetPasswordField) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForgotValues((prev) => ({...prev, [field]: value}));
      // Validate field
      const result = resetPasswordSchema.shape[field].safeParse(value);
      setForgotErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0].message,
      }));
    };
  }

  function handleForgotBlur(field: ResetPasswordField) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const result = resetPasswordSchema.shape[field].safeParse(value);
      setForgotErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0].message,
      }));
    };
  }

  async function handleForgotPassword(formData: FormData) {
    const submittedValues = getResetPasswordFormValues(formData);
    const validateResult = resetPasswordSchema.safeParse(submittedValues);
    if (!validateResult.success) {
      const fieldErrors: ResetPasswordErrors = {};
      for (const issue of validateResult.error.issues) {
        const field = issue.path[0] as ResetPasswordField;
        fieldErrors[field] = issue.message;
      }
      setForgotErrors(fieldErrors);
      return;
    }
    setForgotErrors({});
    const result = await sendPasswordResetEmail(formData);
    if (result.success) {
      notify({
        type: 'success',
        title: 'Passwort-Zurücksetzungsanfrage gesendet',
        message:
          'Wenn diese E-Mail-Adresse registriert ist, werden Anweisungen zum Zurücksetzen des Passworts gesendet.',
      });
      closeForgotPassword();
      router.push('/changepassword');
    } else {
      notify({
        type: 'error',
        title: 'Passwort-Zurücksetzungsanfrage konnte nicht gesendet werden',
        message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      });
      closeForgotPassword();
    }
  }

  return (
    <>
      {children}
      <Footer user={user} openLogin={openLogin} />
      {showLogin && (
        <Modal onClose={closeLogin}>
          <div className='relative'>
            <h2 className='text-lg font-bold mb-2'>Einloggen</h2>
            <form className='flex flex-col gap-1' action={handleAction}>
              <FormPendingOverlay />

              <Input
                placeholder='E-Mail-Adresse eingeben'
                label='E-Mail'
                name='email'
                value={values.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
              />
              <Input
                type='password'
                placeholder='Passwort eingeben'
                label='Passwort'
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
                Passwort vergessen
              </button>
              <FormActions login close={closeLogin} label='Einloggen' />
            </form>
          </div>
        </Modal>
      )}

      {forgotPassword && (
        <Modal onClose={closeForgotPassword}>
          <div className='relative'>
            <h2 className='text-lg font-bold mb-2'>Passwort vergessen</h2>
            <form className='flex flex-col gap-1' action={handleForgotPassword}>
              <FormPendingOverlay />

              <Input
                placeholder='E-Mail-Adresse eingeben'
                label='E-Mail'
                name='email'
                value={forgotValues.email}
                onChange={handleForgotChange('email')}
                onBlur={handleForgotBlur('email')}
                error={forgotErrors.email}
              />
              <FormActions close={closeForgotPassword} label='Senden' />
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
