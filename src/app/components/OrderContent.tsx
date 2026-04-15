'use client';

import {useState} from 'react';
import {Button} from './Button';
import {Modal} from './Modal';
import {Input} from './Input';
import {Textarea} from './Textarea';
import {createOrder, deleteOrder, updateOrder} from '../order/action';
import {
  getOrderFormValues,
  orderSchema,
  type OrderErrors,
  type OrderField,
} from '../order/schema';
import {Search} from './Search';
import {Order} from '../../../generated/prisma/client';
import {FormPendingOverlay} from './FormPendingOverlay';
import {FormActions} from './FormActions';
import {notify} from '../lib/notifications';
import {useRouter} from 'next/navigation';
import {GlassyButton} from './GlassyButton';
import {Confirmation} from './Confirmation';
import {EDITSVG, RIGHTARROWSVG, TRASHSVG} from '../utils/svg';

/**
 * Props for rendering the order create/edit controls with an optional selected order.
 */
interface OrderContentProps {
  order?: Order;
}

/**
 * Renders the order search controls and the modal used to create or edit an order.
 */
export function OrderContent({order}: OrderContentProps) {
  const router = useRouter();
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  /**
   * Validates a single field and stores its error message when validation fails.
   */
  function validateField(field: OrderField, value: string) {
    const result = orderSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  }

  /**
   * Creates a change handler for a specific field and normalizes phone input to digits only.
   */
  function handleChange(field: OrderField) {
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
  function handleBlur(field: OrderField) {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validateField(field, e.target.value);
    };
  }

  /**
   * Validates submitted form data and dispatches either the create or update server action.
   */
  async function handleAction(formData: FormData) {
    const actionType = modalType;

    if (modalType === 'edit' && order?.orderName) {
      formData.append('orderName', order.orderName);
      formData.append('id', order.id.toString());
    }
    const submittedValues = getOrderFormValues(formData);

    const validateResult = orderSchema.safeParse(submittedValues);
    if (!validateResult.success) {
      const fieldErrors: OrderErrors = {};
      for (const issue of validateResult.error.issues) {
        const field = issue.path[0] as OrderField;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    let result: Order | null = null;
    try {
      if (modalType === 'edit') {
        result = await updateOrder(formData);
      } else {
        result = await createOrder(formData);
      }
      router.push(`/order/${result.id}`);
    } catch {
      notify({
        type: 'error',
        title: `Sipariş ${actionType === 'edit' ? 'güncelleme' : 'oluşturma'} basarisiz`,
        message: 'Lütfen tekrar deneyin.',
      });
      return;
    }

    setErrors({});
    setValues(submittedValues);
    setShowModal(false);
    notify({
      type: 'success',
      title: `Sipariş ${actionType === 'edit' ? 'güncellendi' : 'oluşturuldu'}`,
      message:
        actionType === 'edit'
          ? 'Sipariş detaylari başarıyla kaydedildi.'
          : 'Yeni sipariş başarıyla oluşturuldu.',
      duration: 4000,
    });
  }

  /**
   * Opens the modal with the selected order values prefilled for editing.
   */
  function handleEdit() {
    setValues({
      name: order?.createrName ?? '',
      email: order?.createrEmail ?? '',
      phone: order?.createrPhone ?? '',
      address: order?.createrAddress ?? '',
    });
    setShowModal(true);
    setModalType('edit');
  }

  /**
   * Deletes the currently selected order when one is available.
   */
  async function handleDelete() {
    setShowDeleteConfirmation(true);
  }

  /**
   * Confirms and deletes the selected order, then returns to the order search screen.
   */
  async function handleConfirmDelete() {
    if (order?.id) {
      setIsDeleting(true);
      try {
        await deleteOrder(order.id);
        setShowDeleteConfirmation(false);
        notify({
          type: 'success',
          title: 'Sipariş silindi',
          message: 'Seçilen sipariş başarıyla silindi.',
        });
        router.push('/order');
      } catch {
        notify({
          type: 'error',
          title: 'Sipariş silme basarisiz',
          message: 'Lütfen tekrar deneyin.',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  }

  return (
    <>
      <div className='fixed h-28 px-3 pb-2 flex shadow-md items-end w-full max-w-120 bg-secondary z-20'>
        <div className='flex items-center w-full gap-2 relative'>
          <h1 className='text-xl min-w-fit font-bold text-dark-text'>
            Oluştur veya
          </h1>
        </div>
      </div>
      <div className='flex flex-col items-center w-full  gap-4 mt-32 mb-4 px-4'>
        <label className='text-lg font-semibold -mb-3 self-start'>
          Siparişim Var
        </label>
        <Search className='' placeholder='Sipariş Ara' />
        {order && (
          <div className='bg-white w-full rounded-lg p-3 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)]'>
            <div>
              <div className='text-sm text-tertiary'>Name & Surname:</div>
              <div>{order.createrName}</div>
            </div>
            <div>
              <div className='text-sm text-tertiary'>Phone Number:</div>
              <div>{order.createrPhone}</div>
            </div>
            <div>
              <div className='text-sm text-tertiary'>Address:</div>
              <div>{order.createrAddress}</div>
            </div>
            <div>
              <div className='text-sm text-tertiary'>Email:</div>
              <div>{order.createrEmail}</div>
            </div>
            <div className='flex flex-col gap-2 bg-gray p-2 rounded-2xl mt-4'>
              <GlassyButton
                icon={RIGHTARROWSVG}
                label='Siparişi Detayı Gör'
                iconSize={32}
                className='pr-4'
                onClick={() => router.push(`/order/${order.id}`)}
              />
              <div className='flex gap-2 justify-between'>
                <GlassyButton
                  icon={EDITSVG}
                  label='Düzenle'
                  iconSize={40}
                  onClick={handleEdit}
                  className='flex-1'
                />
                <GlassyButton
                  icon={TRASHSVG}
                  label='Sil'
                  iconSize={40}
                  onClick={handleDelete}
                  className='flex-1'
                />
              </div>
            </div>
          </div>

          // <SearchDropdown
          //   onEditAction={handleEdit}
          //   onDeleteAction={handleDelete}
          //   orderId={order.id}
          // />
        )}
        {showDeleteConfirmation && (
          <Confirmation
            message='Bu siparişi silmek istediginize emin misiniz?'
            onConfirmAction={handleConfirmDelete}
            onCancelAction={() => setShowDeleteConfirmation(false)}
            isLoading={isDeleting}
          />
        )}

        <Button
          className='shining '
          onClick={() => {
            setModalType('create');
            setShowModal(true);
          }}
        >
          Sipariş Oluştur
        </Button>
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            {({close}) => (
              <div className='relative'>
                <h2 className='text-lg font-bold mb-2'>Sipariş Oluştur</h2>
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
                  <FormActions
                    close={close}
                    label={modalType === 'create' ? 'Oluştur' : 'Düzenle'}
                  />
                </form>
              </div>
            )}
          </Modal>
        )}
      </div>
    </>
  );
}
