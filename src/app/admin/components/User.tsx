'use client';

import {GlassyButton} from '../../components/GlassyButton';
import {EDITSVG, LOGOUTSVG} from '../../utils/svg';
import {User as UserType} from '../../../../generated/prisma';
import {logout} from '../action';
import {useState} from 'react';
import {Modal} from '@/app/components/Modal';
import {EditUserForm} from './EditUserForm';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {notify} from '@/app/lib/notifications';
import {getUserFormValues, UserErrors, UserField, userSchema} from '../schema';
import {Textarea} from '@/app/components/Textarea';
import {FormActions} from '@/app/components/FormActions';

interface UserProps {
  user: UserType;
}

async function handleLogout() {
  await logout();
}

export function User({user}: UserProps) {
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState<UserErrors>({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  /**
   * Validates a single field and stores its error message when validation fails.
   */
  function validateField(field: UserField, value: string) {
    const result = userSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  /**
   * Creates a change handler for a specific field and normalizes phone input to digits only.
   */
  function handleChange(field: UserField) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
      setValues((prev) => ({...prev, [field]: value}));
      if (field === 'phone' && e.target.value !== value) {
        e.target.value = value;
      }
      if (errors[field]) {
        validateField(field, value);
      }
    };
  }

  /**
   * Creates a blur handler that validates a single field after the user leaves it.
   */
  function handleBlur(field: UserField) {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validateField(field, e.target.value);
    };
  }

  /**
   * Validates submitted form data and dispatches either the create or update server action.
   */
  async function handleAction(formData: FormData) {
    const submittedValues = getUserFormValues(formData);

    const validateResult = userSchema.safeParse(submittedValues);
    if (!validateResult.success) {
      const fieldErrors: UserErrors = {};
      for (const issue of validateResult.error.issues) {
        const field = issue.path[0] as UserField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    // const result = await updateOrder(formData);

    setErrors({});
    setValues(submittedValues);
    setOpenModal(false);
    // notify({
    //   type: 'success',
    //   title: `Sipariş ${actionType === 'edit' ? 'güncellendi' : 'oluşturuldu'}`,
    //   message:
    //     actionType === 'edit'
    //       ? 'Sipariş detaylari başarıyla kaydedildi.'
    //       : 'Yeni sipariş başarıyla oluşturuldu.',
    //   duration: 4000,
    // });
  }
  return (
    <>
      <div className='p-4'>
        <div className='bg-white w-full min-h-80 flex flex-col justify-between rounded-lg p-3 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)]'>
          <div>
            <div className='text-sm text-tertiary'>Name & Surname:</div>
            <div>{user.name}</div>
          </div>
          <div>
            <div className='text-sm text-tertiary'>Phone Number:</div>
            <div>{user.phone}</div>
          </div>
          <div>
            <div className='text-sm text-tertiary'>Address:</div>
            <div>{user.address}</div>
          </div>
          <div>
            <div className='text-sm text-tertiary'>Email:</div>
            <div>{user.email}</div>
          </div>
          <div className='flex flex-col gap-2 bg-gray p-2 rounded-full mt-4'>
            <div className='flex gap-2 justify-between'>
              <GlassyButton
                icon={EDITSVG}
                label='Düzenle'
                iconSize={40}
                onClick={() => setOpenModal(true)}
                className='flex-1'
              />
              <GlassyButton
                icon={LOGOUTSVG}
                label='Çıkış Yap'
                iconSize={40}
                onClick={handleLogout}
                className='flex-1'
              />
            </div>
          </div>
        </div>
      </div>
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          {({close}) => (
            <div className='relative'>
              <h2 className='text-lg font-bold mb-2'>Admin Düzenle</h2>
              <form className='flex flex-col gap-1' action={handleAction}>
                <FormPendingOverlay />
                <Input
                  placeholder='Adinizi ve soyadınızi girin'
                  label='Ad Soyad'
                  name='name'
                  value={values.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={errors.name}
                />
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
                  placeholder='Telefon numaranizi girin'
                  label='Telefon Numarası'
                  name='phone'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  autoComplete='tel'
                  value={values.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={errors.phone}
                />
                <Textarea
                  label='Adres'
                  name='address'
                  placeholder='Adresinizi girin'
                  value={values.address}
                  onChange={handleChange('address')}
                  onBlur={handleBlur('address')}
                  error={errors.address}
                />
                <FormActions close={close} label='Düzenle' />
              </form>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
