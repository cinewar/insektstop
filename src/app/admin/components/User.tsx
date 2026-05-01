'use client';

import {GlassyButton} from '../../components/GlassyButton';
import {EDITSVG, LOGOUTSVG} from '../../utils/svg';
import {User as UserType} from '../../../../generated/prisma';
import {logout, updateUser} from '../action';
import {useState} from 'react';
import {Modal} from '@/app/components/Modal';
import {FormPendingOverlay} from '@/app/components/FormPendingOverlay';
import {Input} from '@/app/components/Input';
import {notify} from '@/app/lib/notifications';
import {getUserFormValues, UserErrors, UserField, userSchema} from '../schema';
import {Textarea} from '@/app/components/Textarea';
import {FormActions} from '@/app/components/FormActions';
import {ImageUpload} from '@/app/components/ImageUpload';

interface UserProps {
  user: UserType;
}

async function handleLogout() {
  await logout();
}

export function User({user}: UserProps) {
  console.log('User component rendered with user:', user); // Debug log to check user data
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState<UserErrors>({});
  const [values, setValues] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    facebook: user.facebook || '',
    instagram: user.instagram || '',
    youtube: user.youtube || '',
    heroText: user.heroText || '',
    heroImage: undefined as File | undefined,
    about: user.about || '',
  });

  /**
   * Validates a single field and stores its error message when validation fails.
   */
  function validateField(field: UserField, value: string | File | undefined) {
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

    console.log('Submitted Values:', submittedValues); // Debug log for submitted values

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

    const result = await updateUser(formData);

    if (!result.ok) {
      notify({
        type: 'error',
        title: 'Hata',
        message: result.message,
      });
      return;
    }

    setErrors({});
    setValues({
      name: submittedValues.name,
      email: submittedValues.email,
      phone: submittedValues.phone,
      address: submittedValues.address,
      facebook: submittedValues.facebook || '',
      instagram: submittedValues.instagram || '',
      youtube: submittedValues.youtube || '',
      heroText: submittedValues.heroText || '',
      heroImage: submittedValues.heroImage || undefined,
      about: submittedValues.about || '',
    });
    setOpenModal(false);
    notify({
      type: 'success',
      title: `Kullanıcı başarıyla güncellendi`,
      message: 'Kullanıcı detaylari başarıyla kaydedildi.',
    });
  }

  /**
   * Describes behavior for markImageSlotRemoved.
   * Usage: Call markImageSlotRemoved(...) where this declaration is needed in the current module flow.
   */
  function markImageSlotRemoved() {
    setValues((prev) => {
      return {
        ...prev,
        heroImage: undefined,
      };
    });
  }

  return (
    <>
      <div className='p-4'>
        <div
          className='bg-white w-full min-h-80 flex flex-col justify-between 
              rounded-lg p-3 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)]'
        >
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
                <input name='id' hidden defaultValue={user.id} />
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
                <Input
                  placeholder='Facebookunuzu girin'
                  label='Facebook'
                  name='facebook'
                  value={values.facebook}
                  onChange={handleChange('facebook')}
                  onBlur={handleBlur('facebook')}
                  error={errors.facebook}
                />
                <Input
                  placeholder='Instagramınızı girin'
                  label='Instagram'
                  name='instagram'
                  value={values.instagram}
                  onChange={handleChange('instagram')}
                  onBlur={handleBlur('instagram')}
                  error={errors.instagram}
                />
                <Input
                  placeholder='YouTube kanalınızı girin'
                  label='YouTube'
                  name='youtube'
                  value={values.youtube}
                  onChange={handleChange('youtube')}
                  onBlur={handleBlur('youtube')}
                  error={errors.youtube}
                />
                <Input
                  placeholder='Anasayfa hero metnini girin'
                  label='Hero Metni'
                  name='heroText'
                  value={values.heroText}
                  onChange={handleChange('heroText')}
                  onBlur={handleBlur('heroText')}
                  error={errors.heroText}
                />
                <Textarea
                  label='Hakkında'
                  name='about'
                  placeholder='Hakkında bilgi girin'
                  value={values.about}
                  onChange={handleChange('about')}
                  onBlur={handleBlur('about')}
                  error={errors.about}
                />
                <label htmlFor='' className='-mb-2'>
                  Görsellerinizi aşağıya ekleyin
                </label>
                <div
                  className='flex justify-between gap-1 w-40 rounded-sm border-2 border-gray-300 p-1 transition-all duration-150
                        focus-within:border-primary/50 focus-within:outline-0'
                >
                  <ImageUpload
                    defaultValue={
                      values.heroImage
                        ? URL.createObjectURL(values.heroImage)
                        : user.heroImage || undefined
                    }
                    name='heroImage'
                    onDeleteAction={() => markImageSlotRemoved()}
                    onFileSelectedAction={() => markImageSlotRemoved()}
                  />
                </div>
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
